// Telegram plugin module implements draft chunking behavior.
import {
  resolveChannelDraftStreamingChunking,
  type ChannelDraftStreamingChunking,
} from "marketingclaw/plugin-sdk/channel-outbound";
import type { MarketingClawConfig } from "marketingclaw/plugin-sdk/config-contracts";
import { TELEGRAM_TEXT_CHUNK_LIMIT } from "./outbound-adapter.js";

export function resolveTelegramDraftStreamingChunking(
  cfg: MarketingClawConfig | undefined,
  accountId?: string | null,
): ChannelDraftStreamingChunking {
  return resolveChannelDraftStreamingChunking(cfg, "telegram", accountId, {
    fallbackLimit: TELEGRAM_TEXT_CHUNK_LIMIT,
  });
}
