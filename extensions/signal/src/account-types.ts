// Signal plugin module implements account types behavior.
import type { MarketingClawConfig } from "marketingclaw/plugin-sdk/config-contracts";

export type SignalAccountConfig = Omit<
  Exclude<NonNullable<MarketingClawConfig["channels"]>["signal"], undefined>,
  "accounts"
>;
