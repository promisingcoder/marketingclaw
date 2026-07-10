// Private runtime barrel for the bundled Nostr extension.
// Keep this barrel thin and aligned with the local extension surface.

export type { MarketingClawConfig } from "marketingclaw/plugin-sdk/config-contracts";
export { getPluginRuntimeGatewayRequestScope } from "marketingclaw/plugin-sdk/plugin-runtime";
export type { PluginRuntime } from "marketingclaw/plugin-sdk/runtime-store";
