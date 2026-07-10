// Private runtime barrel for the bundled IRC extension.
// Keep this barrel thin and generic-only.

export type { BaseProbeResult } from "marketingclaw/plugin-sdk/channel-contract";
export type { ChannelPlugin } from "marketingclaw/plugin-sdk/channel-core";
export type { MarketingClawConfig } from "marketingclaw/plugin-sdk/config-contracts";
export type { PluginRuntime } from "marketingclaw/plugin-sdk/runtime-store";
export type { RuntimeEnv } from "marketingclaw/plugin-sdk/runtime";
export type {
  BlockStreamingCoalesceConfig,
  DmConfig,
  DmPolicy,
  GroupPolicy,
  GroupToolPolicyBySenderConfig,
  GroupToolPolicyConfig,
  MarkdownConfig,
} from "marketingclaw/plugin-sdk/config-contracts";
export type { OutboundReplyPayload } from "marketingclaw/plugin-sdk/reply-payload";
export { DEFAULT_ACCOUNT_ID } from "marketingclaw/plugin-sdk/account-id";
export { buildChannelConfigSchema } from "marketingclaw/plugin-sdk/channel-config-primitives";
export {
  PAIRING_APPROVED_MESSAGE,
  buildBaseChannelStatusSummary,
} from "marketingclaw/plugin-sdk/channel-status";
export { createChannelPairingController } from "marketingclaw/plugin-sdk/channel-pairing";
export { createAccountStatusSink } from "marketingclaw/plugin-sdk/channel-outbound";
export { resolveControlCommandGate } from "marketingclaw/plugin-sdk/command-auth-native";
export { createChannelMessageReplyPipeline } from "marketingclaw/plugin-sdk/channel-outbound";
export { chunkTextForOutbound } from "marketingclaw/plugin-sdk/text-chunking";
export {
  deliverFormattedTextWithAttachments,
  formatTextWithAttachmentLinks,
  resolveOutboundMediaUrls,
} from "marketingclaw/plugin-sdk/reply-payload";
export {
  GROUP_POLICY_BLOCKED_LABEL,
  resolveAllowlistProviderRuntimeGroupPolicy,
  resolveDefaultGroupPolicy,
  warnMissingProviderGroupPolicyFallbackOnce,
} from "marketingclaw/plugin-sdk/runtime-group-policy";
export { isDangerousNameMatchingEnabled } from "marketingclaw/plugin-sdk/dangerous-name-runtime";
export { logInboundDrop } from "marketingclaw/plugin-sdk/channel-inbound";
