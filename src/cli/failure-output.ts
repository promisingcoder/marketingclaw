// Shared root CLI failure formatting with debug stack gating and recovery hints.
import { isTruthyEnvValue } from "../infra/env.js";
import { formatErrorMessage, formatUncaughtError } from "../infra/errors.js";
import { formatCliCommand } from "./command-format.js";

type FormatCliFailureOptions = {
  title: string;
  error: unknown;
  argv?: string[];
  env?: NodeJS.ProcessEnv;
  includeDoctorHint?: boolean;
};

function hasDebugArg(argv: string[] | undefined): boolean {
  return Boolean(argv?.some((arg) => arg === "--debug" || arg === "--verbose"));
}

function shouldShowStack(argv: string[] | undefined, env: NodeJS.ProcessEnv): boolean {
  return hasDebugArg(argv) || isTruthyEnvValue(env.MARKETINGCLAW_DEBUG);
}

function pushPrefixed(out: string[], value: string): void {
  for (const line of value.split("\n")) {
    if (line.trim().length > 0) {
      out.push(`[marketingclaw] ${line}`);
    }
  }
}

export function formatCliFailureLines(options: FormatCliFailureOptions): string[] {
  // Default output stays terse; stack traces require explicit debug intent.
  const env = options.env ?? process.env;
  const lines = [
    `[marketingclaw] ${options.title}`,
    `[marketingclaw] Reason: ${formatErrorMessage(options.error)}`,
  ];

  if (shouldShowStack(options.argv, env)) {
    lines.push("[marketingclaw] Stack:");
    pushPrefixed(lines, formatUncaughtError(options.error));
  } else {
    lines.push("[marketingclaw] Debug: set MARKETINGCLAW_DEBUG=1 to include the stack trace.");
  }

  if (options.includeDoctorHint !== false) {
    lines.push(`[marketingclaw] Try: ${formatCliCommand("marketingclaw doctor", env)}`);
  }
  lines.push(`[marketingclaw] Help: ${formatCliCommand("marketingclaw --help", env)}`);
  return lines;
}
