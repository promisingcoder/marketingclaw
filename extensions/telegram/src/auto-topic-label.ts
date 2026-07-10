// Telegram plugin module implements auto topic label behavior.
import type { MarketingClawConfig } from "marketingclaw/plugin-sdk/config-contracts";
import { generateConversationLabel } from "marketingclaw/plugin-sdk/reply-dispatch-runtime";
export { resolveAutoTopicLabelConfig } from "./auto-topic-label-config.js";

export async function generateTelegramTopicLabel(params: {
  userMessage: string;
  prompt: string;
  cfg: MarketingClawConfig;
  agentId?: string;
  agentDir?: string;
}): Promise<string | null> {
  return await generateConversationLabel({
    ...params,
    maxLength: 128,
  });
}
