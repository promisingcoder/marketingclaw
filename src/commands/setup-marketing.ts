// Implements `marketingclaw setup-marketing`: scaffolds the shared marketing
// state directory, the six-agent roster, per-role workspace personas, and the
// default cron schedule. Idempotent: re-running skips agents/files/jobs that
// already exist so operators can safely converge an install.
import fs from "node:fs/promises";
import path from "node:path";
import JSON5 from "json5";
import { z } from "zod";
import { formatCliCommand } from "../cli/command-format.js";
import { resolveStateDir } from "../config/paths.js";
import type { AgentConfig } from "../config/types.agents.js";
import type { MarketingClawConfig } from "../config/types.js";
import type { CronJobCreate } from "../cron/types.js";
import { runCommandWithTimeout } from "../process/exec.js";
import { normalizeAgentId } from "../routing/session-key.js";
import { defaultRuntime, type RuntimeEnv, writeRuntimeJson } from "../runtime.js";
import { shortenHomePath } from "../utils.js";
import { safeParseWithSchema } from "../utils/zod-parse.js";
import { createQuietRuntime } from "./agents.command-shared.js";

const JsonRecordSchema = z.record(z.string(), z.unknown());

/** One marketing role: id, persona, skill allowlist, and delegation rules. */
export type MarketingRole = {
  id: string;
  name: string;
  emoji: string;
  description: string;
  /** Skill allowlist for this agent (Phase 5 skill names). */
  skills: string[];
  /** Agent ids this role may spawn via sessions_spawn (orchestrator only). */
  subagentAllow?: string[];
  /** Marks the default agent that receives all DMs and WebChat. */
  isDefault?: boolean;
  /**
   * Periodic heartbeat cadence for this role. Setting it on any role makes the
   * whole roster "explicit heartbeat" (see the note on MARKETING_ROLES): only
   * roles that carry this field are heartbeat-scheduled and wake-eligible.
   */
  heartbeat?: { every: string };
};

/**
 * Flat marketing roster: a CMO orchestrator plus five specialists. Order
 * matters — the CMO is listed first so it resolves as the default agent even
 * when other tooling picks the first entry.
 *
 * Heartbeat note: the runner's `resolveHeartbeatAgents` is all-or-nothing —
 * once any agent carries an explicit `heartbeat`, ONLY agents with one are
 * heartbeat-scheduled (the implicit "just the default agent" fallback no longer
 * applies). That map also gates targeted wakes, so an unscheduled default agent
 * would silently drop Slack-approval and background-exec wakes. Social needs a
 * heartbeat to run its 12h mention triage, so the CMO carries an explicit
 * heartbeat too — at its prior implicit 30m cadence — to stay wake-eligible.
 */
export const MARKETING_ROLES: readonly MarketingRole[] = [
  {
    id: "cmo",
    name: "Morgan",
    emoji: "🧭",
    description:
      "Marketing orchestrator. Owns CAMPAIGNS.md and CALENDAR.md, delegates to specialists via sessions_spawn, and is the single human contact.",
    skills: ["postiz", "wordpress", "listmonk", "gsc", "ga4", "marketing-report", "summarize"],
    subagentAllow: ["content", "social", "email", "seo", "analyst"],
    isDefault: true,
    // Keeps the default agent wake-eligible under explicit-heartbeat mode; its
    // HEARTBEAT.md is comments-only, so this run is inert but harmless.
    heartbeat: { every: "30m" },
  },
  {
    id: "content",
    name: "Sasha",
    emoji: "✍️",
    description: "Long-form and copy writer. Drafts to files; never publishes.",
    skills: ["wordpress", "blog-git", "meme-maker", "summarize"],
  },
  {
    id: "social",
    name: "Riley",
    emoji: "📣",
    description:
      "Social publisher and scheduler via Postiz + xurl. Runs mention triage on a heartbeat.",
    skills: ["postiz", "xurl", "meme-maker", "gifgrep"],
    // Drives the 12h mentions-check task in social's HEARTBEAT.md.
    heartbeat: { every: "12h" },
  },
  {
    id: "email",
    name: "Jordan",
    emoji: "📧",
    description:
      "Email marketer on Listmonk. Owns deliverability hygiene; sends are approval-gated.",
    skills: ["listmonk"],
  },
  {
    id: "seo",
    name: "Quinn",
    emoji: "🔍",
    description:
      "SEO and blog pipeline. GSC, keyword research, audits, and publishing into WordPress/git.",
    skills: ["gsc", "keyword-research", "seo-audit", "wordpress", "blog-git", "summarize"],
  },
  {
    id: "analyst",
    name: "Alex",
    emoji: "📊",
    description:
      "Analyst. Pulls GA4 + GSC + platform metrics into REPORTS/ and surfaces weekly insights.",
    skills: ["ga4", "gsc", "postiz", "listmonk", "marketing-report", "summarize"],
  },
] as const;

/**
 * Persona files copied over the generic bootstrap templates. These must land
 * BEFORE ensureAgentWorkspace so the role versions win over the generic
 * templates (both use write-if-missing).
 */
const ROLE_OVERLAY_FILES = ["SOUL.md", "IDENTITY.md", "AGENTS.md", "HEARTBEAT.md"] as const;

/**
 * BOOTSTRAP.md is overlaid AFTER ensureAgentWorkspace. ensureAgentWorkspace runs
 * a bootstrap-completion reconcile that deletes BOOTSTRAP.md once the persona
 * diverges from the starter template — which the ROLE_OVERLAY_FILES persona
 * overlay guarantees — so seeding it earlier gets it removed within the same
 * run. Only the CMO template ships a BOOTSTRAP.md; the overlay skips roles
 * without one.
 */
const ROLE_BOOTSTRAP_OVERLAY_FILES = ["BOOTSTRAP.md"] as const;

/** A default cron job to install, described in terms cron.add understands. */
export type DefaultCronJobSpec = {
  name: string;
  agentId: string;
  /** 5-field cron expression (minute hour day month weekday). */
  cron: string;
  /** Human-readable summary used in the CLI transcript. */
  summary: string;
  message: string;
};

/**
 * Phase 6 default schedule. All jobs run as isolated agent turns for a specific
 * role and announce their result to the operator's last-used channel.
 */
export const DEFAULT_CRON_JOBS: readonly DefaultCronJobSpec[] = [
  {
    name: "weekly-content-calendar",
    agentId: "cmo",
    cron: "0 7 * * 1",
    summary: "Mon 07:00 — CMO drafts next week's CALENDAR.md",
    message:
      "It's the weekly content-calendar planning turn. Read ~/.marketingclaw/marketing/BRAND.md, CAMPAIGNS.md, CALENDAR.md, and POSTLOG.md. Draft next week's rows in CALENDAR.md (status: idea/draft) covering the active campaigns, then message me a short summary and ask for approval. Do not publish or schedule anything.",
  },
  {
    name: "daily-queue-reconcile",
    agentId: "social",
    cron: "0 8 * * *",
    summary: "Daily 08:00 — Social reconciles approved items into the Postiz queue",
    message:
      "It's the daily queue-reconcile turn. Read ~/.marketingclaw/marketing/CALENDAR.md. For every row with status 'approved' that is not yet scheduled, schedule it in Postiz at its planned time, flip the row to 'scheduled', and append the action to POSTLOG.md. Only touch 'approved' rows — never publish an unapproved item. Message me a one-line summary of what changed.",
  },
  {
    name: "weekly-analytics-report",
    agentId: "analyst",
    cron: "0 8 * * 1",
    summary: "Mon 08:00 — Analyst writes the weekly report",
    message:
      "It's the weekly analytics turn. Use the marketing-report skill to pull GA4 + GSC + platform numbers into ~/.marketingclaw/marketing/REPORTS/weekly-YYYY-WW.md, then message me the 3 highlights and any anomaly worth attention.",
  },
  {
    name: "monthly-seo-audit",
    agentId: "seo",
    cron: "0 9 1 * *",
    summary: "1st 09:00 — SEO runs the monthly audit",
    message:
      "It's the monthly SEO audit turn. Review GSC movement since last month and run the seo-audit checklist. Write findings to ~/.marketingclaw/marketing/REPORTS/ and message me the top 3 actions ranked by impact.",
  },
  {
    name: "weekly-email-health",
    agentId: "email",
    cron: "0 16 * * 5",
    summary: "Fri 16:00 — Email checks list health",
    message:
      "It's the weekly email-health turn. Check Listmonk list growth, bounces, and unsubscribes for the week. Announce only if something is anomalous (bounce/unsub spike, stalled growth); otherwise reply HEARTBEAT_OK.",
  },
] as const;

/** Options accepted by the setup-marketing command. */
export type SetupMarketingOptions = {
  company?: string;
  site?: string;
  audience?: string;
  nonInteractive?: boolean;
  json?: boolean;
};

/** Brand inputs resolved from flags or prompts before scaffolding. */
export type BrandInputs = {
  company: string;
  site: string;
  audience: string;
};

/** Result of applying the roster to a config, for reporting and tests. */
export type ApplyRosterResult = {
  config: MarketingClawConfig;
  created: string[];
  skipped: string[];
};

/** Injectable dependencies so the command stays testable without real IO. */
export type SetupMarketingDeps = {
  stateDir?: string;
  createConfigIO?: () => { configPath: string };
  readConfig?: (configPath: string) => Promise<{ exists: boolean; config: MarketingClawConfig }>;
  replaceConfigFile?: (params: {
    nextConfig: MarketingClawConfig;
    afterWrite: { mode: "auto" };
  }) => Promise<unknown>;
  ensureAgentWorkspace?: (params: {
    dir: string;
    ensureBootstrapFiles?: boolean;
  }) => Promise<{ dir: string }>;
  resolveTemplatesDir?: () => Promise<string>;
  installCronJobs?: (
    jobs: CronJobCreate[],
    runtime: RuntimeEnv,
  ) => Promise<{ created: string[]; converged: string[] }>;
  gitInit?: (dir: string) => Promise<boolean>;
  promptBrandInputs?: (opts: SetupMarketingOptions) => Promise<BrandInputs>;
  now?: () => number;
};

/** Resolves the shared marketing state directory (`<stateDir>/marketing`). */
export function resolveSharedMarketingDir(stateDir: string): string {
  return path.join(stateDir, "marketing");
}

/** Resolves a per-agent workspace directory (`<stateDir>/workspace-<id>`). */
export function resolveRoleWorkspaceDir(stateDir: string, roleId: string): string {
  return path.join(stateDir, `workspace-${normalizeAgentId(roleId)}`);
}

/** Resolves a per-agent private agent directory (`<stateDir>/agents/<id>/agent`). */
export function resolveRoleAgentDir(stateDir: string, roleId: string): string {
  return path.join(stateDir, "agents", normalizeAgentId(roleId), "agent");
}

/** Builds the agent config entry for one role. */
export function buildRoleAgentEntry(role: MarketingRole, stateDir: string): AgentConfig {
  const entry: AgentConfig = {
    id: role.id,
    name: role.name,
    description: role.description,
    workspace: resolveRoleWorkspaceDir(stateDir, role.id),
    agentDir: resolveRoleAgentDir(stateDir, role.id),
    skills: [...role.skills],
    identity: { name: role.name, emoji: role.emoji },
  };
  if (role.isDefault) {
    entry.default = true;
  }
  if (role.subagentAllow && role.subagentAllow.length > 0) {
    entry.subagents = { allowAgents: [...role.subagentAllow] };
  }
  if (role.heartbeat) {
    entry.heartbeat = { ...role.heartbeat };
  }
  return entry;
}

/**
 * Adds any missing roster agents to a config without disturbing existing
 * entries. Idempotent: an agent id already present is left untouched.
 */
export function applyMarketingRoster(
  cfg: MarketingClawConfig,
  params: { stateDir: string; roles?: readonly MarketingRole[] },
): ApplyRosterResult {
  const roles = params.roles ?? MARKETING_ROLES;
  const existingList = Array.isArray(cfg.agents?.list) ? [...cfg.agents.list] : [];
  const existingIds = new Set(
    existingList
      .filter((entry): entry is AgentConfig => Boolean(entry) && typeof entry === "object")
      .map((entry) => normalizeAgentId(entry.id)),
  );

  const created: string[] = [];
  const skipped: string[] = [];
  const nextList = [...existingList];
  for (const role of roles) {
    if (existingIds.has(normalizeAgentId(role.id))) {
      skipped.push(role.id);
      continue;
    }
    nextList.push(buildRoleAgentEntry(role, params.stateDir));
    created.push(role.id);
  }

  if (created.length === 0) {
    return { config: cfg, created, skipped };
  }

  return {
    config: {
      ...cfg,
      agents: {
        ...cfg.agents,
        list: nextList,
      },
    },
    created,
    skipped,
  };
}

/** Builds the cron.add inputs for the default schedule. */
export function buildDefaultCronJobCreates(
  jobs: readonly DefaultCronJobSpec[] = DEFAULT_CRON_JOBS,
): CronJobCreate[] {
  return jobs.map((job) => ({
    name: job.name,
    enabled: true,
    declarationKey: `marketing:${job.name}`,
    displayName: job.name,
    agentId: job.agentId,
    schedule: { kind: "cron", expr: job.cron },
    sessionTarget: "isolated",
    wakeMode: "now",
    payload: { kind: "agentTurn", message: job.message },
    delivery: { mode: "announce", channel: "last" },
  }));
}

/** Renders BRAND.md from the collected brand inputs. */
export function renderBrandMarkdown(inputs: BrandInputs): string {
  const site = inputs.site.trim();
  const utmBase = site ? deriveUtmSource(site) : "newsletter";
  return `# BRAND.md — ${inputs.company}

_The single source of truth for who we are and how we sound. Every agent reads this before writing or publishing. Keep it current._

## Company

- **Name:** ${inputs.company}
- **Website:** ${site || "(add your site)"}
- **Primary audience:** ${inputs.audience}

## Voice & tone

_(How do we sound? e.g. plainspoken, expert-but-warm, no hype. List 3-5 adjectives and one "we never sound like…".)_

-

## Products / offers

_(What are we selling or promoting? One bullet each: name — one-line value prop — who it's for.)_

-

## Audience detail

_(Segments, jobs-to-be-done, objections. The more specific, the better the copy.)_

-

## Competitors

_(Who we're compared to, and how we differ. Do not copy their claims.)_

-

## Banned phrases & claims

_(Words, clichés, and claims we never use. Compliance-sensitive statements go here.)_

-

## UTM conventions

Tag every outbound link so the analyst can attribute traffic. Default scheme:

- \`utm_source\` = the platform (e.g. \`twitter\`, \`linkedin\`, \`${utmBase}\`)
- \`utm_medium\` = \`social\` | \`email\` | \`organic\` | \`paid\`
- \`utm_campaign\` = the CALENDAR.md campaign id

## Links & assets

_(Brand kit, logo files, style guide, image library.)_

-
`;
}

function deriveUtmSource(site: string): string {
  const host = site
    .replace(/^https?:\/\//i, "")
    .replace(/^www\./i, "")
    .split(/[/?#]/)[0]
    ?.trim();
  const label = host?.split(".")[0];
  return label && label.length > 0 ? label : "newsletter";
}

/** Renders the CAMPAIGNS.md seed file. */
function renderCampaignsMarkdown(): string {
  return `# CAMPAIGNS.md

_Active and upcoming campaigns. The CMO owns this file; specialists read it before any content work._

| id | name | goal | channels | owner | status | notes |
|----|------|------|----------|-------|--------|-------|
| _(add your first campaign)_ | | | | cmo | idea | |
`;
}

/** Renders the CALENDAR.md seed file with the documented status flow. */
function renderCalendarMarkdown(): string {
  return `# CALENDAR.md

_The publishing queue. Status flows: **idea → draft → approved → scheduled → posted**._

**Nothing is published or scheduled to a live audience until its row here is \`approved\` (or later).**

| id | date | channel | title | status | owner | draft-link |
|----|------|---------|-------|--------|-------|------------|
| _(example)_ | 2026-01-01 | blog | | idea | content | |
`;
}

/** Renders the append-only POSTLOG.md seed file. */
function renderPostlogMarkdown(): string {
  return `# POSTLOG.md

_Append-only record of everything that went out. Newest at the bottom. Never edit past entries._

| timestamp | channel | title | link | by |
|-----------|---------|-------|------|-----|
`;
}

async function writeFileIfMissing(filePath: string, content: string): Promise<boolean> {
  try {
    await fs.writeFile(filePath, content, { encoding: "utf-8", flag: "wx" });
    return true;
  } catch (err) {
    if ((err as { code?: string }).code !== "EEXIST") {
      throw err;
    }
    return false;
  }
}

/** Reads the existing config file, tolerating a missing or malformed file. */
async function readExistingConfig(
  configPath: string,
): Promise<{ exists: boolean; config: MarketingClawConfig }> {
  try {
    const raw = await fs.readFile(configPath, "utf-8");
    const parsed = safeParseWithSchema(JsonRecordSchema, JSON5.parse(raw));
    return { exists: true, config: (parsed ?? {}) as MarketingClawConfig };
  } catch {
    return { exists: false, config: {} };
  }
}

async function defaultResolveTemplatesDir(): Promise<string> {
  const { resolveWorkspaceTemplateDir } = await import("../agents/workspace-templates.js");
  return resolveWorkspaceTemplateDir();
}

async function defaultReplaceConfigFile(params: {
  nextConfig: MarketingClawConfig;
  afterWrite: { mode: "auto" };
}): Promise<void> {
  const { replaceConfigFile } = await import("../config/config.js");
  await replaceConfigFile(params);
}

async function defaultEnsureAgentWorkspace(params: {
  dir: string;
  ensureBootstrapFiles?: boolean;
}): Promise<{ dir: string }> {
  const { ensureAgentWorkspace } = await import("../agents/workspace.js");
  return ensureAgentWorkspace(params);
}

async function defaultGitInit(dir: string): Promise<boolean> {
  try {
    if (await pathExists(path.join(dir, ".git"))) {
      return false;
    }
    const result = await runCommandWithTimeout(["git", "init"], { cwd: dir, timeoutMs: 10_000 });
    return result.code === 0;
  } catch {
    return false;
  }
}

async function defaultInstallCronJobs(
  jobs: CronJobCreate[],
  runtime: RuntimeEnv,
): Promise<{ created: string[]; converged: string[] }> {
  const { CronService } = await import("../cron/service.js");
  const { resolveCronStorePath } = await import("../cron/store.js");
  const silentLog = {
    debug: () => {},
    info: () => {},
    warn: () => {},
    error: () => {},
  };
  const cron = new CronService({
    storePath: resolveCronStorePath(),
    cronEnabled: false,
    log: silentLog as never,
    enqueueSystemEvent: () => {},
    requestHeartbeat: () => {},
    runIsolatedAgentJob: async () => ({ status: "ok" as const }),
    defaultAgentId: "cmo",
  });
  const created: string[] = [];
  const converged: string[] = [];
  try {
    for (const job of jobs) {
      const result = await cron.add(job);
      const wasCreated = "created" in result ? result.created : true;
      if (wasCreated) {
        created.push(job.name);
      } else {
        converged.push(job.name);
      }
    }
  } catch (err) {
    runtime.error(`Cron install failed: ${err instanceof Error ? err.message : String(err)}`);
    throw err;
  } finally {
    cron.stop();
  }
  return { created, converged };
}

async function pathExists(target: string): Promise<boolean> {
  try {
    await fs.access(target);
    return true;
  } catch {
    return false;
  }
}

async function defaultPromptBrandInputs(opts: SetupMarketingOptions): Promise<BrandInputs> {
  const company = opts.company?.trim();
  const site = opts.site?.trim();
  const audience = opts.audience?.trim();
  // Fully specified via flags — no need to open a prompt session.
  if (company && audience) {
    return { company, site: site ?? "", audience };
  }
  const { createClackPrompter } = await import("../wizard/clack-prompter.js");
  const prompter = createClackPrompter();
  await prompter.intro("Set up your marketing team");
  const companyAnswer =
    company ??
    (await prompter.text({
      message: "Company or brand name",
      validate: (value) => (value?.trim() ? undefined : "Required"),
    }));
  const siteAnswer =
    site ??
    (await prompter.text({
      message: "Website (optional)",
      placeholder: "example.com",
    }));
  const audienceAnswer =
    audience ??
    (await prompter.text({
      message: "Primary audience",
      validate: (value) => (value?.trim() ? undefined : "Required"),
    }));
  await prompter.outro("Brand captured.");
  return {
    company: String(companyAnswer).trim(),
    site: String(siteAnswer ?? "").trim(),
    audience: String(audienceAnswer).trim(),
  };
}

/** Copies the named role template files into a workspace, skipping missing sources. */
async function overlayRoleTemplates(params: {
  role: MarketingRole;
  workspaceDir: string;
  templatesDir: string;
  files: readonly string[];
}): Promise<string[]> {
  const roleDir = path.join(params.templatesDir, "marketing", params.role.id);
  const written: string[] = [];
  for (const fileName of params.files) {
    let content: string;
    try {
      content = await fs.readFile(path.join(roleDir, fileName), "utf-8");
    } catch (err) {
      if ((err as { code?: string }).code === "ENOENT") {
        continue;
      }
      throw err;
    }
    if (await writeFileIfMissing(path.join(params.workspaceDir, fileName), content)) {
      written.push(fileName);
    }
  }
  return written;
}

/** Scaffolds the shared marketing state directory and its seed files. */
async function scaffoldSharedDir(params: {
  sharedDir: string;
  brand: BrandInputs;
  gitInit: NonNullable<SetupMarketingDeps["gitInit"]>;
  runtime: RuntimeEnv;
}): Promise<{ brandCreated: boolean; gitInitialized: boolean }> {
  const { sharedDir, brand, runtime } = params;
  await fs.mkdir(path.join(sharedDir, "content", "replies"), { recursive: true });
  await fs.mkdir(path.join(sharedDir, "REPORTS"), { recursive: true });

  const brandCreated = await writeFileIfMissing(
    path.join(sharedDir, "BRAND.md"),
    renderBrandMarkdown(brand),
  );
  await writeFileIfMissing(path.join(sharedDir, "CAMPAIGNS.md"), renderCampaignsMarkdown());
  await writeFileIfMissing(path.join(sharedDir, "CALENDAR.md"), renderCalendarMarkdown());
  await writeFileIfMissing(path.join(sharedDir, "POSTLOG.md"), renderPostlogMarkdown());

  const gitInitialized = await params.gitInit(sharedDir);
  runtime.log(
    `Shared dir: ${shortenHomePath(sharedDir)}${gitInitialized ? " (git initialized)" : ""}`,
  );
  return { brandCreated, gitInitialized };
}

/** Entry point for `marketingclaw setup-marketing`. */
export async function setupMarketingCommand(
  opts: SetupMarketingOptions = {},
  runtime: RuntimeEnv = defaultRuntime,
  deps: SetupMarketingDeps = {},
): Promise<void> {
  const stateDir = deps.stateDir ?? resolveStateDir();
  const io = deps.createConfigIO?.() ?? (await createDefaultConfigIO());
  const configPath = io.configPath;
  const readConfig = deps.readConfig ?? readExistingConfig;
  const replaceConfigFile = deps.replaceConfigFile ?? defaultReplaceConfigFile;
  const ensureAgentWorkspace = deps.ensureAgentWorkspace ?? defaultEnsureAgentWorkspace;
  const resolveTemplatesDir = deps.resolveTemplatesDir ?? defaultResolveTemplatesDir;
  const installCronJobs = deps.installCronJobs ?? defaultInstallCronJobs;
  const gitInit = deps.gitInit ?? defaultGitInit;
  const promptBrandInputs = deps.promptBrandInputs ?? defaultPromptBrandInputs;

  if (opts.nonInteractive && !opts.company?.trim()) {
    runtime.error(
      `--company is required with --non-interactive. Example: ${formatCliCommand(
        'marketingclaw setup-marketing --company Acme --site acme.com --audience "b2b saas" --non-interactive',
      )}`,
    );
    runtime.exit(1);
    return;
  }
  if (opts.nonInteractive && !opts.audience?.trim()) {
    runtime.error("--audience is required with --non-interactive.");
    runtime.exit(1);
    return;
  }

  const brand = opts.nonInteractive
    ? {
        company: opts.company?.trim() ?? "",
        site: opts.site?.trim() ?? "",
        audience: opts.audience?.trim() ?? "",
      }
    : await promptBrandInputs(opts);

  // In --json mode step logs are suppressed so stdout stays a single JSON object.
  const json = opts.json === true;
  const stepRuntime = json ? createQuietRuntime(runtime) : runtime;

  // 1) Shared, git-tracked marketing state directory.
  const sharedDir = resolveSharedMarketingDir(stateDir);
  const { brandCreated } = await scaffoldSharedDir({
    sharedDir,
    brand,
    gitInit,
    runtime: stepRuntime,
  });
  stepRuntime.log(brandCreated ? "BRAND.md written." : "BRAND.md already present (kept).");

  // 2) Roster: add any missing agents to config.
  const existing = await readConfig(configPath);
  const rosterResult = applyMarketingRoster(existing.config, { stateDir });
  if (rosterResult.created.length > 0) {
    await replaceConfigFile({ nextConfig: rosterResult.config, afterWrite: { mode: "auto" } });
    stepRuntime.log(`Agents created: ${rosterResult.created.join(", ")}`);
  }
  if (rosterResult.skipped.length > 0) {
    stepRuntime.log(`Agents kept (already configured): ${rosterResult.skipped.join(", ")}`);
  }

  // 3) Per-agent workspaces with role personas overlaid before generic seeding.
  const templatesDir = await resolveTemplatesDir();
  const workspaces: Array<{ id: string; workspace: string; roleFilesAdded: number }> = [];
  for (const role of MARKETING_ROLES) {
    const workspaceDir = resolveRoleWorkspaceDir(stateDir, role.id);
    await fs.mkdir(workspaceDir, { recursive: true });
    const personaOverlaid = await overlayRoleTemplates({
      role,
      workspaceDir,
      templatesDir,
      files: ROLE_OVERLAY_FILES,
    });
    await ensureAgentWorkspace({ dir: workspaceDir, ensureBootstrapFiles: true });
    // BOOTSTRAP.md lands after ensureAgentWorkspace so its completion reconcile
    // cannot delete the CMO's freshly-seeded brand interview (see the note on
    // ROLE_BOOTSTRAP_OVERLAY_FILES).
    const bootstrapOverlaid = await overlayRoleTemplates({
      role,
      workspaceDir,
      templatesDir,
      files: ROLE_BOOTSTRAP_OVERLAY_FILES,
    });
    const roleFilesAdded = personaOverlaid.length + bootstrapOverlaid.length;
    workspaces.push({ id: role.id, workspace: workspaceDir, roleFilesAdded });
    stepRuntime.log(
      `Workspace ${role.id}: ${shortenHomePath(workspaceDir)}${
        roleFilesAdded > 0 ? ` (+${roleFilesAdded} role files)` : ""
      }`,
    );
  }

  // 4) Default cron schedule (idempotent via declarationKey).
  const cronResult = await installCronJobs(buildDefaultCronJobCreates(), stepRuntime);
  const cronTotal = cronResult.created.length + cronResult.converged.length;
  stepRuntime.log(
    `Cron jobs: ${cronTotal} installed${
      cronResult.created.length < cronTotal
        ? ` (${cronResult.created.length} new, ${cronResult.converged.length} already present)`
        : ""
    }`,
  );

  if (json) {
    writeRuntimeJson(runtime, {
      company: brand.company,
      site: brand.site,
      audience: brand.audience,
      sharedDir,
      brandCreated,
      agents: { created: rosterResult.created, skipped: rosterResult.skipped },
      workspaces,
      cron: { created: cronResult.created, converged: cronResult.converged },
    });
    return;
  }

  printNextSteps(runtime, { brand, sharedDir });
}

function printNextSteps(
  runtime: RuntimeEnv,
  params: { brand: BrandInputs; sharedDir: string },
): void {
  runtime.log("");
  runtime.log(`Your marketing team is ready for ${params.brand.company}.`);
  runtime.log(`Shared brand state lives in ${shortenHomePath(params.sharedDir)}.`);
  runtime.log("");
  runtime.log("Next steps:");
  runtime.log(
    `  1. Fill in the blanks in BRAND.md (voice, products, competitors, banned phrases).`,
  );
  runtime.log(
    `  2. Configure platform keys (Postiz, Listmonk, WordPress, GA4, GSC) — see each skill's SKILL.md.`,
  );
  runtime.log(`  3. Start the gateway: ${formatCliCommand("marketingclaw gateway")}.`);
  runtime.log(
    `  4. Open the dashboard and chat with Morgan (cmo): ${formatCliCommand("marketingclaw dashboard")}.`,
  );
  runtime.log(`  5. Review the schedule anytime: ${formatCliCommand("marketingclaw cron list")}.`);
}

async function createDefaultConfigIO(): Promise<{ configPath: string }> {
  const { createConfigIO } = await import("../config/config.js");
  return createConfigIO();
}
