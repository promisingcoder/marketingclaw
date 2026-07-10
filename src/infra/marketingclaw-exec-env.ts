/** Process env key that marks child commands as launched by the MarketingClaw CLI. */
export const MARKETINGCLAW_CLI_ENV_VAR = "MARKETINGCLAW_CLI";

/** Stable marker value used for MarketingClaw-launched subprocess detection. */
export const MARKETINGCLAW_CLI_ENV_VALUE = "1";

/** Returns a cloned env object with the MarketingClaw CLI marker set. */
export function markMarketingClawExecEnv<T extends Record<string, string | undefined>>(
  /** Source environment to clone before adding the subprocess marker. */
  env: T,
): T {
  return {
    ...env,
    [MARKETINGCLAW_CLI_ENV_VAR]: MARKETINGCLAW_CLI_ENV_VALUE,
  };
}

/** Mutates an existing process env object so current-process children inherit the marker. */
export function ensureMarketingClawExecMarkerOnProcess(
  /** Process env object to mutate; defaults to the current process environment. */
  env: NodeJS.ProcessEnv = process.env,
): NodeJS.ProcessEnv {
  env[MARKETINGCLAW_CLI_ENV_VAR] = MARKETINGCLAW_CLI_ENV_VALUE;
  return env;
}
