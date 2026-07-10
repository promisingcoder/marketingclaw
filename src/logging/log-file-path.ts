// Log file path helpers resolve log output paths for local runtime logs.
import path from "node:path";
import type { MarketingClawConfig } from "../config/types.js";
import {
  POSIX_MARKETINGCLAW_TMP_DIR,
  resolvePreferredMarketingClawTmpDir,
} from "../infra/tmp-marketingclaw-dir.js";
import { canUseNodeFs, formatLocalDate, LOG_PREFIX, LOG_SUFFIX } from "./log-file-shared.js";

function resolveDefaultRollingLogFile(date = new Date()): string {
  const logDir = canUseNodeFs()
    ? resolvePreferredMarketingClawTmpDir()
    : POSIX_MARKETINGCLAW_TMP_DIR;
  return path.join(logDir, `${LOG_PREFIX}-${formatLocalDate(date)}${LOG_SUFFIX}`);
}

/** Resolves the configured log file or today's rolling default log path. */
export function resolveConfiguredLogFilePath(config?: MarketingClawConfig | null): string {
  return config?.logging?.file ?? resolveDefaultRollingLogFile();
}
