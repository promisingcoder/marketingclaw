// Discord API module exposes the plugin public contract.
import type { MarketingClawConfig } from "marketingclaw/plugin-sdk/config-contracts";
import { inspectDiscordAccount } from "./src/account-inspect.js";

export function inspectDiscordReadOnlyAccount(cfg: MarketingClawConfig, accountId?: string | null) {
  return inspectDiscordAccount({ cfg, accountId });
}
