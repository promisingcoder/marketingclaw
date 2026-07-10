// Zalouser API module exposes the plugin public contract.
export { formatAllowFromLowercase } from "marketingclaw/plugin-sdk/allow-from";
export type {
  ChannelDirectoryEntry,
  ChannelGroupContext,
  ChannelMessageActionAdapter,
} from "marketingclaw/plugin-sdk/channel-contract";
export { buildChannelConfigSchema } from "marketingclaw/plugin-sdk/channel-config-schema";
export type { ChannelPlugin } from "marketingclaw/plugin-sdk/core";
export {
  DEFAULT_ACCOUNT_ID,
  normalizeAccountId,
  type MarketingClawConfig,
} from "marketingclaw/plugin-sdk/core";
export { isDangerousNameMatchingEnabled } from "marketingclaw/plugin-sdk/dangerous-name-runtime";
export type { GroupToolPolicyConfig } from "marketingclaw/plugin-sdk/config-contracts";
export { chunkTextForOutbound } from "marketingclaw/plugin-sdk/text-chunking";
export {
  isNumericTargetId,
  sendPayloadWithChunkedTextAndMedia,
} from "marketingclaw/plugin-sdk/reply-payload";
