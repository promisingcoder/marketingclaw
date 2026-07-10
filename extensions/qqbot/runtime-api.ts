// Qqbot API module exposes the plugin public contract.
export type {
  ChannelPlugin,
  MarketingClawPluginApi,
  PluginRuntime,
} from "marketingclaw/plugin-sdk/core";
export type { MarketingClawConfig } from "marketingclaw/plugin-sdk/config-contracts";
export type {
  MarketingClawPluginService,
  MarketingClawPluginServiceContext,
  PluginLogger,
} from "marketingclaw/plugin-sdk/core";
export type { ResolvedQQBotAccount, QQBotAccountConfig } from "./src/types.js";
export { getQQBotRuntime, setQQBotRuntime } from "./src/bridge/runtime.js";
