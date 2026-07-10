// LongCat provider module implements model/runtime integration.
import { buildManifestModelProviderConfig } from "marketingclaw/plugin-sdk/provider-catalog-shared";
import type { ModelProviderConfig } from "marketingclaw/plugin-sdk/provider-model-shared";
import manifest from "./marketingclaw.plugin.json" with { type: "json" };

export function buildLongCatProvider(): ModelProviderConfig {
  return buildManifestModelProviderConfig({
    providerId: "longcat",
    catalog: manifest.modelCatalog.providers.longcat,
  });
}
