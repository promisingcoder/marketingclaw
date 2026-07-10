import {
  runSessionStartupMigration,
  type SessionStartupMigrationLogger,
} from "../config/sessions/startup-migration.js";
import type { MarketingClawConfig } from "../config/types.marketingclaw.js";

type SessionMigrationDeps = Parameters<typeof runSessionStartupMigration>[0]["deps"];

/**
 * Run orphan-key session migration at gateway startup.
 *
 * Idempotent and best-effort: if the migration fails, gateway startup
 * continues normally. This ensures accumulated orphaned session keys
 * (from the write-path bug #29683) are cleaned up automatically on
 * upgrade rather than requiring a manual `marketingclaw doctor` run.
 */
export async function runStartupSessionMigration(params: {
  cfg: MarketingClawConfig;
  env?: NodeJS.ProcessEnv;
  log: SessionStartupMigrationLogger;
  deps?: SessionMigrationDeps;
}): Promise<void> {
  await runSessionStartupMigration(params);
}
