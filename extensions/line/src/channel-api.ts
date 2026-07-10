// Line API module exposes the plugin public contract.
export { clearAccountEntryFields } from "marketingclaw/plugin-sdk/core";
import { DEFAULT_ACCOUNT_ID } from "marketingclaw/plugin-sdk/account-id";
import type { MarketingClawConfig } from "marketingclaw/plugin-sdk/account-resolution";
import type { ChannelPlugin } from "marketingclaw/plugin-sdk/core";
import { listLineAccountIds, resolveDefaultLineAccountId, resolveLineAccount } from "./accounts.js";
import { resolveExactLineGroupConfigKey } from "./group-keys.js";
import type { LineConfig, ResolvedLineAccount } from "./types.js";

export {
  DEFAULT_ACCOUNT_ID,
  listLineAccountIds,
  resolveDefaultLineAccountId,
  resolveExactLineGroupConfigKey,
  resolveLineAccount,
};

export type { ChannelPlugin, LineConfig, MarketingClawConfig, ResolvedLineAccount };
