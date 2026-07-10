// Discord helper module supports runtime config behavior.
import {
  getRuntimeConfigSnapshot,
  getRuntimeConfigSourceSnapshot,
  selectApplicableRuntimeConfig,
} from "marketingclaw/plugin-sdk/runtime-config-snapshot";
import type { MarketingClawConfig } from "./runtime-api.js";

export function selectDiscordRuntimeConfig(inputConfig: MarketingClawConfig): MarketingClawConfig {
  return (
    selectApplicableRuntimeConfig({
      inputConfig,
      runtimeConfig: getRuntimeConfigSnapshot(),
      runtimeSourceConfig: getRuntimeConfigSourceSnapshot(),
    }) ?? inputConfig
  );
}
