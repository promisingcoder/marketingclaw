// Diffs API module exposes the plugin public contract.
export type { MarketingClawConfig } from "marketingclaw/plugin-sdk/config-contracts";
export {
  definePluginEntry,
  type AnyAgentTool,
  type MarketingClawPluginApi,
  type MarketingClawPluginConfigSchema,
  type MarketingClawPluginToolContext,
  type PluginLogger,
} from "marketingclaw/plugin-sdk/plugin-entry";
export { resolvePreferredMarketingClawTmpDir } from "marketingclaw/plugin-sdk/temp-path";
