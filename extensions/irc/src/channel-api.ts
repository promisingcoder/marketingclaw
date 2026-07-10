// Irc API module exposes the plugin public contract.
export { createAccountStatusSink } from "marketingclaw/plugin-sdk/channel-outbound";
export { DEFAULT_ACCOUNT_ID } from "marketingclaw/plugin-sdk/account-id";
export type { ChannelPlugin } from "marketingclaw/plugin-sdk/channel-core";
export { PAIRING_APPROVED_MESSAGE } from "marketingclaw/plugin-sdk/channel-status";
export { buildBaseChannelStatusSummary } from "marketingclaw/plugin-sdk/status-helpers";
export { chunkTextForOutbound } from "marketingclaw/plugin-sdk/text-chunking";
