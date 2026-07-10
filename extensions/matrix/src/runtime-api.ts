// Matrix API module exposes the plugin public contract.
export {
  DEFAULT_ACCOUNT_ID,
  normalizeAccountId,
  normalizeOptionalAccountId,
} from "marketingclaw/plugin-sdk/account-id";
export {
  createActionGate,
  jsonResult,
  readNumberParam,
  readPositiveIntegerParam,
  readReactionParams,
  readStringArrayParam,
  readStringParam,
  ToolAuthorizationError,
} from "marketingclaw/plugin-sdk/channel-actions";
export { buildChannelConfigSchema } from "marketingclaw/plugin-sdk/channel-config-primitives";
export type { ChannelPlugin } from "marketingclaw/plugin-sdk/channel-core";
export type {
  BaseProbeResult,
  ChannelDirectoryEntry,
  ChannelGroupContext,
  ChannelMessageActionAdapter,
  ChannelMessageActionContext,
  ChannelMessageActionName,
  ChannelMessageToolDiscovery,
  ChannelOutboundAdapter,
  ChannelResolveKind,
  ChannelResolveResult,
  ChannelToolSend,
} from "marketingclaw/plugin-sdk/channel-contract";
export {
  formatLocationText,
  toLocationContext,
  type NormalizedLocation,
} from "marketingclaw/plugin-sdk/channel-inbound";
export { logInboundDrop } from "marketingclaw/plugin-sdk/channel-inbound";
export { logTypingFailure } from "marketingclaw/plugin-sdk/channel-outbound";
export { resolveAckReaction } from "marketingclaw/plugin-sdk/channel-feedback";
export type { ChannelSetupInput } from "marketingclaw/plugin-sdk/setup";
export type {
  MarketingClawConfig,
  ContextVisibilityMode,
  DmPolicy,
  GroupPolicy,
} from "marketingclaw/plugin-sdk/config-contracts";
export type { GroupToolPolicyConfig } from "marketingclaw/plugin-sdk/config-contracts";
export type { WizardPrompter } from "marketingclaw/plugin-sdk/setup";
export type { SecretInput } from "marketingclaw/plugin-sdk/secret-input";
export {
  GROUP_POLICY_BLOCKED_LABEL,
  resolveAllowlistProviderRuntimeGroupPolicy,
  resolveDefaultGroupPolicy,
  warnMissingProviderGroupPolicyFallbackOnce,
} from "marketingclaw/plugin-sdk/runtime-group-policy";
export {
  addWildcardAllowFrom,
  formatDocsLink,
  hasConfiguredSecretInput,
  mergeAllowFromEntries,
  moveSingleAccountChannelSectionToDefaultAccount,
  promptAccountId,
  promptChannelAccessConfig,
  splitSetupEntries,
} from "marketingclaw/plugin-sdk/setup";
export type { RuntimeEnv } from "marketingclaw/plugin-sdk/runtime";
export {
  assertHttpUrlTargetsPrivateNetwork,
  closeDispatcher,
  createPinnedDispatcher,
  isPrivateOrLoopbackHost,
  resolvePinnedHostnameWithPolicy,
  ssrfPolicyFromDangerouslyAllowPrivateNetwork,
  ssrfPolicyFromAllowPrivateNetwork,
  type LookupFn,
  type SsrFPolicy,
} from "marketingclaw/plugin-sdk/ssrf-runtime";
export { dispatchReplyFromConfigWithSettledDispatcher } from "marketingclaw/plugin-sdk/channel-inbound";
export {
  ensureConfiguredAcpBindingReady,
  resolveConfiguredAcpBindingRecord,
} from "marketingclaw/plugin-sdk/acp-binding-runtime";
export {
  buildProbeChannelStatusSummary,
  collectStatusIssuesFromLastError,
  PAIRING_APPROVED_MESSAGE,
} from "marketingclaw/plugin-sdk/channel-status";
export {
  getSessionBindingService,
  resolveThreadBindingIdleTimeoutMsForChannel,
  resolveThreadBindingMaxAgeMsForChannel,
} from "marketingclaw/plugin-sdk/conversation-runtime";
export { resolveOutboundSendDep } from "marketingclaw/plugin-sdk/channel-outbound";
export { resolveAgentIdFromSessionKey } from "marketingclaw/plugin-sdk/routing";
export { chunkTextForOutbound } from "marketingclaw/plugin-sdk/text-chunking";
export { createChannelMessageReplyPipeline } from "marketingclaw/plugin-sdk/channel-outbound";
export { loadOutboundMediaFromUrl } from "marketingclaw/plugin-sdk/outbound-media";
export { normalizePollInput, type PollInput } from "marketingclaw/plugin-sdk/poll-runtime";
export { writeJsonFileAtomically } from "marketingclaw/plugin-sdk/json-store";
export {
  buildChannelKeyCandidates,
  resolveChannelEntryMatch,
} from "marketingclaw/plugin-sdk/channel-targets";
export { buildTimeoutAbortSignal } from "./matrix/sdk/timeout-abort-signal.js";
export { formatZonedTimestamp } from "marketingclaw/plugin-sdk/time-runtime";
export type { PluginRuntime, RuntimeLogger } from "marketingclaw/plugin-sdk/plugin-runtime";
export type { ReplyPayload } from "marketingclaw/plugin-sdk/reply-runtime";
// resolveMatrixAccountStringValues already comes from the Matrix API barrel.
// Re-exporting auth-precedence here makes TS source loaders define the export twice.
