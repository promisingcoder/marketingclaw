// Hook frontmatter helpers parse metadata blocks from hook files.
import { readStringValue } from "@marketingclaw/normalization-core/string-coerce";
import { parseFrontmatterBlock } from "../../packages/markdown-core/src/frontmatter.js";
import {
  applyMarketingClawManifestInstallCommonFields,
  getFrontmatterString,
  normalizeStringList,
  parseMarketingClawManifestInstallBase,
  parseFrontmatterBool,
  resolveMarketingClawManifestBlock,
  resolveMarketingClawManifestInstall,
  resolveMarketingClawManifestOs,
  resolveMarketingClawManifestRequires,
} from "../shared/frontmatter.js";
import type {
  MarketingClawHookMetadata,
  HookEntry,
  HookInstallSpec,
  HookInvocationPolicy,
  ParsedHookFrontmatter,
} from "./types.js";

/** Parse HOOK.md frontmatter into the generic hook frontmatter record. */
export function parseFrontmatter(content: string): ParsedHookFrontmatter {
  return parseFrontmatterBlock(content);
}

function parseInstallSpec(input: unknown): HookInstallSpec | undefined {
  const parsed = parseMarketingClawManifestInstallBase(input, ["bundled", "npm", "git"]);
  if (!parsed) {
    return undefined;
  }
  const { raw } = parsed;
  const spec = applyMarketingClawManifestInstallCommonFields<HookInstallSpec>(
    {
      kind: parsed.kind as HookInstallSpec["kind"],
    },
    parsed,
  );
  if (typeof raw.package === "string") {
    spec.package = raw.package;
  }
  if (typeof raw.repository === "string") {
    spec.repository = raw.repository;
  }

  return spec;
}

/** Resolve MarketingClaw hook metadata from the manifest block in HOOK.md frontmatter. */
export function resolveMarketingClawMetadata(
  frontmatter: ParsedHookFrontmatter,
): MarketingClawHookMetadata | undefined {
  const metadataObj = resolveMarketingClawManifestBlock({ frontmatter });
  if (!metadataObj) {
    return undefined;
  }
  const requires = resolveMarketingClawManifestRequires(metadataObj);
  const install = resolveMarketingClawManifestInstall(metadataObj, parseInstallSpec);
  const osRaw = resolveMarketingClawManifestOs(metadataObj);
  const eventsRaw = normalizeStringList(metadataObj.events);
  return {
    always: typeof metadataObj.always === "boolean" ? metadataObj.always : undefined,
    emoji: readStringValue(metadataObj.emoji),
    homepage: readStringValue(metadataObj.homepage),
    hookKey: readStringValue(metadataObj.hookKey),
    export: readStringValue(metadataObj.export),
    os: osRaw.length > 0 ? osRaw : undefined,
    events: eventsRaw.length > 0 ? eventsRaw : [],
    requires,
    install: install.length > 0 ? install : undefined,
  };
}

/** Resolve invocation policy from top-level hook frontmatter flags. */
export function resolveHookInvocationPolicy(
  frontmatter: ParsedHookFrontmatter,
): HookInvocationPolicy {
  return {
    enabled: parseFrontmatterBool(getFrontmatterString(frontmatter, "enabled"), true),
  };
}

/** Resolve the config key for a hook, honoring metadata hookKey overrides. */
export function resolveHookKey(hookName: string, entry?: HookEntry): string {
  return entry?.metadata?.hookKey ?? hookName;
}
