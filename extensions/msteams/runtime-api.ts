// Private runtime barrel for the bundled Microsoft Teams extension.
// Keep this barrel thin and aligned with the local extension surface.

export { DEFAULT_ACCOUNT_ID } from "marketingclaw/plugin-sdk/account-id";
export type { AllowlistMatch } from "marketingclaw/plugin-sdk/allow-from";
export {
  mergeAllowlist,
  resolveAllowlistMatchSimple,
  summarizeMapping,
} from "marketingclaw/plugin-sdk/allow-from";
export type {
  BaseProbeResult,
  ChannelDirectoryEntry,
  ChannelGroupContext,
  ChannelMessageActionName,
  ChannelOutboundAdapter,
} from "marketingclaw/plugin-sdk/channel-contract";
export type { ChannelPlugin } from "marketingclaw/plugin-sdk/channel-core";
export { logTypingFailure } from "marketingclaw/plugin-sdk/channel-outbound";
export { createChannelPairingController } from "marketingclaw/plugin-sdk/channel-pairing";
export { resolveToolsBySender } from "marketingclaw/plugin-sdk/channel-policy";
export { createChannelMessageReplyPipeline } from "marketingclaw/plugin-sdk/channel-outbound";
export {
  PAIRING_APPROVED_MESSAGE,
  buildProbeChannelStatusSummary,
  createDefaultChannelRuntimeState,
} from "marketingclaw/plugin-sdk/channel-status";
export {
  buildChannelKeyCandidates,
  normalizeChannelSlug,
  resolveChannelEntryMatchWithFallback,
  resolveNestedAllowlistDecision,
} from "marketingclaw/plugin-sdk/channel-targets";
export type {
  GroupPolicy,
  GroupToolPolicyConfig,
  MSTeamsChannelConfig,
  MSTeamsCloudName,
  MSTeamsConfig,
  MSTeamsReplyStyle,
  MSTeamsTeamConfig,
  MarkdownTableMode,
  MarketingClawConfig,
} from "marketingclaw/plugin-sdk/config-contracts";
export { isDangerousNameMatchingEnabled } from "marketingclaw/plugin-sdk/dangerous-name-runtime";
export { resolveDefaultGroupPolicy } from "marketingclaw/plugin-sdk/runtime-group-policy";
export { withFileLock } from "marketingclaw/plugin-sdk/file-lock";
export { keepHttpServerTaskAlive } from "marketingclaw/plugin-sdk/channel-outbound";
export {
  detectMime,
  extensionForMime,
  extractOriginalFilename,
  getFileExtension,
  resolveChannelMediaMaxBytes,
} from "marketingclaw/plugin-sdk/media-runtime";
export { dispatchReplyFromConfigWithSettledDispatcher } from "marketingclaw/plugin-sdk/channel-inbound";
export { loadOutboundMediaFromUrl } from "marketingclaw/plugin-sdk/outbound-media";
export { buildMediaPayload } from "marketingclaw/plugin-sdk/reply-payload";
export type { ReplyPayload } from "marketingclaw/plugin-sdk/reply-payload";
export type { PluginRuntime } from "marketingclaw/plugin-sdk/runtime-store";
export type { RuntimeEnv } from "marketingclaw/plugin-sdk/runtime";
export type { SsrFPolicy } from "marketingclaw/plugin-sdk/ssrf-runtime";
export { fetchWithSsrFGuard } from "marketingclaw/plugin-sdk/ssrf-runtime";
export { normalizeStringEntries } from "marketingclaw/plugin-sdk/string-normalization-runtime";
export { chunkTextForOutbound } from "marketingclaw/plugin-sdk/text-chunking";
export { DEFAULT_WEBHOOK_MAX_BODY_BYTES } from "marketingclaw/plugin-sdk/webhook-ingress";
export { setMSTeamsRuntime } from "./src/runtime.js";
