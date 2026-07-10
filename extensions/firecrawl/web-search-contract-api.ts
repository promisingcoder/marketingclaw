// Firecrawl API module exposes the plugin public contract.
import type { WebSearchProviderPlugin } from "marketingclaw/plugin-sdk/provider-web-search-contract";
import { buildFirecrawlWebSearchProviderBase } from "./web-search-shared.js";

export function createFirecrawlWebSearchProvider(): WebSearchProviderPlugin {
  return {
    ...buildFirecrawlWebSearchProviderBase(),
    createTool: () => null,
  };
}
