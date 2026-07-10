// Narrow Matrix monitor helper seam.
// Keep monitor internals off the broad package runtime-api barrel so monitor
// tests and shared workers do not pull unrelated Matrix helper surfaces.

export type { NormalizedLocation } from "marketingclaw/plugin-sdk/channel-inbound";
export type { PluginRuntime, RuntimeLogger } from "marketingclaw/plugin-sdk/plugin-runtime";
export type { BlockReplyContext, ReplyPayload } from "marketingclaw/plugin-sdk/reply-runtime";
export type {
  MarkdownTableMode,
  MarketingClawConfig,
} from "marketingclaw/plugin-sdk/config-contracts";
export type { RuntimeEnv } from "marketingclaw/plugin-sdk/runtime";
export {
  addAllowlistUserEntriesFromConfigEntry,
  buildAllowlistResolutionSummary,
  canonicalizeAllowlistWithResolvedIds,
  formatAllowlistMatchMeta,
  patchAllowlistUsersInConfigEntries,
  summarizeMapping,
} from "marketingclaw/plugin-sdk/allow-from";
export {
  createReplyPrefixOptions,
  createTypingCallbacks,
} from "marketingclaw/plugin-sdk/channel-outbound";
export { formatLocationText, toLocationContext } from "marketingclaw/plugin-sdk/channel-inbound";
export { getAgentScopedMediaLocalRoots } from "marketingclaw/plugin-sdk/agent-media-payload";
export { logInboundDrop } from "marketingclaw/plugin-sdk/channel-inbound";
export { logTypingFailure } from "marketingclaw/plugin-sdk/channel-outbound";
export {
  buildChannelKeyCandidates,
  resolveChannelEntryMatch,
} from "marketingclaw/plugin-sdk/channel-targets";
