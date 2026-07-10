// Whatsapp API module exposes the plugin public contract.
export { resolveIdentityNamePrefix } from "marketingclaw/plugin-sdk/agent-runtime";
export { formatInboundEnvelope } from "marketingclaw/plugin-sdk/channel-inbound";
export { resolveInboundSessionEnvelopeContext } from "marketingclaw/plugin-sdk/channel-inbound";
export { toLocationContext } from "marketingclaw/plugin-sdk/channel-inbound";
export {
  createChannelMessageReplyPipeline,
  resolveChannelMessageSourceReplyDeliveryMode,
} from "marketingclaw/plugin-sdk/channel-outbound";
export {
  isControlCommandMessage,
  shouldComputeCommandAuthorized,
} from "marketingclaw/plugin-sdk/command-detection";
export { resolveChannelContextVisibilityMode } from "../config.runtime.js";
export { getAgentScopedMediaLocalRoots } from "marketingclaw/plugin-sdk/media-runtime";
export type LoadConfigFn = typeof import("../config.runtime.js").getRuntimeConfig;
export {
  buildHistoryContextFromEntries,
  type HistoryEntry,
} from "marketingclaw/plugin-sdk/reply-history";
export { resolveSendableOutboundReplyParts } from "marketingclaw/plugin-sdk/reply-payload";
export {
  dispatchReplyWithBufferedBlockDispatcher,
  finalizeInboundContext,
  resolveChunkMode,
  resolveTextChunkLimit,
  type getReplyFromConfig,
  type ReplyPayload,
} from "marketingclaw/plugin-sdk/reply-runtime";
export {
  resolveInboundLastRouteSessionKey,
  type resolveAgentRoute,
} from "marketingclaw/plugin-sdk/routing";
export {
  logVerbose,
  shouldLogVerbose,
  type getChildLogger,
} from "marketingclaw/plugin-sdk/runtime-env";
export { resolvePinnedMainDmOwnerFromAllowlist } from "marketingclaw/plugin-sdk/security-runtime";
export { resolveMarkdownTableMode } from "marketingclaw/plugin-sdk/markdown-table-runtime";
export { jidToE164, normalizeE164 } from "../../text-runtime.js";
