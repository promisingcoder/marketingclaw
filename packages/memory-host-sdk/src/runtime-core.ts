// Focused runtime contract for memory plugin config/state/helpers.

export type { AnyAgentTool } from "./host/marketingclaw-runtime-agent.js";
export { resolveCronStyleNow } from "./host/marketingclaw-runtime-agent.js";
export { DEFAULT_AGENT_COMPACTION_RESERVE_TOKENS_FLOOR } from "./host/marketingclaw-runtime-agent.js";
export {
  resolveDefaultAgentId,
  resolveSessionAgentId,
} from "./host/marketingclaw-runtime-agent.js";
export { resolveMemorySearchConfig } from "./host/marketingclaw-runtime-agent.js";
export {
  asToolParamsRecord,
  jsonResult,
  readNumberParam,
  readStringParam,
} from "./host/marketingclaw-runtime-agent.js";
export { SILENT_REPLY_TOKEN } from "./host/marketingclaw-runtime-session.js";
export { parseNonNegativeByteSize } from "./host/marketingclaw-runtime-config.js";
export {
  getRuntimeConfig,
  /** @deprecated Use getRuntimeConfig(), or pass the already loaded config through the call path. */
  loadConfig,
} from "./host/marketingclaw-runtime-config.js";
export { resolveStateDir } from "./host/marketingclaw-runtime-config.js";
export { resolveSessionTranscriptsDirForAgent } from "./host/marketingclaw-runtime-config.js";
export { emptyPluginConfigSchema } from "./host/marketingclaw-runtime-memory.js";
export {
  buildActiveMemoryPromptSection,
  getMemoryCapabilityRegistration,
  listActiveMemoryPublicArtifacts,
} from "./host/marketingclaw-runtime-memory.js";
export { parseAgentSessionKey } from "./host/marketingclaw-runtime-agent.js";
export type { MarketingClawConfig } from "./host/marketingclaw-runtime-config.js";
export type { MemoryCitationsMode } from "./host/marketingclaw-runtime-config.js";
export type {
  MemoryFlushPlan,
  MemoryFlushPlanResolver,
  MemoryPluginCapability,
  MemoryPluginPublicArtifact,
  MemoryPluginPublicArtifactsProvider,
  MemoryPluginRuntime,
  MemoryPromptSectionBuilder,
} from "./host/marketingclaw-runtime-memory.js";
export type { MarketingClawPluginApi } from "./host/marketingclaw-runtime-memory.js";
