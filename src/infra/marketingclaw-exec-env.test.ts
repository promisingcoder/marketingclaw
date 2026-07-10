// Tests MarketingClaw execution environment construction.
import { describe, expect, it } from "vitest";
import { deleteTestEnvValue, setTestEnvValue } from "../test-utils/env.js";
import {
  ensureMarketingClawExecMarkerOnProcess,
  markMarketingClawExecEnv,
  MARKETINGCLAW_CLI_ENV_VALUE,
  MARKETINGCLAW_CLI_ENV_VAR,
} from "./marketingclaw-exec-env.js";

describe("markMarketingClawExecEnv", () => {
  it("returns a cloned env object with the exec marker set", () => {
    const env = { PATH: "/usr/bin", MARKETINGCLAW_CLI: "0" };
    const marked = markMarketingClawExecEnv(env);

    expect(marked).toEqual({
      PATH: "/usr/bin",
      MARKETINGCLAW_CLI: MARKETINGCLAW_CLI_ENV_VALUE,
    });
    expect(marked).not.toBe(env);
    expect(env.MARKETINGCLAW_CLI).toBe("0");
  });
});

describe("ensureMarketingClawExecMarkerOnProcess", () => {
  it.each([
    {
      name: "mutates and returns the provided process env",
      env: { PATH: "/usr/bin" } as NodeJS.ProcessEnv,
    },
    {
      name: "overwrites an existing marker on the provided process env",
      env: { PATH: "/usr/bin", [MARKETINGCLAW_CLI_ENV_VAR]: "0" } as NodeJS.ProcessEnv,
    },
  ])("$name", ({ env }) => {
    expect(ensureMarketingClawExecMarkerOnProcess(env)).toBe(env);
    expect(env[MARKETINGCLAW_CLI_ENV_VAR]).toBe(MARKETINGCLAW_CLI_ENV_VALUE);
  });

  it("defaults to mutating process.env when no env object is provided", () => {
    const previous = process.env[MARKETINGCLAW_CLI_ENV_VAR];
    deleteTestEnvValue(MARKETINGCLAW_CLI_ENV_VAR);

    try {
      expect(ensureMarketingClawExecMarkerOnProcess()).toBe(process.env);
      expect(process.env[MARKETINGCLAW_CLI_ENV_VAR]).toBe(MARKETINGCLAW_CLI_ENV_VALUE);
    } finally {
      if (previous === undefined) {
        deleteTestEnvValue(MARKETINGCLAW_CLI_ENV_VAR);
      } else {
        setTestEnvValue(MARKETINGCLAW_CLI_ENV_VAR, previous);
      }
    }
  });
});
