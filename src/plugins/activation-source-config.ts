/** Resolves the source config snapshot used for plugin activation policy decisions. */
import {
  getRuntimeConfigSnapshot,
  getRuntimeConfigSourceSnapshot,
} from "../config/runtime-snapshot.js";
import type { MarketingClawConfig } from "../config/types.marketingclaw.js";

/** Resolves the source config used for plugin activation policy decisions. */
export function resolvePluginActivationSourceConfig(params: {
  config?: MarketingClawConfig;
  activationSourceConfig?: MarketingClawConfig;
}): MarketingClawConfig {
  if (params.activationSourceConfig !== undefined) {
    return params.activationSourceConfig;
  }
  const sourceSnapshot = getRuntimeConfigSourceSnapshot();
  if (sourceSnapshot && params.config === getRuntimeConfigSnapshot()) {
    return sourceSnapshot;
  }
  return params.config ?? {};
}
