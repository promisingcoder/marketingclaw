// Zalo plugin module implements runtime support behavior.
export type { ReplyPayload } from "marketingclaw/plugin-sdk/reply-runtime";
export type { MarketingClawConfig, GroupPolicy } from "marketingclaw/plugin-sdk/config-contracts";
export type { MarkdownTableMode } from "marketingclaw/plugin-sdk/config-contracts";
export type { BaseTokenResolution } from "marketingclaw/plugin-sdk/channel-contract";
export type {
  BaseProbeResult,
  ChannelAccountSnapshot,
  ChannelMessageActionAdapter,
  ChannelMessageActionName,
  ChannelStatusIssue,
} from "marketingclaw/plugin-sdk/channel-contract";
export type { SecretInput } from "marketingclaw/plugin-sdk/secret-input";
export type { ChannelPlugin, PluginRuntime, WizardPrompter } from "marketingclaw/plugin-sdk/core";
export type { RuntimeEnv } from "marketingclaw/plugin-sdk/runtime";
export type { OutboundReplyPayload } from "marketingclaw/plugin-sdk/reply-payload";
export {
  DEFAULT_ACCOUNT_ID,
  buildChannelConfigSchema,
  createDedupeCache,
  formatPairingApproveHint,
  jsonResult,
  normalizeAccountId,
  readStringParam,
  resolveClientIp,
} from "marketingclaw/plugin-sdk/core";
export {
  applyAccountNameToChannelSection,
  applySetupAccountConfigPatch,
  buildSingleChannelSecretPromptState,
  mergeAllowFromEntries,
  migrateBaseNameToDefaultAccount,
  promptSingleChannelSecretInput,
  runSingleChannelSecretStep,
  setTopLevelChannelDmPolicyWithAllowFrom,
} from "marketingclaw/plugin-sdk/setup";
export {
  buildSecretInputSchema,
  hasConfiguredSecretInput,
  normalizeResolvedSecretInputString,
  normalizeSecretInputString,
} from "marketingclaw/plugin-sdk/secret-input";
export {
  buildTokenChannelStatusSummary,
  PAIRING_APPROVED_MESSAGE,
} from "marketingclaw/plugin-sdk/channel-status";
export { buildBaseAccountStatusSnapshot } from "marketingclaw/plugin-sdk/status-helpers";
export { chunkTextForOutbound } from "marketingclaw/plugin-sdk/text-chunking";
export {
  formatAllowFromLowercase,
  isNormalizedSenderAllowed,
} from "marketingclaw/plugin-sdk/allow-from";
export { addWildcardAllowFrom } from "marketingclaw/plugin-sdk/setup";
export { resolveOpenProviderRuntimeGroupPolicy } from "marketingclaw/plugin-sdk/runtime-group-policy";
export {
  warnMissingProviderGroupPolicyFallbackOnce,
  resolveDefaultGroupPolicy,
} from "marketingclaw/plugin-sdk/runtime-group-policy";
export { createChannelPairingController } from "marketingclaw/plugin-sdk/channel-pairing";
export { createChannelMessageReplyPipeline } from "marketingclaw/plugin-sdk/channel-outbound";
export { logTypingFailure } from "marketingclaw/plugin-sdk/channel-feedback";
export {
  deliverTextOrMediaReply,
  isNumericTargetId,
  sendPayloadWithChunkedTextAndMedia,
} from "marketingclaw/plugin-sdk/reply-payload";
export { resolveInboundRouteEnvelopeBuilderWithRuntime } from "marketingclaw/plugin-sdk/inbound-envelope";
export { waitForAbortSignal } from "marketingclaw/plugin-sdk/runtime";
export {
  applyBasicWebhookRequestGuards,
  createFixedWindowRateLimiter,
  createWebhookAnomalyTracker,
  readJsonWebhookBodyOrReject,
  registerPluginHttpRoute,
  registerWebhookTarget,
  registerWebhookTargetWithPluginRoute,
  resolveWebhookPath,
  resolveWebhookTargetWithAuthOrRejectSync,
  WEBHOOK_ANOMALY_COUNTER_DEFAULTS,
  WEBHOOK_RATE_LIMIT_DEFAULTS,
  withResolvedWebhookRequestPipeline,
} from "marketingclaw/plugin-sdk/webhook-ingress";
export type {
  RegisterWebhookPluginRouteOptions,
  RegisterWebhookTargetOptions,
} from "marketingclaw/plugin-sdk/webhook-ingress";
