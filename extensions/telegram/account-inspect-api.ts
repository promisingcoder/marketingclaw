// Telegram API module exposes the plugin public contract.
import type { MarketingClawConfig } from "./runtime-api.js";
import { inspectTelegramAccount } from "./src/account-inspect.js";

export function inspectTelegramReadOnlyAccount(
  cfg: MarketingClawConfig,
  accountId?: string | null,
) {
  return inspectTelegramAccount({ cfg, accountId });
}
