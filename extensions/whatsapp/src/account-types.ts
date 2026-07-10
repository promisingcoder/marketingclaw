// Whatsapp plugin module implements account types behavior.
import type { MarketingClawConfig } from "marketingclaw/plugin-sdk/config-contracts";

export type WhatsAppAccountConfig = NonNullable<
  NonNullable<NonNullable<MarketingClawConfig["channels"]>["whatsapp"]>["accounts"]
>[string];
