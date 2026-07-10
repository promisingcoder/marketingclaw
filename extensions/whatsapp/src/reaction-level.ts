// Whatsapp plugin module implements reaction level behavior.
import type { MarketingClawConfig } from "marketingclaw/plugin-sdk/config-contracts";
import {
  resolveReactionLevel,
  type ResolvedReactionLevel,
} from "marketingclaw/plugin-sdk/status-helpers";
import { resolveMergedWhatsAppAccountConfig } from "./account-config.js";

/** Resolve the effective reaction level and its implications for WhatsApp. */
export function resolveWhatsAppReactionLevel(params: {
  cfg: MarketingClawConfig;
  accountId?: string;
}): ResolvedReactionLevel {
  const account = resolveMergedWhatsAppAccountConfig({
    cfg: params.cfg,
    accountId: params.accountId,
  });
  return resolveReactionLevel({
    value: account.reactionLevel,
    defaultLevel: "minimal",
    invalidFallback: "minimal",
  });
}
