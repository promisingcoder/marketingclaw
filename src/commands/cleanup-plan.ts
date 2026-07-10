// Resolves cleanup inputs from current MarketingClaw config and state paths.
import {
  getRuntimeConfig,
  resolveConfigPath,
  resolveOAuthDir,
  resolveStateDir,
} from "../config/config.js";
import type { MarketingClawConfig } from "../config/types.marketingclaw.js";
import { buildCleanupPlan } from "./cleanup-utils.js";

/** Build the cleanup plan for the current runtime config/state/credential paths on disk. */
export function resolveCleanupPlanFromDisk(): {
  cfg: MarketingClawConfig;
  stateDir: string;
  configPath: string;
  oauthDir: string;
  configInsideState: boolean;
  oauthInsideState: boolean;
  workspaceDirs: string[];
} {
  const cfg = getRuntimeConfig();
  const stateDir = resolveStateDir();
  const configPath = resolveConfigPath();
  const oauthDir = resolveOAuthDir();
  const plan = buildCleanupPlan({ cfg, stateDir, configPath, oauthDir });
  return { cfg, stateDir, configPath, oauthDir, ...plan };
}
