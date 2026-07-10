// Telegram plugin module implements bot message context.session behavior.
export { buildChannelInboundEventContext } from "marketingclaw/plugin-sdk/channel-inbound";
export {
  readAmbientTranscriptWatermark,
  readSessionUpdatedAt,
  resolveAmbientTranscriptWatermarkKey,
  resolveStorePath,
} from "marketingclaw/plugin-sdk/session-store-runtime";
export { recordInboundSession } from "marketingclaw/plugin-sdk/conversation-runtime";
export { resolveInboundLastRouteSessionKey } from "marketingclaw/plugin-sdk/routing";
export { resolvePinnedMainDmOwnerFromAllowlist } from "marketingclaw/plugin-sdk/security-runtime";
