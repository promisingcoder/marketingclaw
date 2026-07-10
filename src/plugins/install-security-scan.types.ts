// Defines plugin install security scan result types.
import type { MarketingClawConfig } from "../config/types.marketingclaw.js";

/** Overrides that intentionally loosen install safety policy for trusted/operator paths. */
export type InstallSafetyOverrides = {
  config?: MarketingClawConfig;
  dangerouslyForceUnsafeInstall?: boolean;
  trustedSourceLinkedOfficialInstall?: boolean;
};
