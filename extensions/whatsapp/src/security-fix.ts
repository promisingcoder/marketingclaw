// Whatsapp plugin module implements security fix behavior.
import { DEFAULT_ACCOUNT_ID } from "marketingclaw/plugin-sdk/account-id";
import type { ChannelDoctorConfigMutation } from "marketingclaw/plugin-sdk/channel-contract";
import { readChannelAllowFromStore } from "marketingclaw/plugin-sdk/channel-pairing";
import type { MarketingClawConfig } from "marketingclaw/plugin-sdk/config-contracts";
import { normalizeUniqueStringEntries } from "marketingclaw/plugin-sdk/string-coerce-runtime";

function applyGroupAllowFromFromStore(params: {
  cfg: MarketingClawConfig;
  storeAllowFrom: string[];
  changes: string[];
}): MarketingClawConfig {
  const next = structuredClone(params.cfg ?? {});
  const section = next.channels?.whatsapp as Record<string, unknown> | undefined;
  if (!section || typeof section !== "object" || params.storeAllowFrom.length === 0) {
    return params.cfg;
  }

  let changed = false;
  const maybeApply = (prefix: string, holder: Record<string, unknown>) => {
    if (holder.groupPolicy !== "allowlist") {
      return;
    }
    const allowFrom = Array.isArray(holder.allowFrom) ? holder.allowFrom : [];
    const groupAllowFrom = Array.isArray(holder.groupAllowFrom) ? holder.groupAllowFrom : [];
    if (allowFrom.length > 0 || groupAllowFrom.length > 0) {
      return;
    }
    holder.groupAllowFrom = params.storeAllowFrom;
    params.changes.push(`${prefix}groupAllowFrom=pairing-store`);
    changed = true;
  };

  maybeApply("channels.whatsapp.", section);

  const accounts = section.accounts;
  if (accounts && typeof accounts === "object") {
    for (const [accountId, accountValue] of Object.entries(accounts)) {
      if (!accountValue || typeof accountValue !== "object") {
        continue;
      }
      maybeApply(
        `channels.whatsapp.accounts.${accountId}.`,
        accountValue as Record<string, unknown>,
      );
    }
  }

  return changed ? next : params.cfg;
}

export async function applyWhatsAppSecurityConfigFixes(params: {
  cfg: MarketingClawConfig;
  env: NodeJS.ProcessEnv;
}): Promise<ChannelDoctorConfigMutation> {
  const fromStore = await readChannelAllowFromStore(
    "whatsapp",
    params.env,
    DEFAULT_ACCOUNT_ID,
  ).catch(() => []);
  const normalized = normalizeUniqueStringEntries(fromStore);
  if (normalized.length === 0) {
    return { config: params.cfg, changes: [] };
  }

  const changes: string[] = [];
  const config = applyGroupAllowFromFromStore({
    cfg: params.cfg,
    storeAllowFrom: normalized,
    changes,
  });
  return { config, changes };
}
