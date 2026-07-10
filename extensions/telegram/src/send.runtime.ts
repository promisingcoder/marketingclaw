// Telegram plugin module implements send behavior.
export { requireRuntimeConfig } from "marketingclaw/plugin-sdk/plugin-config-runtime";
export { resolveMarkdownTableMode } from "marketingclaw/plugin-sdk/markdown-table-runtime";
export type { MarketingClawConfig } from "marketingclaw/plugin-sdk/config-contracts";
export type { PollInput, MediaKind } from "marketingclaw/plugin-sdk/media-runtime";
export {
  buildOutboundMediaLoadOptions,
  getImageMetadata,
  isGifMedia,
  kindFromMime,
  normalizePollInput,
  probeVideoDimensions,
} from "marketingclaw/plugin-sdk/media-runtime";
export { loadWebMedia } from "marketingclaw/plugin-sdk/web-media";
