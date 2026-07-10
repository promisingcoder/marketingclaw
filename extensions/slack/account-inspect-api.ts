// Slack API module exposes the plugin public contract.
import type { MarketingClawConfig } from "marketingclaw/plugin-sdk/config-contracts";
import { inspectSlackAccount } from "./src/account-inspect.js";

export function inspectSlackReadOnlyAccount(cfg: MarketingClawConfig, accountId?: string | null) {
  return inspectSlackAccount({ cfg, accountId });
}
