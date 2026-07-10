// Real workspace contract for memory engine foundation concerns.

export {
  resolveAgentContextLimits,
  resolveAgentDir,
  resolveAgentWorkspaceDir,
  resolveDefaultAgentId,
  resolveSessionAgentId,
} from "./host/marketingclaw-runtime-agent.js";
export {
  resolveMemorySearchConfig,
  resolveMemorySearchSyncConfig,
  type ResolvedMemorySearchConfig,
  type ResolvedMemorySearchSyncConfig,
} from "./host/marketingclaw-runtime-agent.js";
export { parseDurationMs } from "./host/marketingclaw-runtime-config.js";
export { loadConfig } from "./host/marketingclaw-runtime-config.js";
export { resolveStateDir } from "./host/marketingclaw-runtime-config.js";
export { resolveSessionTranscriptsDirForAgent } from "./host/marketingclaw-runtime-config.js";
export {
  hasConfiguredSecretInput,
  normalizeResolvedSecretInputString,
} from "./host/marketingclaw-runtime-config.js";
export { root } from "./host/marketingclaw-runtime-io.js";
export { isPathInside } from "./host/fs-utils.js";
export { createSubsystemLogger } from "./host/marketingclaw-runtime-io.js";
export { detectMime } from "./host/marketingclaw-runtime-io.js";
export { resolveGlobalSingleton } from "./host/marketingclaw-runtime-io.js";
export { onSessionTranscriptUpdate } from "./host/marketingclaw-runtime-session.js";
export { splitShellArgs } from "./host/marketingclaw-runtime-io.js";
export { runTasksWithConcurrency } from "./host/marketingclaw-runtime-io.js";
export {
  shortenHomeInString,
  shortenHomePath,
  resolveUserPath,
  truncateUtf16Safe,
} from "./host/marketingclaw-runtime-io.js";
export type { MarketingClawConfig } from "./host/marketingclaw-runtime-config.js";
export type { SessionSendPolicyConfig } from "./host/marketingclaw-runtime-config.js";
export type { SecretInput } from "./host/marketingclaw-runtime-config.js";
export type {
  MemoryBackend,
  MemoryCitationsMode,
  MemoryQmdConfig,
  MemoryQmdIndexPath,
  MemoryQmdMcporterConfig,
  MemoryQmdSearchMode,
} from "./host/marketingclaw-runtime-config.js";
export type { MemorySearchConfig } from "./host/marketingclaw-runtime-config.js";
