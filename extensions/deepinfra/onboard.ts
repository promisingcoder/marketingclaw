// Deepinfra setup module handles plugin onboarding behavior.
import {
  applyAgentDefaultModelPrimary,
  type MarketingClawConfig,
} from "marketingclaw/plugin-sdk/provider-onboard";
import { DEEPINFRA_BASE_URL, DEEPINFRA_DEFAULT_MODEL_REF } from "./provider-models.js";

export { DEEPINFRA_BASE_URL, DEEPINFRA_DEFAULT_MODEL_REF };

export function applyDeepInfraConfig(
  cfg: MarketingClawConfig,
  modelRef: string = DEEPINFRA_DEFAULT_MODEL_REF,
): MarketingClawConfig {
  const models = { ...cfg.agents?.defaults?.models };
  models[modelRef] = {
    ...models[modelRef],
    alias: models[modelRef]?.alias ?? "DeepInfra",
  };

  return applyAgentDefaultModelPrimary(
    {
      ...cfg,
      agents: {
        ...cfg.agents,
        defaults: {
          ...cfg.agents?.defaults,
          models,
        },
      },
    },
    modelRef,
  );
}
