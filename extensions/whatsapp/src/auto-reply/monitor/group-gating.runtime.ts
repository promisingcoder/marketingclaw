// Whatsapp plugin module implements group gating behavior.
export {
  implicitMentionKindWhen,
  resolveInboundMentionDecision,
} from "marketingclaw/plugin-sdk/channel-mention-gating";
export { hasControlCommand } from "marketingclaw/plugin-sdk/command-detection";
export { createChannelHistoryWindow } from "marketingclaw/plugin-sdk/reply-history";
export { parseActivationCommand } from "marketingclaw/plugin-sdk/group-activation";
export { normalizeE164 } from "../../text-runtime.js";
