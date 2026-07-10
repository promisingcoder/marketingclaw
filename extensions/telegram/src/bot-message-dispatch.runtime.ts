// Telegram plugin module implements bot message dispatch behavior.
export {
  getSessionEntry,
  resolveStorePath,
  type SessionEntry,
} from "marketingclaw/plugin-sdk/session-store-runtime";
export { resolveMarkdownTableMode } from "marketingclaw/plugin-sdk/markdown-table-runtime";
export { getAgentScopedMediaLocalRoots } from "marketingclaw/plugin-sdk/media-runtime";
export { resolveChunkMode } from "marketingclaw/plugin-sdk/reply-dispatch-runtime";
export {
  generateTelegramTopicLabel as generateTopicLabel,
  resolveAutoTopicLabelConfig,
} from "./auto-topic-label.js";
