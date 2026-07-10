// Qqbot helper module supports config shared behavior.
import type { MarketingClawConfig } from "marketingclaw/plugin-sdk/config-contracts";
import {
  applyAccountNameToChannelSection,
  deleteAccountFromConfigSection,
  setAccountEnabledInConfigSection,
} from "marketingclaw/plugin-sdk/core";
import type { ChannelSetupInput } from "marketingclaw/plugin-sdk/setup";
import {
  describeAccount as engineDescribeAccount,
  formatAllowFrom as engineFormatAllowFrom,
  isAccountConfigured as engineIsAccountConfigured,
} from "../engine/config/resolve.js";
import {
  applySetupAccountConfig as engineApplySetupAccountConfig,
  validateSetupInput as engineValidateSetupInput,
} from "../engine/config/setup-logic.js";
import { normalizeLowercaseStringOrEmpty } from "../engine/utils/string-normalize.js";
import type { ResolvedQQBotAccount } from "../types.js";
import {
  listQQBotAccountIds,
  resolveDefaultQQBotAccountId,
  resolveQQBotAccount,
} from "./config.js";

export const qqbotMeta = {
  id: "qqbot",
  label: "QQ Bot",
  selectionLabel: "QQ Bot (Bot API)",
  docsPath: "/channels/qqbot",
  blurb: "Connect to QQ via official QQ Bot API",
  order: 50,
} as const;

function validateQQBotSetupInput(params: {
  accountId: string;
  input: ChannelSetupInput;
}): string | null {
  return engineValidateSetupInput(params.accountId, params.input);
}

function applyQQBotSetupAccountConfig(params: {
  cfg: MarketingClawConfig;
  accountId: string;
  input: ChannelSetupInput;
}): MarketingClawConfig {
  return engineApplySetupAccountConfig(
    params.cfg as unknown as Record<string, unknown>,
    params.accountId,
    params.input,
  ) as MarketingClawConfig;
}

function isQQBotConfigured(account: ResolvedQQBotAccount | undefined): boolean {
  return engineIsAccountConfigured(account as never);
}

function describeQQBotAccount(account: ResolvedQQBotAccount | undefined) {
  return engineDescribeAccount(account as never);
}

function formatQQBotAllowFrom(params: {
  allowFrom: Array<string | number> | undefined | null;
}): string[] {
  return engineFormatAllowFrom(params.allowFrom);
}

export const qqbotConfigAdapter = {
  listAccountIds: (cfg: MarketingClawConfig) => listQQBotAccountIds(cfg),
  resolveAccount: (cfg: MarketingClawConfig, accountId?: string | null) =>
    resolveQQBotAccount(cfg, accountId, { allowUnresolvedSecretRef: true }),
  defaultAccountId: (cfg: MarketingClawConfig) => resolveDefaultQQBotAccountId(cfg),
  setAccountEnabled: ({
    cfg,
    accountId,
    enabled,
  }: {
    cfg: MarketingClawConfig;
    accountId: string;
    enabled: boolean;
  }) =>
    setAccountEnabledInConfigSection({
      cfg,
      sectionKey: "qqbot",
      accountId,
      enabled,
      allowTopLevel: true,
    }),
  deleteAccount: ({ cfg, accountId }: { cfg: MarketingClawConfig; accountId: string }) =>
    deleteAccountFromConfigSection({
      cfg,
      sectionKey: "qqbot",
      accountId,
      clearBaseFields: ["appId", "clientSecret", "clientSecretFile", "name"],
    }),
  isConfigured: isQQBotConfigured,
  describeAccount: describeQQBotAccount,
  resolveAllowFrom: ({ cfg, accountId }: { cfg: MarketingClawConfig; accountId?: string | null }) =>
    resolveQQBotAccount(cfg, accountId, { allowUnresolvedSecretRef: true }).config?.allowFrom,
  formatAllowFrom: ({ allowFrom }: { allowFrom: Array<string | number> | undefined | null }) =>
    formatQQBotAllowFrom({ allowFrom }),
};

export const qqbotSetupAdapterShared = {
  resolveAccountId: ({ cfg, accountId }: { cfg: MarketingClawConfig; accountId?: string | null }) =>
    normalizeLowercaseStringOrEmpty(accountId) || resolveDefaultQQBotAccountId(cfg),
  applyAccountName: ({
    cfg,
    accountId,
    name,
  }: {
    cfg: MarketingClawConfig;
    accountId: string;
    name?: string;
  }) =>
    applyAccountNameToChannelSection({
      cfg,
      channelKey: "qqbot",
      accountId,
      name,
    }),
  validateInput: ({ accountId, input }: { accountId: string; input: ChannelSetupInput }) =>
    validateQQBotSetupInput({ accountId, input }),
  applyAccountConfig: ({
    cfg,
    accountId,
    input,
  }: {
    cfg: MarketingClawConfig;
    accountId: string;
    input: ChannelSetupInput;
  }) => applyQQBotSetupAccountConfig({ cfg, accountId, input }),
};
