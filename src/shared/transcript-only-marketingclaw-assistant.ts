// Identifies MarketingClaw-authored assistant rows that are transcript bookkeeping,
// not provider model output. Some history surfaces keep gateway-injected rows
// visible, so use the narrower delivery-mirror predicate when visibility matters.
export const MARKETINGCLAW_TRANSCRIPT_ARTIFACT_API = "marketingclaw-transcript" as const;
export const MARKETINGCLAW_TRANSCRIPT_ARTIFACT_PROVIDER = "marketingclaw" as const;
export const MARKETINGCLAW_DELIVERY_MIRROR_MODEL = "delivery-mirror" as const;
const MARKETINGCLAW_GATEWAY_INJECTED_MODEL = "gateway-injected" as const;

const TRANSCRIPT_ONLY_MARKETINGCLAW_ASSISTANT_MODELS = new Set<string>([
  MARKETINGCLAW_DELIVERY_MIRROR_MODEL,
  MARKETINGCLAW_GATEWAY_INJECTED_MODEL,
]);

export function isTranscriptOnlyMarketingClawAssistantModel(
  provider: unknown,
  model: unknown,
): boolean {
  return (
    provider === MARKETINGCLAW_TRANSCRIPT_ARTIFACT_PROVIDER &&
    typeof model === "string" &&
    TRANSCRIPT_ONLY_MARKETINGCLAW_ASSISTANT_MODELS.has(model)
  );
}

export function isTranscriptOnlyMarketingClawAssistantMessage(message: unknown): boolean {
  if (!message || typeof message !== "object" || Array.isArray(message)) {
    return false;
  }
  const entry = message as { role?: unknown; provider?: unknown; model?: unknown };
  return (
    entry.role === "assistant" &&
    isTranscriptOnlyMarketingClawAssistantModel(entry.provider, entry.model)
  );
}

export function isMarketingClawDeliveryMirrorAssistantMessage(message: unknown): boolean {
  if (!message || typeof message !== "object" || Array.isArray(message)) {
    return false;
  }
  const entry = message as { role?: unknown; provider?: unknown; model?: unknown };
  return (
    entry.role === "assistant" &&
    entry.provider === MARKETINGCLAW_TRANSCRIPT_ARTIFACT_PROVIDER &&
    entry.model === MARKETINGCLAW_DELIVERY_MIRROR_MODEL
  );
}
