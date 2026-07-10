// Nostr API module exposes the plugin public contract.
export {
  buildChannelConfigSchema,
  DEFAULT_ACCOUNT_ID,
  formatPairingApproveHint,
  type ChannelPlugin,
} from "marketingclaw/plugin-sdk/channel-plugin-common";
export type { ChannelOutboundAdapter } from "marketingclaw/plugin-sdk/channel-contract";
export {
  collectStatusIssuesFromLastError,
  createDefaultChannelRuntimeState,
} from "marketingclaw/plugin-sdk/status-helpers";
