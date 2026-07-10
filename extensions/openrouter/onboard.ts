// Openrouter setup module handles plugin onboarding behavior.
import {
  applyAgentDefaultModelPrimary,
  type MarketingClawConfig,
} from "marketingclaw/plugin-sdk/provider-onboard";

export const OPENROUTER_DEFAULT_MODEL_REF = "openrouter/auto";

export function applyOpenrouterProviderConfig(cfg: MarketingClawConfig): MarketingClawConfig {
  const models = { ...cfg.agents?.defaults?.models };
  models[OPENROUTER_DEFAULT_MODEL_REF] = {
    ...models[OPENROUTER_DEFAULT_MODEL_REF],
    alias: models[OPENROUTER_DEFAULT_MODEL_REF]?.alias ?? "OpenRouter",
  };

  return {
    ...cfg,
    agents: {
      ...cfg.agents,
      defaults: {
        ...cfg.agents?.defaults,
        models,
      },
    },
  };
}

export function applyOpenrouterConfig(cfg: MarketingClawConfig): MarketingClawConfig {
  return applyAgentDefaultModelPrimary(
    applyOpenrouterProviderConfig(cfg),
    OPENROUTER_DEFAULT_MODEL_REF,
  );
}
