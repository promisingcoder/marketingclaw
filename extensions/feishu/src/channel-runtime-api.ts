// Feishu API module exposes the plugin public contract.
export type {
  ChannelMessageActionName,
  ChannelMeta,
  ChannelPlugin,
  ClawdbotConfig,
} from "../runtime-api.js";

export { DEFAULT_ACCOUNT_ID } from "marketingclaw/plugin-sdk/account-resolution";
export { createActionGate } from "marketingclaw/plugin-sdk/channel-actions";
export { buildChannelConfigSchema } from "marketingclaw/plugin-sdk/channel-config-primitives";
export {
  buildProbeChannelStatusSummary,
  createDefaultChannelRuntimeState,
} from "marketingclaw/plugin-sdk/status-helpers";
export { PAIRING_APPROVED_MESSAGE } from "marketingclaw/plugin-sdk/channel-status";
export { chunkTextForOutbound } from "marketingclaw/plugin-sdk/text-chunking";
