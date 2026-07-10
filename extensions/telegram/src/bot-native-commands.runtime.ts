// Telegram plugin module implements bot native commands behavior.
export {
  ensureConfiguredBindingRouteReady,
  recordInboundSessionMetaSafe,
} from "marketingclaw/plugin-sdk/conversation-runtime";
export { getAgentScopedMediaLocalRoots } from "marketingclaw/plugin-sdk/media-runtime";
export {
  executePluginCommand,
  getPluginCommandSpecs,
  matchPluginCommand,
} from "marketingclaw/plugin-sdk/plugin-runtime";
export {
  finalizeInboundContext,
  resolveChunkMode,
} from "marketingclaw/plugin-sdk/reply-dispatch-runtime";
export { resolveThreadSessionKeys } from "marketingclaw/plugin-sdk/routing";
export { getSessionEntry } from "marketingclaw/plugin-sdk/session-store-runtime";
