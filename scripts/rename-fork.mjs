#!/usr/bin/env node
// scripts/rename-fork.mjs
//
// Idempotent openclaw -> marketingclaw fork rename. Plain Node 22+, zero deps.
// Operates ONLY on `git ls-files` output. Never touches node_modules (a tracked
// self-referential symlink there crashes git on Windows). Never touches the pnpm
// patch file. Protects external @openclaw/* deps and a small allowlist of URLs/specs.
//
// Modes:
//   (default)          --dry-run : report only, no changes
//   --write            apply changes
//   --audit            grep for residual openclaw, fail (exit 1) on any non-allowlisted hit
//
// Pass selection (apply to --write and --dry-run):
//   --paths-only       only Pass A (git mv path renames)
//   --content-only     only Pass B (in-file content replacement)
//   (neither)          both passes
//
// Passes:
//   Pass A: rename tracked files whose path matches /openclaw/i via `git mv`
//           (file-by-file, full-path transform; deepest-first).
//   Pass B: ordered content replacement with protect->replace->restore sentinels.

import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

const REPO = process.cwd();
const argv = new Set(process.argv.slice(2));
const flag = (f) => argv.has(f);

const MODE_WRITE = flag("--write");
const MODE_AUDIT = flag("--audit");
const PATHS_ONLY = flag("--paths-only");
const CONTENT_ONLY = flag("--content-only");
const DO_PATHS = !CONTENT_ONLY;
const DO_CONTENT = !PATHS_ONLY;

// Sentinel delimiter: a NUL char. Text files contain no NUL (binary sniff excludes
// them), so NUL-delimited placeholders are collision-free and add no visible chars.
// Built via fromCharCode so this source file stays clean ASCII (no literal NUL).
const NUL = String.fromCharCode(0);
const RESTORE_RE = new RegExp(NUL + "RF(\\d+)" + NUL, "g");

// ----------------------------------------------------------------------------
// git helpers
// ----------------------------------------------------------------------------
function git(args) {
  return execFileSync("git", args, { cwd: REPO, encoding: "utf8", maxBuffer: 1 << 30 });
}
function gitLsFilesWithMode() {
  // returns [{mode, path}]
  const out = execFileSync("git", ["ls-files", "-s", "-z"], {
    cwd: REPO,
    encoding: "utf8",
    maxBuffer: 1 << 30,
  });
  const rows = [];
  for (const rec of out.split(NUL)) {
    if (!rec) {
      continue;
    }
    // format: <mode> <sha> <stage>\t<path>
    const tab = rec.indexOf("\t");
    if (tab < 0) {
      continue;
    }
    const meta = rec.slice(0, tab).split(" ");
    const p = rec.slice(tab + 1);
    rows.push({ mode: meta[0], path: p });
  }
  return rows;
}

// ----------------------------------------------------------------------------
// exclusions
// ----------------------------------------------------------------------------
const PATCH_FS_SAFE = "patches/@openclaw__fs-safe@0.4.1.patch";

function isNodeModules(p) {
  return /(^|\/)node_modules(\/|$)/.test(p);
}
// Path-rename exclusions
function isPathExcluded(p) {
  if (isNodeModules(p)) {
    return true;
  }
  if (p === PATCH_FS_SAFE) {
    return true;
  }
  return false;
}
// Content exclusions (skip file entirely)
function isContentExcluded(p) {
  if (isNodeModules(p)) {
    return true;
  }
  if (p === "scripts/rename-fork.mjs") {
    return true; // never rewrite this tool's own rules
  }
  const base = p.split("/").pop();
  if (base === "LICENSE") {
    return true;
  }
  if (base === "THIRD_PARTY_NOTICES.md") {
    return true;
  }
  if (p === "UPSTREAM-CHANGELOG.md") {
    return true;
  }
  // Fork-origin attribution must name the real upstream project; don't rewrite it.
  if (p === "CHANGELOG.md") {
    return true;
  }
  // README.md/SECURITY.md/VISION.md are NOT whole-file excluded: they stay subject to
  // audit/rewrite for everything except the narrow attribution-URL KEEP rule inside
  // makeContentTransformer, so future upstream-link creep in these files still gets
  // caught.
  // Explains that Ansible deployment installs the real upstream engine; must name it.
  if (p === "docs/install/ansible.md") {
    return true;
  }
  // Dedicated legacy-name compat table: LEGACY_PROJECT_NAMES must keep the literal
  // "openclaw" fallback value. Mirrors the fileAllowed entry for this same file.
  if (p === "src/compat/legacy-names.ts") {
    return true;
  }
  // Vite aliases resolving to the REAL external @openclaw/libterminal and
  // @openclaw/uirouter npm packages. Mirrors the fileAllowed entry for this same file.
  if (p === "ui/vite.config.ts") {
    return true;
  }
  // Upgrade-survivor KEEP rule: this file's whole purpose is querying/returning
  // versions of the still-published upstream "openclaw" npm package (no marketingclaw
  // npm release exists yet).
  if (p === "scripts/lib/release-upgrade-baseline.mjs") {
    return true;
  }
  // Compat contract: asserts the legacy "openclaw" fallback manifest key stays literal.
  if (p === "src/compat/legacy-names.test.ts") {
    return true;
  }
  if (base === "pnpm-lock.yaml") {
    return true;
  }
  if (base === "npm-shrinkwrap.json") {
    return true;
  }
  if (p.startsWith("patches/")) {
    return true;
  }
  if (p.startsWith("apps/android/THIRD_PARTY_LICENSES/")) {
    return true;
  }
  return false;
}

const BINARY_EXT = new Set([
  "png",
  "jpg",
  "jpeg",
  "gif",
  "ico",
  "icns",
  "webp",
  "heic",
  "woff",
  "woff2",
  "ttf",
  "otf",
  "sqlite",
  "zip",
  "jar",
  "pdf",
  "mp3",
  "wav",
  "keystore",
]);
function looksBinary(p, buf) {
  const ext = (p.split(".").pop() || "").toLowerCase();
  if (BINARY_EXT.has(ext)) {
    return true;
  }
  // NUL sniff of first 8KB
  const n = Math.min(buf.length, 8192);
  for (let i = 0; i < n; i++) {
    if (buf[i] === 0) {
      return true;
    }
  }
  return false;
}

// ----------------------------------------------------------------------------
// workspace package suffixes (computed at runtime; determines which @openclaw/<name>
// are workspace scopes to rename vs external deps to keep)
// ----------------------------------------------------------------------------
function computeWorkspaceSuffixes(rows) {
  const suffixes = new Set();
  const isWorkspacePkgJson = (p) =>
    p === "package.json" ||
    p === "ui/package.json" ||
    /^packages\/[^/]+\/package\.json$/.test(p) ||
    /^extensions\/[^/]+\/package\.json$/.test(p) ||
    /^examples\/[^/]+\/package\.json$/.test(p);
  for (const { path: p } of rows) {
    if (!isWorkspacePkgJson(p)) {
      continue;
    }
    try {
      const j = JSON.parse(readFileSync(path.join(REPO, p), "utf8"));
      const name = typeof j.name === "string" ? j.name : "";
      const m = /^@(?:openclaw|marketingclaw)\/(.+)$/.exec(name);
      if (m) {
        suffixes.add(m[1]);
      }
    } catch {
      /* ignore unparseable */
    }
  }
  return suffixes;
}

// ----------------------------------------------------------------------------
// PATH transform (case-aware, all segments)
// ----------------------------------------------------------------------------
function transformString(s) {
  // disjoint 8-char casings, applied sequentially
  return s
    .replace(/OpenClaw/g, "MarketingClaw")
    .replace(/OPENCLAW/g, "MARKETINGCLAW")
    .replace(/openClaw/g, "marketingClaw")
    .replace(/Openclaw/g, "Marketingclaw")
    .replace(/openclaw/g, "marketingclaw");
}

// ----------------------------------------------------------------------------
// CONTENT transform (protect -> targeted -> generic -> restore)
// ----------------------------------------------------------------------------
function makeContentTransformer(workspaceSuffixes, counters) {
  const bump = (k, n = 1) => {
    if (counters) {
      counters[k] = (counters[k] || 0) + n;
    }
  };
  return function transformContent(text, filePath) {
    let result = text;
    const store = [];
    const protect = (s) => {
      const id = store.length;
      store.push(s);
      return NUL + "RF" + id + NUL;
    };

    // ---- PROTECT (KEEP as-is) ----
    // legacy plugin-manifest filename, accepted as a fallback by the loaders on purpose
    // (mirrors the matching strip rule in runAudit's stripAllowed).
    result = result.replace(/openclaw\.plugin\.json/g, (m) => {
      bump("KEEP openclaw.plugin.json (legacy plugin-manifest filename)");
      return protect(m);
    });
    // @openclaw/<name> where <name> is NOT a workspace package
    result = result.replace(/@openclaw\/([A-Za-z0-9._-]+)/g, (m, name) => {
      if (workspaceSuffixes.has(name)) {
        return m; // workspace scope -> let generic rename
      }
      bump("KEEP @openclaw/<external>");
      return protect(m);
    });
    // pnpm patch key form (double underscore, no slash)
    result = result.replace(/@openclaw__fs-safe/g, (m) => {
      bump("KEEP @openclaw__fs-safe (patch key)");
      return protect(m);
    });
    // published npm version specs of the real upstream package (KEEP).
    result = result.replace(/openclaw@latest/g, (m) => {
      bump("KEEP openclaw@latest");
      return protect(m);
    });
    result = result.replace(/openclaw@\d[A-Za-z0-9._-]*/g, (m) => {
      bump("KEEP openclaw@<digit-version>");
      return protect(m);
    });
    // git SHA specs (7+ hex) pin the real upstream package to a commit.
    result = result.replace(/openclaw@[0-9a-f]{7,}\b/g, (m) => {
      bump("KEEP openclaw@<sha>");
      return protect(m);
    });
    // dist-tags / ranges / version placeholders (alpha, beta, next, canary,
    // extended-stable, *, X.Y.Z, ...) all reference the real upstream package.
    // Fixture emails/hosts (openclaw@gmail.com, @example.com, @localhost) are NOT
    // package refs -> let the generic rule rename them.
    result = result.replace(/openclaw@([A-Za-z*][A-Za-z0-9._*+^~-]*)/g, (m, spec) => {
      const isEmailOrHost =
        /\.(?:com|org|net|io|ai|dev|edu|gov|co|eg)\b/i.test(spec) || /^localhost$/i.test(spec);
      if (isEmailOrHost) {
        return m; // rename via generic rule
      }
      bump("KEEP openclaw@<dist-tag/placeholder>");
      return protect(m);
    });
    // Upgrade-survivor KEEP rule: the literal regex source that strips an "openclaw@"
    // version prefix off a still-published upstream package spec.
    result = result.replace(/\/\^openclaw@\//g, (m) => {
      bump("KEEP /^openclaw@/ (upgrade-survivor prefix-strip regex)");
      return protect(m);
    });

    // ---- KEEP external-package IDENTIFIERS/SUBPATHS that consuming code imports
    // FROM upstream deps. These live in our source in upstream OpenClaw casing on
    // purpose (they must match the external export names byte-for-byte); the generic
    // rules below would otherwise re-break them on a rerun.
    //
    // @openclaw/crabline re-exports (consumed in extensions/qa-lab): value+type
    // identifiers (OpenClawCrabline*), SCREAMING consts (OPENCLAW_CRABLINE_*), and
    // the adapter param key `openclawConfig`.
    result = result.replace(/OpenClawCrabline[A-Za-z0-9]*/g, (m) => {
      bump("KEEP OpenClawCrabline<identifier> (external @openclaw/crabline export)");
      return protect(m);
    });
    result = result.replace(/OPENCLAW_CRABLINE[A-Z0-9_]*/g, (m) => {
      bump("KEEP OPENCLAW_CRABLINE<identifier> (external @openclaw/crabline export)");
      return protect(m);
    });
    result = result.replace(/openclawConfig\b/g, (m) => {
      bump("KEEP openclawConfig (external crabline adapter param)");
      return protect(m);
    });
    // tokenjuice "openclaw" host: the exports-map subpath + the factory it exports
    // (aliased locally in extensions/tokenjuice/runtime-api.ts).
    result = result.replace(/tokenjuice\/openclaw/g, (m) => {
      bump("KEEP tokenjuice/openclaw (external subpath)");
      return protect(m);
    });
    result = result.replace(/TokenjuiceOpenClaw[A-Za-z0-9]*/g, (m) => {
      bump("KEEP TokenjuiceOpenClaw<identifier> (external tokenjuice export)");
      return protect(m);
    });
    // DSSE payloadType for hosted plugin-catalog feed envelopes: a wire-protocol
    // string signed by upstream ClawHub and embedded in the signature PAE. Renaming
    // it would reject every real upstream-signed feed (protocol constant, not brand).
    result = result.replace(/openclaw\.official-external-plugin-catalog-feed\.v1/g, (m) => {
      bump("KEEP openclaw.official-external-plugin-catalog-feed.v1 (DSSE payload type)");
      return protect(m);
    });
    // Fork-attribution KEEP, scoped to these 3 files only: the exact main-repo URL is
    // cited as "this project is a fork of X" attribution, not a self-reference, so
    // protect it from the P4/P5 self-reference rewrite below. Everything else in these
    // files (and this exact URL in every OTHER file) stays subject to normal rename +
    // audit, so future upstream-link creep elsewhere still gets caught.
    if (filePath === "README.md" || filePath === "SECURITY.md" || filePath === "VISION.md") {
      result = result.replace(
        /(?:github\.com|raw\.githubusercontent\.com)\/openclaw\/openclaw(?![A-Za-z0-9-])/g,
        (m) => {
          bump("KEEP <gh>/openclaw/openclaw (fork-attribution sentence)");
          return protect(m);
        },
      );
    }

    // ---- TARGETED URL map: ONLY the exact main repo openclaw/openclaw maps to
    // the fork. A trailing [A-Za-z0-9-] means a different repo (openclaw-ansible,
    // openclaw-windows-node, ...) which is kept below. Runs BEFORE the URL-KEEP.
    result = result.replace(
      /raw\.githubusercontent\.com\/openclaw\/openclaw(?![A-Za-z0-9-])/g,
      () => {
        bump("P4 raw.githubusercontent.com/openclaw/openclaw");
        return "raw.githubusercontent.com/promisingcoder/marketingclaw";
      },
    );
    result = result.replace(/github\.com\/openclaw\/openclaw(?![A-Za-z0-9-])/g, () => {
      bump("P5 github.com/openclaw/openclaw");
      return "github.com/promisingcoder/marketingclaw";
    });
    // KEEP every other upstream repo URL (real attribution: fs-safe, proxyline,
    // skills, nix-openclaw, openclaw-ansible, crawl tools, example-plugin, ...).
    result = result.replace(
      /(?:github\.com|raw\.githubusercontent\.com)\/openclaw\/[A-Za-z0-9._-]+/g,
      (m) => {
        bump("KEEP <gh>/openclaw/<upstream-repo>");
        return protect(m);
      },
    );
    // KEEP the deepwiki page for the upstream repo (full path).
    result = result.replace(/deepwiki\.com\/openclaw(?:\/openclaw)?/g, (m) => {
      bump("KEEP deepwiki.com/openclaw");
      return protect(m);
    });

    // ---- TARGETED (before generic) ----
    // mDNS service label: match bare `openclaw-gw` too (advertiser.ts uses the
    // unprefixed form `type: "openclaw-gw"`, which the bonjour lib wraps into
    // `_openclaw-gw._tcp`). `marketingclaw-gw` would be 16 chars and break the
    // 15-char DNS-SD service-type limit, so collapse to `marketclaw-gw` (13).
    result = result.replace(/openclaw-gw/g, () => {
      bump("P8 openclaw-gw -> marketclaw-gw (mDNS 15-char limit)");
      return "marketclaw-gw";
    });
    result = result.replace(/ai\.openclawfoundation/g, () => {
      bump("P9 ai.openclawfoundation -> ai.marketingclaw");
      return "ai.marketingclaw";
    });
    result = result.replace(/security@openclaw\.ai/g, () => {
      bump("P10 security@openclaw.ai -> fork contact");
      return "nagyyousef323@gmail.com";
    });

    // ---- GENERIC (ordered, disjoint casings) ----
    result = result.replace(/OpenClaw/g, () => {
      bump("G OpenClaw");
      return "MarketingClaw";
    });
    result = result.replace(/OPENCLAW/g, () => {
      bump("G OPENCLAW");
      return "MARKETINGCLAW";
    });
    result = result.replace(/openClaw/g, () => {
      bump("G openClaw");
      return "marketingClaw";
    });
    result = result.replace(/Openclaw/g, () => {
      bump("G Openclaw");
      return "Marketingclaw";
    });
    result = result.replace(/openclaw/g, () => {
      bump("G openclaw");
      return "marketingclaw";
    });

    // ---- RESTORE ----
    result = result.replace(RESTORE_RE, (m, id) => store[Number(id)]);
    return result;
  };
}

// ----------------------------------------------------------------------------
// PASS A: path renames
// ----------------------------------------------------------------------------
function computePathRenames(rows) {
  const renames = [];
  for (const { mode, path: p } of rows) {
    if (mode === "120000") {
      continue; // never move symlinks
    }
    if (isPathExcluded(p)) {
      continue;
    }
    if (!/openclaw/i.test(p)) {
      continue;
    }
    const np = transformString(p);
    if (np !== p) {
      renames.push([p, np]);
    }
  }
  // deepest-first (longest path first)
  renames.sort(
    (a, b) => b[0].split("/").length - a[0].split("/").length || b[0].length - a[0].length,
  );
  return renames;
}

function checkCollisions(renames) {
  // case-insensitive destination collision detection (Windows)
  const seen = new Map();
  const collisions = [];
  for (const [src, dst] of renames) {
    const key = dst.toLowerCase();
    if (seen.has(key)) {
      collisions.push([seen.get(key), src, dst]);
    } else {
      seen.set(key, src);
    }
  }
  return collisions;
}

function runPathPass(rows) {
  const renames = computePathRenames(rows);
  const collisions = checkCollisions(renames);
  if (collisions.length) {
    console.error("PATH COLLISIONS DETECTED (case-insensitive):");
    for (const c of collisions) {
      console.error("", c);
    }
    throw new Error(`Aborting: ${collisions.length} path collision(s).`);
  }
  if (MODE_WRITE) {
    let done = 0;
    for (const [src, dst] of renames) {
      // git mv on Windows won't create multi-level new destination dirs; do it first.
      mkdirSync(path.join(REPO, path.dirname(dst)), { recursive: true });
      git(["mv", src, dst]);
      if (++done % 200 === 0) {
        console.log(`  ...moved ${done}/${renames.length}`);
      }
    }
    console.log(`Pass A: moved ${renames.length} file(s).`);
  }
  return renames;
}

// ----------------------------------------------------------------------------
// PASS B: content
// ----------------------------------------------------------------------------
function runContentPass(rows, workspaceSuffixes) {
  const counters = {};
  const transform = makeContentTransformer(workspaceSuffixes, counters);
  const edited = [];
  let skippedBinary = 0;
  let scanned = 0;
  for (const { mode, path: p } of rows) {
    if (mode === "120000") {
      continue; // skip symlinks
    }
    if (isContentExcluded(p)) {
      continue;
    }
    const abs = path.join(REPO, p);
    let buf;
    try {
      buf = readFileSync(abs);
    } catch {
      continue;
    }
    if (looksBinary(p, buf)) {
      if (/openclaw/i.test(p)) {
        skippedBinary++;
      }
      continue;
    }
    const orig = buf.toString("utf8");
    if (!/openclaw/i.test(orig)) {
      continue;
    }
    scanned++;
    const next = transform(orig, p);
    if (next !== orig) {
      edited.push(p);
      if (MODE_WRITE) {
        writeFileSync(abs, next);
      }
    }
  }
  return { counters, edited, scanned, skippedBinary };
}

// ----------------------------------------------------------------------------
// AUDIT
// ----------------------------------------------------------------------------
function runAudit(rows, workspaceSuffixes) {
  let grepOut;
  try {
    grepOut = git(["grep", "-I", "-i", "-n", "openclaw"]);
  } catch (e) {
    // git grep exits 1 when no matches; capture stdout if present
    grepOut = (e.stdout && e.stdout.toString()) || "";
  }
  const lines = grepOut.split("\n").filter(Boolean);

  const fileAllowed = (f) => {
    const base = f.split("/").pop();
    if (f === "scripts/rename-fork.mjs") {
      return true; // the rename tool itself contains openclaw
    }
    if (f === "src/compat/legacy-names.ts") {
      return true; // dedicated legacy-name compat table
    }
    if (f === "ui/vite.config.ts") {
      return true; // vite aliases for external @openclaw packages (uirouter)
    }
    if (base === "LICENSE") {
      return true;
    }
    if (base === "THIRD_PARTY_NOTICES.md") {
      return true;
    }
    if (f === "UPSTREAM-CHANGELOG.md") {
      return true;
    }
    // Fork-origin attribution must name the real upstream project; don't flag it.
    if (f === "CHANGELOG.md") {
      return true;
    }
    // README.md/SECURITY.md/VISION.md are NOT allowlisted here: the exact attribution
    // URL is already stripped by the generic upstream-repo-URL rule below, and anything
    // else in these files should still be flagged.
    // Explains that Ansible deployment installs the real upstream engine; must name it.
    if (f === "docs/install/ansible.md") {
      return true;
    }
    // Upgrade-survivor KEEP rule: mirrors isContentExcluded (still-published upstream
    // "openclaw" npm package name/versions).
    if (f === "scripts/lib/release-upgrade-baseline.mjs") {
      return true;
    }
    // Compat contract: mirrors isContentExcluded (legacy "openclaw" fallback key test).
    if (f === "src/compat/legacy-names.test.ts") {
      return true;
    }
    // Mirror isContentExcluded: real external packages' bin names must not be flagged.
    if (base === "npm-shrinkwrap.json") {
      return true;
    }
    if (f.startsWith("patches/")) {
      return true;
    }
    if (f.startsWith("apps/android/THIRD_PARTY_LICENSES/")) {
      return true;
    }
    return false;
  };

  const stripAllowed = (s) => {
    // remove allowlisted token occurrences, then check for residual openclaw
    let result = s.replace(/@openclaw\/([A-Za-z0-9._-]+)/gi, (m, name) =>
      workspaceSuffixes.has(name) ? m : "",
    );
    result = result.replace(/@openclaw__fs-safe/gi, "");
    // legacy plugin-manifest filename, accepted as a fallback by the loaders on purpose
    result = result.replace(/openclaw\.plugin\.json/gi, "");
    // any surviving openclaw@<spec> is a kept upstream package ref (emails were renamed)
    result = result.replace(/openclaw@[A-Za-z0-9*][A-Za-z0-9._*+^~-]*/gi, "");
    // literal regex source stripping the "openclaw@" version prefix (upgrade-survivor)
    result = result.replace(/\/\^openclaw@\//gi, "");
    // any surviving upstream repo URL (main repo openclaw/openclaw was mapped away)
    result = result.replace(
      /(?:github\.com|raw\.githubusercontent\.com)\/openclaw\/[A-Za-z0-9._-]+/gi,
      "",
    );
    result = result.replace(/deepwiki\.com\/openclaw(?:\/openclaw)?/gi, "");
    // external @openclaw/crabline re-exported identifiers/types + adapter param key
    // (see the matching KEEP protect rules in makeContentTransformer)
    result = result.replace(/OpenClawCrabline[A-Za-z0-9]*/g, "");
    result = result.replace(/OPENCLAW_CRABLINE[A-Z0-9_]*/g, "");
    result = result.replace(/openclawConfig\b/g, "");
    // external tokenjuice "openclaw" host subpath + its exported factory
    result = result.replace(/tokenjuice\/openclaw/g, "");
    result = result.replace(/TokenjuiceOpenClaw[A-Za-z0-9]*/g, "");
    // DSSE payload type signed by upstream ClawHub (wire-protocol constant)
    result = result.replace(/openclaw\.official-external-plugin-catalog-feed\.v1/g, "");
    return result;
  };

  const offenders = [];
  for (const line of lines) {
    // format file:lineno:content
    const m = /^(.*?):(\d+):(.*)$/.exec(line);
    if (!m) {
      continue;
    }
    const file = m[1];
    if (isNodeModules(file)) {
      continue; // node_modules is out of scope
    }
    if (fileAllowed(file)) {
      continue;
    }
    const residual = stripAllowed(m[3]);
    if (/openclaw/i.test(residual)) {
      offenders.push(`${file}:${m[2]}: ${m[3].trim().slice(0, 160)}`);
    }
  }
  return offenders;
}

// ----------------------------------------------------------------------------
// main
// ----------------------------------------------------------------------------
function main() {
  const rows = gitLsFilesWithMode();
  const workspaceSuffixes = computeWorkspaceSuffixes(rows);

  if (MODE_AUDIT) {
    const offenders = runAudit(rows, workspaceSuffixes);
    if (offenders.length) {
      console.error(`AUDIT FAILED: ${offenders.length} non-allowlisted openclaw hit(s):`);
      for (const o of offenders.slice(0, 200)) {
        console.error("  " + o);
      }
      if (offenders.length > 200) {
        console.error(`  ...and ${offenders.length - 200} more`);
      }
      process.exit(1);
    }
    console.log("AUDIT PASSED: all residual openclaw hits are allowlisted.");
    return;
  }

  console.log(
    `mode=${MODE_WRITE ? "WRITE" : "DRY-RUN"} passes=${DO_PATHS ? "A" : ""}${DO_CONTENT ? "B" : ""}`,
  );
  console.log(`workspace scope suffixes: ${workspaceSuffixes.size}`);

  // ---- Pass A ----
  if (DO_PATHS) {
    const renames = runPathPass(rows);
    console.log(`\n=== Pass A (paths) ===`);
    console.log(`files to rename: ${renames.length}`);
    for (const r of renames.slice(0, 25)) {
      console.log(`  ${r[0]}  ->  ${r[1]}`);
    }
    if (renames.length > 25) {
      console.log(`  ...and ${renames.length - 25} more`);
    }
  }

  // ---- Pass B ----
  if (DO_CONTENT) {
    // in WRITE+both mode, re-list after moves so content pass sees new paths
    const contentRows = MODE_WRITE && DO_PATHS ? gitLsFilesWithMode() : rows;
    const { counters, edited, scanned, skippedBinary } = runContentPass(
      contentRows,
      workspaceSuffixes,
    );
    console.log(`\n=== Pass B (content) ===`);
    console.log(`files scanned (containing openclaw): ${scanned}`);
    console.log(`files to edit: ${edited.length}`);
    console.log(`binary files skipped (openclaw in path): ${skippedBinary}`);
    const keys = Object.keys(counters).toSorted();
    const keepKeys = keys.filter((k) => k.startsWith("KEEP"));
    const ruleKeys = keys.filter((k) => !k.startsWith("KEEP"));
    console.log(`\n-- replacement rule hit counts --`);
    for (const k of ruleKeys) {
      console.log(`  ${String(counters[k]).padStart(7)}  ${k}`);
    }
    console.log(`\n-- KEEP (protected) hit counts --`);
    for (const k of keepKeys) {
      console.log(`  ${String(counters[k]).padStart(7)}  ${k}`);
    }
  }

  console.log(`\ndone (${MODE_WRITE ? "changes written" : "no changes"}).`);
}

export { makeContentTransformer, transformString, computeWorkspaceSuffixes, gitLsFilesWithMode };

const invokedPath = process.argv[1];
if (invokedPath && import.meta.url === pathToFileURL(invokedPath).href) {
  main();
}
