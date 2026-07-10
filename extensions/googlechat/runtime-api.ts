// Private runtime barrel for the bundled Google Chat extension.
// Keep this barrel thin and avoid broad plugin-sdk surfaces during bootstrap.

export { DEFAULT_ACCOUNT_ID } from "marketingclaw/plugin-sdk/account-id";
export {
  createActionGate,
  jsonResult,
  readNumberParam,
  readReactionParams,
  readStringParam,
} from "marketingclaw/plugin-sdk/channel-actions";
export { buildChannelConfigSchema } from "marketingclaw/plugin-sdk/channel-config-primitives";
export type {
  ChannelMessageActionAdapter,
  ChannelMessageActionName,
  ChannelStatusIssue,
} from "marketingclaw/plugin-sdk/channel-contract";
export { missingTargetError } from "marketingclaw/plugin-sdk/channel-feedback";
export {
  createAccountStatusSink,
  runPassiveAccountLifecycle,
} from "marketingclaw/plugin-sdk/channel-outbound";
export { createChannelPairingController } from "marketingclaw/plugin-sdk/channel-pairing";
export { createChannelMessageReplyPipeline } from "marketingclaw/plugin-sdk/channel-outbound";
export { PAIRING_APPROVED_MESSAGE } from "marketingclaw/plugin-sdk/channel-status";
export { chunkTextForOutbound } from "marketingclaw/plugin-sdk/text-chunking";
export type { MarketingClawConfig } from "marketingclaw/plugin-sdk/config-contracts";
export { GoogleChatConfigSchema } from "marketingclaw/plugin-sdk/bundled-channel-config-schema";
export {
  GROUP_POLICY_BLOCKED_LABEL,
  resolveAllowlistProviderRuntimeGroupPolicy,
  resolveDefaultGroupPolicy,
  warnMissingProviderGroupPolicyFallbackOnce,
} from "marketingclaw/plugin-sdk/runtime-group-policy";
export { isDangerousNameMatchingEnabled } from "marketingclaw/plugin-sdk/dangerous-name-runtime";
export {
  readRemoteMediaBuffer,
  resolveChannelMediaMaxBytes,
} from "marketingclaw/plugin-sdk/media-runtime";
export { loadOutboundMediaFromUrl } from "marketingclaw/plugin-sdk/outbound-media";
export type { PluginRuntime } from "marketingclaw/plugin-sdk/runtime-store";
export { fetchWithSsrFGuard } from "marketingclaw/plugin-sdk/ssrf-runtime";
export type {
  GoogleChatAccountConfig,
  GoogleChatConfig,
} from "marketingclaw/plugin-sdk/config-contracts";
export { extractToolSend } from "marketingclaw/plugin-sdk/tool-send";
export { resolveInboundMentionDecision } from "marketingclaw/plugin-sdk/channel-inbound";
export { resolveInboundRouteEnvelopeBuilderWithRuntime } from "marketingclaw/plugin-sdk/inbound-envelope";
export { resolveWebhookPath } from "marketingclaw/plugin-sdk/webhook-ingress";
export {
  registerWebhookTargetWithPluginRoute,
  resolveWebhookTargetWithAuthOrReject,
  withResolvedWebhookRequestPipeline,
} from "marketingclaw/plugin-sdk/webhook-targets";
export {
  createWebhookInFlightLimiter,
  readJsonWebhookBodyOrReject,
  type WebhookInFlightLimiter,
} from "marketingclaw/plugin-sdk/webhook-request-guards";
export { setGoogleChatRuntime } from "./src/runtime.js";
