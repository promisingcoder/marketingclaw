// Daemon restart log tests cover restart log formatting and filtering.
import { describe, expect, it } from "vitest";
import {
  GATEWAY_RESTART_LOG_FILENAME,
  renderCmdRestartLogSetup,
  renderPosixRestartLogSetup,
  resolveGatewayLogPaths,
  resolveGatewayRestartLogPath,
  resolveGatewaySupervisorLogPaths,
} from "./restart-logs.js";

describe("restart log conventions", () => {
  it("resolves profile-aware gateway logs and restart attempts together", () => {
    const env = {
      HOME: "/Users/test",
      MARKETINGCLAW_PROFILE: "work",
    };

    expect(resolveGatewayLogPaths(env)).toEqual({
      logDir: "/Users/test/.marketingclaw-work/logs",
      stdoutPath: "/Users/test/.marketingclaw-work/logs/gateway.log",
      stderrPath: "/Users/test/.marketingclaw-work/logs/gateway.err.log",
    });
    expect(resolveGatewayRestartLogPath(env)).toBe(
      `/Users/test/.marketingclaw-work/logs/${GATEWAY_RESTART_LOG_FILENAME}`,
    );
  });

  it("honors MARKETINGCLAW_STATE_DIR for restart attempts", () => {
    const env = {
      HOME: "/Users/test",
      MARKETINGCLAW_STATE_DIR: "/tmp/marketingclaw-state",
    };

    expect(resolveGatewayRestartLogPath(env)).toBe(
      `/tmp/marketingclaw-state/logs/${GATEWAY_RESTART_LOG_FILENAME}`,
    );
  });

  it("keeps macOS LaunchAgent stdout outside the state directory", () => {
    const env = {
      HOME: "/Users/test",
      MARKETINGCLAW_STATE_DIR: "/Volumes/External/marketingclaw",
    };

    expect(resolveGatewaySupervisorLogPaths(env, { platform: "darwin" })).toEqual({
      logDir: "/Users/test/Library/Logs/marketingclaw",
      stdoutPath: "/Users/test/Library/Logs/marketingclaw/gateway.log",
      stderrPath: "/Users/test/Library/Logs/marketingclaw/gateway.err.log",
    });
    expect(resolveGatewayRestartLogPath(env)).toBe(
      `/Volumes/External/marketingclaw/logs/${GATEWAY_RESTART_LOG_FILENAME}`,
    );
  });

  it("keeps macOS LaunchAgent logs profile-aware in the shared user log directory", () => {
    const env = {
      HOME: "/Users/test",
      MARKETINGCLAW_PROFILE: "work",
    };

    expect(resolveGatewaySupervisorLogPaths(env, { platform: "darwin" })).toEqual({
      logDir: "/Users/test/Library/Logs/marketingclaw",
      stdoutPath: "/Users/test/Library/Logs/marketingclaw/gateway-work.log",
      stderrPath: "/Users/test/Library/Logs/marketingclaw/gateway-work.err.log",
    });
  });

  it("renders best-effort POSIX log setup with escaped paths", () => {
    const setup = renderPosixRestartLogSetup({
      HOME: "/Users/test's",
    });

    expect(setup).toContain(
      "if mkdir -p '/Users/test'\\''s/.marketingclaw/logs' 2>/dev/null && : >>'/Users/test'\\''s/.marketingclaw/logs/gateway-restart.log' 2>/dev/null; then",
    );
    expect(setup).toContain(
      "exec >>'/Users/test'\\''s/.marketingclaw/logs/gateway-restart.log' 2>&1",
    );
  });

  it("renders CMD log setup with quoted paths", () => {
    const setup = renderCmdRestartLogSetup({
      USERPROFILE: "C:\\Users\\Test User",
    });

    expect(setup.quotedLogPath).toBe(
      '"C:\\Users\\Test User/.marketingclaw/logs/gateway-restart.log"',
    );
    expect(setup.lines).toContain(
      'if not exist "C:\\Users\\Test User/.marketingclaw/logs" mkdir "C:\\Users\\Test User/.marketingclaw/logs" >nul 2>&1',
    );
  });
});
