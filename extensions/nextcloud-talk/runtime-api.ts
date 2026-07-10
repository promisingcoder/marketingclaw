// Private runtime barrel for the bundled Nextcloud Talk extension.
// Keep this barrel thin and aligned with the local extension surface.

export type { AllowlistMatch } from "marketingclaw/plugin-sdk/allow-from";
export type { ChannelGroupContext } from "marketingclaw/plugin-sdk/channel-contract";
export { logInboundDrop } from "marketingclaw/plugin-sdk/channel-inbound";
export { createChannelPairingController } from "marketingclaw/plugin-sdk/channel-pairing";
export type {
  BlockStreamingCoalesceConfig,
  DmConfig,
  DmPolicy,
  GroupPolicy,
  GroupToolPolicyConfig,
  MarketingClawConfig,
} from "marketingclaw/plugin-sdk/config-contracts";
export {
  GROUP_POLICY_BLOCKED_LABEL,
  resolveAllowlistProviderRuntimeGroupPolicy,
  resolveDefaultGroupPolicy,
  warnMissingProviderGroupPolicyFallbackOnce,
} from "marketingclaw/plugin-sdk/runtime-group-policy";
export { createChannelMessageReplyPipeline } from "marketingclaw/plugin-sdk/channel-outbound";
export type { OutboundReplyPayload } from "marketingclaw/plugin-sdk/reply-payload";
export { deliverFormattedTextWithAttachments } from "marketingclaw/plugin-sdk/reply-payload";
export type { PluginRuntime } from "marketingclaw/plugin-sdk/runtime-store";
export type { RuntimeEnv } from "marketingclaw/plugin-sdk/runtime";
export type { SecretInput } from "marketingclaw/plugin-sdk/secret-input";
export { fetchWithSsrFGuard } from "marketingclaw/plugin-sdk/ssrf-runtime";
export { setNextcloudTalkRuntime } from "./src/runtime.js";
