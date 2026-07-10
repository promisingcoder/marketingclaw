// Private runtime barrel for the bundled Mattermost extension.
// Keep this barrel thin and generic-only.

export type {
  BaseProbeResult,
  ChannelAccountSnapshot,
  ChannelDirectoryEntry,
  ChannelGroupContext,
  ChannelMessageActionName,
  ChannelPlugin,
  ChatType,
  HistoryEntry,
  MarketingClawConfig,
  MarketingClawPluginApi,
  PluginRuntime,
} from "marketingclaw/plugin-sdk/core";
export type { RuntimeEnv } from "marketingclaw/plugin-sdk/runtime";
export type { ReplyPayload } from "marketingclaw/plugin-sdk/reply-runtime";
export type { ModelsProviderData } from "marketingclaw/plugin-sdk/models-provider-runtime";
export type {
  BlockStreamingCoalesceConfig,
  DmPolicy,
  GroupPolicy,
} from "marketingclaw/plugin-sdk/config-contracts";
export {
  DEFAULT_ACCOUNT_ID,
  buildChannelConfigSchema,
  createDedupeCache,
  parseStrictPositiveInteger,
  resolveClientIp,
  isTrustedProxyAddress,
} from "marketingclaw/plugin-sdk/core";
export { buildComputedAccountStatusSnapshot } from "marketingclaw/plugin-sdk/channel-status";
export { createAccountStatusSink } from "marketingclaw/plugin-sdk/channel-outbound";
export { buildAgentMediaPayload } from "marketingclaw/plugin-sdk/agent-media-payload";
export {
  listSkillCommandsForAgents,
  resolveControlCommandGate,
  resolveStoredModelOverride,
} from "marketingclaw/plugin-sdk/command-auth-native";
export { buildModelsProviderData } from "marketingclaw/plugin-sdk/models-provider-runtime";
export {
  GROUP_POLICY_BLOCKED_LABEL,
  resolveAllowlistProviderRuntimeGroupPolicy,
  resolveDefaultGroupPolicy,
  warnMissingProviderGroupPolicyFallbackOnce,
} from "marketingclaw/plugin-sdk/runtime-group-policy";
export { isDangerousNameMatchingEnabled } from "marketingclaw/plugin-sdk/dangerous-name-runtime";
export { resolveStorePath } from "marketingclaw/plugin-sdk/session-store-runtime";
export { formatInboundFromLabel } from "marketingclaw/plugin-sdk/channel-inbound";
export { logInboundDrop } from "marketingclaw/plugin-sdk/channel-inbound";
export { createChannelPairingController } from "marketingclaw/plugin-sdk/channel-pairing";
export { createChannelMessageReplyPipeline } from "marketingclaw/plugin-sdk/channel-outbound";
export { logTypingFailure } from "marketingclaw/plugin-sdk/channel-feedback";
export { loadOutboundMediaFromUrl } from "marketingclaw/plugin-sdk/outbound-media";
export { rawDataToString } from "marketingclaw/plugin-sdk/webhook-ingress";
export { chunkTextForOutbound } from "marketingclaw/plugin-sdk/text-chunking";
// Legacy map-helper exports stay for older plugin consumers. New message-turn
// code should use createChannelHistoryWindow.
export {
  DEFAULT_GROUP_HISTORY_LIMIT,
  createChannelHistoryWindow,
  buildPendingHistoryContextFromMap,
  clearHistoryEntriesIfEnabled,
  recordPendingHistoryEntryIfEnabled,
} from "marketingclaw/plugin-sdk/reply-history";
export { normalizeAccountId, resolveThreadSessionKeys } from "marketingclaw/plugin-sdk/routing";
export { resolveAllowlistMatchSimple } from "marketingclaw/plugin-sdk/allow-from";
export { registerPluginHttpRoute } from "marketingclaw/plugin-sdk/webhook-targets";
export {
  isRequestBodyLimitError,
  readRequestBodyWithLimit,
} from "marketingclaw/plugin-sdk/webhook-ingress";
export {
  applyAccountNameToChannelSection,
  applySetupAccountConfigPatch,
  migrateBaseNameToDefaultAccount,
} from "marketingclaw/plugin-sdk/setup";
export {
  getAgentScopedMediaLocalRoots,
  resolveChannelMediaMaxBytes,
} from "marketingclaw/plugin-sdk/media-runtime";
export { normalizeProviderId } from "marketingclaw/plugin-sdk/provider-model-shared";
export { setMattermostRuntime } from "./src/runtime.js";
