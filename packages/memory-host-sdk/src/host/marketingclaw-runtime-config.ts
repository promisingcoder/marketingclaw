// Config-facing runtime facade for memory host packages.
// This keeps memory plugins off broader core config modules and their private helpers.
export {
  getRuntimeConfig,
  hasConfiguredSecretInput,
  loadConfig,
  normalizeResolvedSecretInputString,
  parseDurationMs,
  parseNonNegativeByteSize,
  resolveSessionTranscriptsDirForAgent,
  resolveStateDir,
} from "./marketingclaw-runtime.js";
export type {
  MemoryBackend,
  MemoryCitationsMode,
  MemoryQmdConfig,
  MemoryQmdIndexPath,
  MemoryQmdMcporterConfig,
  MemoryQmdSearchMode,
  MemorySearchConfig,
  MarketingClawConfig,
  SecretInput,
  SessionSendPolicyConfig,
} from "./marketingclaw-runtime.js";
