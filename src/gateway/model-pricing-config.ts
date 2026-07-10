// Gateway model-pricing config helper.
// Resolves whether cost/pricing metadata should be available to Gateway surfaces.
import type { MarketingClawConfig } from "../config/types.marketingclaw.js";

/** Returns whether gateway model pricing/cost metadata should be shown. */
export function isGatewayModelPricingEnabled(config: MarketingClawConfig): boolean {
  return config.models?.pricing?.enabled !== false;
}
