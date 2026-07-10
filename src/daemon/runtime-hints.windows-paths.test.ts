// Windows runtime hint tests cover path guidance for Windows daemon setup.
import { beforeAll, describe, expect, it, vi } from "vitest";

const resolveGatewayLogPathsMock = vi.fn(() => ({
  logDir: "C:\\tmp\\marketingclaw-state\\logs",
  stdoutPath: "C:\\tmp\\marketingclaw-state\\logs\\gateway.log",
  stderrPath: "C:\\tmp\\marketingclaw-state\\logs\\gateway.err.log",
}));
const resolveGatewaySupervisorLogPathsMock = vi.fn(() => ({
  logDir: "C:\\Users\\test\\Library\\Logs\\marketingclaw",
  stdoutPath: "C:\\Users\\test\\Library\\Logs\\marketingclaw\\gateway.log",
  stderrPath: "C:\\Users\\test\\Library\\Logs\\marketingclaw\\gateway.err.log",
}));
const resolveGatewayRestartLogPathMock = vi.fn(
  () => "C:\\tmp\\marketingclaw-state\\logs\\gateway-restart.log",
);

vi.mock("./restart-logs.js", () => ({
  resolveGatewayLogPaths: resolveGatewayLogPathsMock,
  resolveGatewaySupervisorLogPaths: resolveGatewaySupervisorLogPathsMock,
  resolveGatewayRestartLogPath: resolveGatewayRestartLogPathMock,
}));

let buildPlatformRuntimeLogHints: typeof import("./runtime-hints.js").buildPlatformRuntimeLogHints;

describe("buildPlatformRuntimeLogHints", () => {
  beforeAll(async () => {
    ({ buildPlatformRuntimeLogHints } = await import("./runtime-hints.js"));
  });

  it("strips windows drive prefixes from darwin display paths", () => {
    expect(
      buildPlatformRuntimeLogHints({
        platform: "darwin",
        systemdServiceName: "marketingclaw-gateway",
        windowsTaskName: "MarketingClaw Gateway",
      }),
    ).toEqual([
      "Launchd stdout (if installed): /Users/test/Library/Logs/marketingclaw/gateway.log",
      "Launchd stderr (if installed): suppressed",
      "Restart attempts: /tmp/marketingclaw-state/logs/gateway-restart.log",
    ]);
  });
});
