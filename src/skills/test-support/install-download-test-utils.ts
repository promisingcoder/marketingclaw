// Install download test utilities provide isolated state and workspace paths.
import {
  createMarketingClawTestState,
  type MarketingClawTestState,
} from "../../test-utils/marketingclaw-test-state.js";

/** Creates isolated MarketingClaw state for install download tests. */
export async function createInstallDownloadTestState(): Promise<MarketingClawTestState> {
  return await createMarketingClawTestState({
    layout: "state-only",
    prefix: "marketingclaw-skills-install-",
  });
}
