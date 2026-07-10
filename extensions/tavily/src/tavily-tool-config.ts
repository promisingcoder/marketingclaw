// Tavily helper module supports tavily tool config behavior.
import type { MarketingClawConfig } from "marketingclaw/plugin-sdk/config-contracts";
import type { MarketingClawPluginToolContext } from "marketingclaw/plugin-sdk/plugin-entry";
import type { MarketingClawPluginApi } from "marketingclaw/plugin-sdk/plugin-runtime";

export type TavilyToolConfigContext = Pick<
  MarketingClawPluginToolContext,
  "config" | "runtimeConfig" | "getRuntimeConfig"
>;

export function resolveTavilyToolConfig(
  api: MarketingClawPluginApi,
  ctx?: TavilyToolConfigContext,
): MarketingClawConfig {
  return ctx?.getRuntimeConfig?.() ?? ctx?.runtimeConfig ?? ctx?.config ?? api.config;
}
