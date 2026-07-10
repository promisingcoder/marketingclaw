// Qa Channel API module exposes the plugin public contract.
export type {
  ChannelMessageActionAdapter,
  ChannelMessageActionName,
  ChannelGatewayContext,
} from "marketingclaw/plugin-sdk/channel-contract";
export type { ChannelPlugin } from "marketingclaw/plugin-sdk/channel-core";
export type { MarketingClawConfig } from "marketingclaw/plugin-sdk/config-contracts";
export type { RuntimeEnv } from "marketingclaw/plugin-sdk/runtime";
export type { PluginRuntime } from "marketingclaw/plugin-sdk/runtime-store";
export {
  buildChannelConfigSchema,
  buildChannelOutboundSessionRoute,
  createChatChannelPlugin,
  defineChannelPluginEntry,
} from "marketingclaw/plugin-sdk/channel-core";
export { jsonResult, readStringParam } from "marketingclaw/plugin-sdk/channel-actions";
export { getChatChannelMeta } from "marketingclaw/plugin-sdk/channel-plugin-common";
export {
  createComputedAccountStatusAdapter,
  createDefaultChannelRuntimeState,
} from "marketingclaw/plugin-sdk/status-helpers";
export { createPluginRuntimeStore } from "marketingclaw/plugin-sdk/runtime-store";
export { createChannelMessageReplyPipeline } from "marketingclaw/plugin-sdk/channel-outbound";
