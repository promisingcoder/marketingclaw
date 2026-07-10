/**
 * Resolves whether Codex app-server profiling instrumentation is enabled by
 * MarketingClaw diagnostic flags.
 */
import type { MarketingClawConfig } from "marketingclaw/plugin-sdk/config-contracts";
import { isDiagnosticFlagEnabled } from "marketingclaw/plugin-sdk/diagnostic-runtime";

const PROFILER_FLAGS = ["profiler", "codex.profiler"] as const;

/** Checks the generic and Codex-specific profiler diagnostic flags. */
export function isCodexAppServerProfilerEnabled(
  config?: MarketingClawConfig,
  env: NodeJS.ProcessEnv = process.env,
): boolean {
  return PROFILER_FLAGS.some((flag) => isDiagnosticFlagEnabled(flag, config, env));
}
