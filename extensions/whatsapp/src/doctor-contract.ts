// Whatsapp plugin module implements doctor contract behavior.
import type { ChannelDoctorConfigMutation } from "marketingclaw/plugin-sdk/channel-contract";
import type { MarketingClawConfig } from "marketingclaw/plugin-sdk/config-contracts";
import { normalizeCompatibilityConfig as normalizeCompatibilityConfigImpl } from "./doctor.js";

export function normalizeCompatibilityConfig({
  cfg,
}: {
  cfg: MarketingClawConfig;
}): ChannelDoctorConfigMutation {
  return normalizeCompatibilityConfigImpl({ cfg });
}
