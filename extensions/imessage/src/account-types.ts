// Imessage plugin module implements account types behavior.
import type { MarketingClawConfig } from "marketingclaw/plugin-sdk/config-contracts";

export type IMessageAccountConfig = Omit<
  NonNullable<NonNullable<MarketingClawConfig["channels"]>["imessage"]>,
  "accounts" | "defaultAccount"
>;
