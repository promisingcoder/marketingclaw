// Provider-index public facade for normalized provider discovery metadata.
export { loadMarketingClawProviderIndex } from "./load.js";
export { normalizeMarketingClawProviderIndex } from "./normalize.js";
export type {
  MarketingClawProviderIndex,
  MarketingClawProviderIndexPluginInstall,
  MarketingClawProviderIndexPlugin,
  MarketingClawProviderIndexProviderAuthChoice,
  MarketingClawProviderIndexProvider,
} from "./types.js";
