// Voyage plugin entrypoint registers its MarketingClaw integration.
import { definePluginEntry } from "marketingclaw/plugin-sdk/plugin-entry";
import { voyageMemoryEmbeddingProviderAdapter } from "./memory-embedding-adapter.js";

export default definePluginEntry({
  id: "voyage",
  name: "Voyage Embeddings",
  description: "Bundled Voyage memory embedding provider plugin",
  register(api) {
    api.registerMemoryEmbeddingProvider(voyageMemoryEmbeddingProviderAdapter);
  },
});
