// Covers supervisor marker files used to identify managed MarketingClaw processes.
import { describe, expect, it } from "vitest";
import { detectRespawnSupervisor, SUPERVISOR_HINT_ENV_VARS } from "./supervisor-markers.js";

describe("SUPERVISOR_HINT_ENV_VARS", () => {
  it("includes the cross-platform supervisor hint env vars", () => {
    const envVars = new Set(SUPERVISOR_HINT_ENV_VARS);
    expect(envVars.has("LAUNCH_JOB_LABEL")).toBe(true);
    expect(envVars.has("INVOCATION_ID")).toBe(true);
    expect(envVars.has("MARKETINGCLAW_WINDOWS_TASK_NAME")).toBe(true);
    expect(envVars.has("MARKETINGCLAW_SERVICE_MARKER")).toBe(true);
    expect(envVars.has("MARKETINGCLAW_SERVICE_KIND")).toBe(true);
  });
});

describe("detectRespawnSupervisor", () => {
  it("detects launchd from MarketingClaw's explicit marker or current gateway launchd job", () => {
    expect(
      detectRespawnSupervisor(
        { MARKETINGCLAW_LAUNCHD_LABEL: " ai.marketingclaw.gateway " },
        "darwin",
      ),
    ).toBe("launchd");
    expect(detectRespawnSupervisor({ MARKETINGCLAW_LAUNCHD_LABEL: "   " }, "darwin")).toBeNull();
    expect(
      detectRespawnSupervisor({ LAUNCH_JOB_LABEL: "ai.marketingclaw.gateway" }, "darwin"),
    ).toBe("launchd");
    expect(
      detectRespawnSupervisor(
        { LAUNCH_JOB_NAME: "ai.marketingclaw.work", MARKETINGCLAW_PROFILE: "work" },
        "darwin",
      ),
    ).toBe("launchd");
    expect(
      detectRespawnSupervisor({ LAUNCH_JOB_LABEL: "ai.marketingclaw.mac" }, "darwin"),
    ).toBeNull();
    expect(
      detectRespawnSupervisor({ XPC_SERVICE_NAME: "ai.marketingclaw.mac" }, "darwin"),
    ).toBeNull();
    expect(
      detectRespawnSupervisor(
        { XPC_SERVICE_NAME: "ai.marketingclaw.mac", MARKETINGCLAW_PROFILE: "mac" },
        "darwin",
      ),
    ).toBeNull();
    expect(
      detectRespawnSupervisor({ XPC_SERVICE_NAME: "ai.marketingclaw.gateway" }, "darwin"),
    ).toBe("launchd");
  });

  it("detects systemd only from non-blank platform-specific hints", () => {
    expect(detectRespawnSupervisor({ INVOCATION_ID: "abc123" }, "linux")).toBe("systemd");
    expect(detectRespawnSupervisor({ JOURNAL_STREAM: "" }, "linux")).toBeNull();
  });

  it("detects Linux MarketingClaw gateway service markers only for opt-in callers", () => {
    const gatewayServiceEnv = {
      MARKETINGCLAW_SERVICE_MARKER: " marketingclaw ",
      MARKETINGCLAW_SERVICE_KIND: " gateway ",
    };
    expect(detectRespawnSupervisor(gatewayServiceEnv, "linux")).toBeNull();
    expect(
      detectRespawnSupervisor(gatewayServiceEnv, "linux", {
        includeLinuxMarketingClawGatewayServiceMarker: true,
      }),
    ).toBe("systemd");
    expect(
      detectRespawnSupervisor(
        {
          MARKETINGCLAW_SERVICE_MARKER: "marketingclaw",
          MARKETINGCLAW_SERVICE_KIND: "worker",
        },
        "linux",
        { includeLinuxMarketingClawGatewayServiceMarker: true },
      ),
    ).toBeNull();
    expect(
      detectRespawnSupervisor(
        {
          MARKETINGCLAW_SERVICE_MARKER: "other",
          MARKETINGCLAW_SERVICE_KIND: "gateway",
        },
        "linux",
        { includeLinuxMarketingClawGatewayServiceMarker: true },
      ),
    ).toBeNull();
  });

  it("detects scheduled-task supervision on Windows from either hint family", () => {
    expect(
      detectRespawnSupervisor(
        { MARKETINGCLAW_WINDOWS_TASK_NAME: "MarketingClaw Gateway" },
        "win32",
      ),
    ).toBe("schtasks");
    expect(
      detectRespawnSupervisor(
        {
          MARKETINGCLAW_SERVICE_MARKER: "marketingclaw",
          MARKETINGCLAW_SERVICE_KIND: "gateway",
        },
        "win32",
      ),
    ).toBe("schtasks");
    expect(
      detectRespawnSupervisor(
        {
          MARKETINGCLAW_SERVICE_MARKER: "marketingclaw",
          MARKETINGCLAW_SERVICE_KIND: "worker",
        },
        "win32",
      ),
    ).toBeNull();
  });

  it("ignores service markers on non-Windows platforms and unknown platforms", () => {
    expect(
      detectRespawnSupervisor(
        {
          MARKETINGCLAW_SERVICE_MARKER: "marketingclaw",
          MARKETINGCLAW_SERVICE_KIND: "gateway",
        },
        "linux",
      ),
    ).toBeNull();
    expect(
      detectRespawnSupervisor({ LAUNCH_JOB_LABEL: "ai.marketingclaw.gateway" }, "freebsd"),
    ).toBeNull();
  });
});
