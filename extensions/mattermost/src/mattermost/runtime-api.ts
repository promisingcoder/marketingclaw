// Mattermost API module exposes the plugin public contract.
export type {
  BaseProbeResult,
  ChannelAccountSnapshot,
  ChannelDirectoryEntry,
  ChatType,
  HistoryEntry,
  MarketingClawConfig,
  MarketingClawPluginApi,
  ReplyPayload,
} from "marketingclaw/plugin-sdk/core";
export type { RuntimeEnv } from "marketingclaw/plugin-sdk/runtime";
export { buildAgentMediaPayload } from "marketingclaw/plugin-sdk/agent-media-payload";
export { resolveAllowlistMatchSimple } from "marketingclaw/plugin-sdk/allow-from";
export { logInboundDrop } from "marketingclaw/plugin-sdk/channel-inbound";
export { createChannelPairingController } from "marketingclaw/plugin-sdk/channel-pairing";
export { createChannelMessageReplyPipeline } from "marketingclaw/plugin-sdk/channel-outbound";
export { logTypingFailure } from "marketingclaw/plugin-sdk/channel-feedback";
export {
  listSkillCommandsForAgents,
  resolveControlCommandGate,
} from "marketingclaw/plugin-sdk/command-auth-native";
export { buildModelsProviderData } from "marketingclaw/plugin-sdk/models-provider-runtime";
export { isDangerousNameMatchingEnabled } from "marketingclaw/plugin-sdk/dangerous-name-runtime";
export {
  resolveAllowlistProviderRuntimeGroupPolicy,
  resolveDefaultGroupPolicy,
  warnMissingProviderGroupPolicyFallbackOnce,
} from "marketingclaw/plugin-sdk/runtime-group-policy";
export { resolveChannelMediaMaxBytes } from "marketingclaw/plugin-sdk/media-runtime";
export { loadOutboundMediaFromUrl } from "marketingclaw/plugin-sdk/outbound-media";
// Legacy map-helper exports stay for older plugin consumers. New message-turn
// code should use createChannelHistoryWindow.
export {
  DEFAULT_GROUP_HISTORY_LIMIT,
  createChannelHistoryWindow,
  buildInboundHistoryFromMap,
  buildPendingHistoryContextFromMap,
  recordPendingHistoryEntryIfEnabled,
} from "marketingclaw/plugin-sdk/reply-history";
export { registerPluginHttpRoute } from "marketingclaw/plugin-sdk/webhook-targets";
export {
  isRequestBodyLimitError,
  readRequestBodyWithLimit,
} from "marketingclaw/plugin-sdk/webhook-ingress";
export {
  isTrustedProxyAddress,
  parseStrictPositiveInteger,
  resolveClientIp,
} from "marketingclaw/plugin-sdk/core";
export { parseTcpPort } from "marketingclaw/plugin-sdk/number-runtime";
