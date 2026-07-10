// Mattermost API module exposes the plugin public contract.
export { createAccountStatusSink } from "marketingclaw/plugin-sdk/channel-outbound";
export type { ChannelPlugin } from "marketingclaw/plugin-sdk/core";
export { DEFAULT_ACCOUNT_ID } from "marketingclaw/plugin-sdk/core";
export { chunkTextForOutbound } from "marketingclaw/plugin-sdk/text-chunking";
