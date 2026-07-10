// Packed Plugin Sdk Type Smoke script supports MarketingClaw repository automation.
type PublicPluginSdkModules = [
  typeof import("marketingclaw/plugin-sdk"),
  typeof import("marketingclaw/plugin-sdk/channel-entry-contract"),
  typeof import("marketingclaw/plugin-sdk/config-contracts"),
  typeof import("marketingclaw/plugin-sdk/provider-entry"),
  typeof import("marketingclaw/plugin-sdk/runtime-env"),
];

const resolvedModules = null as unknown as PublicPluginSdkModules;

void resolvedModules;
