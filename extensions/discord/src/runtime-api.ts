// Discord API module exposes the plugin public contract.
export {
  buildComputedAccountStatusSnapshot,
  buildTokenChannelStatusSummary,
  PAIRING_APPROVED_MESSAGE,
  projectCredentialSnapshotFields,
  resolveConfiguredFromCredentialStatuses,
} from "marketingclaw/plugin-sdk/channel-status";
export { buildChannelConfigSchema, DiscordConfigSchema } from "../config-api.js";
export type {
  ChannelMessageActionAdapter,
  ChannelMessageActionContext,
  ChannelMessageActionName,
} from "marketingclaw/plugin-sdk/channel-contract";
export type {
  ChannelPlugin,
  MarketingClawPluginApi,
  PluginRuntime,
} from "marketingclaw/plugin-sdk/channel-plugin-common";
export type {
  DiscordAccountConfig,
  DiscordActionConfig,
  DiscordConfig,
  MarketingClawConfig,
} from "marketingclaw/plugin-sdk/config-contracts";
export {
  jsonResult,
  readNonNegativeIntegerParam,
  readNumberParam,
  readPositiveIntegerParam,
  readStringArrayParam,
  readStringParam,
  resolvePollMaxSelections,
} from "marketingclaw/plugin-sdk/channel-actions";
export type { ActionGate } from "marketingclaw/plugin-sdk/channel-actions";
export { readBooleanParam } from "marketingclaw/plugin-sdk/boolean-param";
export {
  assertMediaNotDataUrl,
  parseAvailableTags,
  readReactionParams,
  withNormalizedTimestamp,
} from "marketingclaw/plugin-sdk/channel-actions";
export {
  createHybridChannelConfigAdapter,
  createScopedChannelConfigAdapter,
  createScopedAccountConfigAccessors,
  createScopedChannelConfigBase,
  createTopLevelChannelConfigAdapter,
} from "marketingclaw/plugin-sdk/channel-config-helpers";
export {
  createAccountActionGate,
  createAccountListHelpers,
} from "marketingclaw/plugin-sdk/account-helpers";
export { DEFAULT_ACCOUNT_ID, normalizeAccountId } from "marketingclaw/plugin-sdk/account-id";
export {
  emptyPluginConfigSchema,
  formatPairingApproveHint,
} from "marketingclaw/plugin-sdk/channel-plugin-common";
export { loadOutboundMediaFromUrl } from "marketingclaw/plugin-sdk/outbound-media";
export { resolveAccountEntry } from "marketingclaw/plugin-sdk/routing";
export {
  hasConfiguredSecretInput,
  normalizeResolvedSecretInputString,
  normalizeSecretInputString,
} from "marketingclaw/plugin-sdk/secret-input";
export { getChatChannelMeta } from "./channel-api.js";
export { resolveDiscordOutboundSessionRoute } from "./outbound-session-route.js";
