/**
 * Channel pairing adapter types.
 *
 * Defines setup/allowlist approval hooks used by pairing flows.
 */
import type { MarketingClawConfig } from "../../config/types.marketingclaw.js";
import type { RuntimeEnv } from "../../runtime.js";

/**
 * Channel pairing hooks used by setup and allowlist approval flows.
 */
export type ChannelPairingAdapter = {
  idLabel: string;
  normalizeAllowEntry?: (entry: string) => string;
  notifyApproval?: (params: {
    cfg: MarketingClawConfig;
    id: string;
    accountId?: string;
    runtime?: RuntimeEnv;
  }) => Promise<void>;
};
