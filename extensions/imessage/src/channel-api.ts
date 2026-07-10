// Imessage API module exposes the plugin public contract.
import { formatTrimmedAllowFromEntries } from "marketingclaw/plugin-sdk/channel-config-helpers";
import { PAIRING_APPROVED_MESSAGE } from "marketingclaw/plugin-sdk/channel-status";
import {
  DEFAULT_ACCOUNT_ID,
  getChatChannelMeta,
  type ChannelPlugin,
} from "marketingclaw/plugin-sdk/core";
import { resolveChannelMediaMaxBytes } from "marketingclaw/plugin-sdk/media-runtime";
import { collectStatusIssuesFromLastError } from "marketingclaw/plugin-sdk/status-helpers";
import { normalizeIMessageMessagingTarget } from "./normalize.js";
export { chunkTextForOutbound } from "marketingclaw/plugin-sdk/text-chunking";

export {
  collectStatusIssuesFromLastError,
  DEFAULT_ACCOUNT_ID,
  formatTrimmedAllowFromEntries,
  getChatChannelMeta,
  normalizeIMessageMessagingTarget,
  PAIRING_APPROVED_MESSAGE,
  resolveChannelMediaMaxBytes,
};

export type { ChannelPlugin };
