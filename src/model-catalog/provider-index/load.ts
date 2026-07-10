import { MARKETINGCLAW_PROVIDER_INDEX } from "./marketingclaw-provider-index.js";
// Provider-index loader normalizes bundled installable-provider metadata and falls back to an empty index.
import { normalizeMarketingClawProviderIndex } from "./normalize.js";
import type { MarketingClawProviderIndex } from "./types.js";

// Load the bundled provider index through the normalizer. Invalid generated or
// caller-supplied data falls back to an empty v1 index instead of leaking shape.
export function loadMarketingClawProviderIndex(
  source: unknown = MARKETINGCLAW_PROVIDER_INDEX,
): MarketingClawProviderIndex {
  return normalizeMarketingClawProviderIndex(source) ?? { version: 1, providers: {} };
}
