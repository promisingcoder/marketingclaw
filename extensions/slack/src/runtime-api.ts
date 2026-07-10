// Slack API module exposes the plugin public contract.
export {
  buildComputedAccountStatusSnapshot,
  PAIRING_APPROVED_MESSAGE,
  projectCredentialSnapshotFields,
  resolveConfiguredFromRequiredCredentialStatuses,
} from "marketingclaw/plugin-sdk/channel-status";
export { buildChannelConfigSchema, SlackConfigSchema } from "../config-api.js";
export type { ChannelMessageActionContext } from "marketingclaw/plugin-sdk/channel-contract";
export { DEFAULT_ACCOUNT_ID } from "marketingclaw/plugin-sdk/account-id";
export type {
  ChannelPlugin,
  MarketingClawPluginApi,
  PluginRuntime,
} from "marketingclaw/plugin-sdk/channel-plugin-common";
export type { MarketingClawConfig } from "marketingclaw/plugin-sdk/config-contracts";
export type { SlackAccountConfig } from "marketingclaw/plugin-sdk/config-contracts";
export {
  emptyPluginConfigSchema,
  formatPairingApproveHint,
} from "marketingclaw/plugin-sdk/channel-plugin-common";
export { loadOutboundMediaFromUrl } from "marketingclaw/plugin-sdk/outbound-media";
export { looksLikeSlackTargetId, normalizeSlackMessagingTarget } from "./target-parsing.js";
export { getChatChannelMeta } from "./channel-api.js";
export {
  createActionGate,
  imageResultFromFile,
  jsonResult,
  readNumberParam,
  readPositiveIntegerParam,
  readReactionParams,
  readStringParam,
  withNormalizedTimestamp,
} from "marketingclaw/plugin-sdk/channel-actions";
