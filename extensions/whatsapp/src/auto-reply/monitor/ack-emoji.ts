// Whatsapp plugin module implements ack emoji behavior.
import { resolveAgentIdentity } from "marketingclaw/plugin-sdk/agent-runtime";
import type { MarketingClawConfig } from "marketingclaw/plugin-sdk/config-contracts";

const DEFAULT_WHATSAPP_ACK_REACTION = "👀";

type WhatsAppAckReactionConfig = NonNullable<
  NonNullable<NonNullable<MarketingClawConfig["channels"]>["whatsapp"]>["ackReaction"]
>;

export function resolveWhatsAppAckEmoji(params: {
  cfg: MarketingClawConfig;
  agentId: string;
  ackConfig: WhatsAppAckReactionConfig | undefined;
}): string {
  if (!params.ackConfig) {
    return "";
  }
  if (params.ackConfig.emoji !== undefined) {
    return params.ackConfig.emoji.trim();
  }
  return resolveAgentIdentityEmoji(params.cfg, params.agentId) ?? DEFAULT_WHATSAPP_ACK_REACTION;
}

function resolveAgentIdentityEmoji(cfg: MarketingClawConfig, agentId: string): string | undefined {
  const emoji = resolveAgentIdentity(cfg, agentId)?.emoji?.trim();
  return emoji || undefined;
}
