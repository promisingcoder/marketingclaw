// Daemon runtime hint tests cover platform-specific daemon guidance.
import { describe, expect, it } from "vitest";
import { buildPlatformRuntimeLogHints, buildPlatformServiceStartHints } from "./runtime-hints.js";

describe("buildPlatformRuntimeLogHints", () => {
  it("renders launchd log hints on darwin", () => {
    expect(
      buildPlatformRuntimeLogHints({
        platform: "darwin",
        env: {
          HOME: "/Users/test",
          MARKETINGCLAW_STATE_DIR: "/tmp/marketingclaw-state",
          MARKETINGCLAW_LOG_PREFIX: "gateway",
        },
        systemdServiceName: "marketingclaw-gateway",
        windowsTaskName: "MarketingClaw Gateway",
      }),
    ).toEqual([
      "Launchd stdout (if installed): /Users/test/Library/Logs/marketingclaw/gateway.log",
      "Launchd stderr (if installed): suppressed",
      "Restart attempts: /tmp/marketingclaw-state/logs/gateway-restart.log",
    ]);
  });

  it("renders systemd and windows hints by platform", () => {
    expect(
      buildPlatformRuntimeLogHints({
        platform: "linux",
        env: {
          MARKETINGCLAW_STATE_DIR: "/tmp/marketingclaw-state",
        },
        systemdServiceName: "marketingclaw-gateway",
        windowsTaskName: "MarketingClaw Gateway",
      }),
    ).toEqual([
      "Logs: journalctl --user -u marketingclaw-gateway.service -n 200 --no-pager",
      "Restart attempts: /tmp/marketingclaw-state/logs/gateway-restart.log",
    ]);
    expect(
      buildPlatformRuntimeLogHints({
        platform: "win32",
        env: {
          MARKETINGCLAW_STATE_DIR: "/tmp/marketingclaw-state",
        },
        systemdServiceName: "marketingclaw-gateway",
        windowsTaskName: "MarketingClaw Gateway",
      }),
    ).toEqual([
      'Logs: schtasks /Query /TN "MarketingClaw Gateway" /V /FO LIST',
      "Restart attempts: /tmp/marketingclaw-state/logs/gateway-restart.log",
    ]);
  });
});

describe("buildPlatformServiceStartHints", () => {
  it("builds platform-specific service start hints", () => {
    expect(
      buildPlatformServiceStartHints({
        platform: "darwin",
        installCommand: "marketingclaw gateway install",
        startCommand: "marketingclaw gateway",
        launchAgentPlistPath: "~/Library/LaunchAgents/com.marketingclaw.gateway.plist",
        systemdServiceName: "marketingclaw-gateway",
        windowsTaskName: "MarketingClaw Gateway",
      }),
    ).toEqual([
      "marketingclaw gateway install",
      "marketingclaw gateway",
      "launchctl bootstrap gui/$UID ~/Library/LaunchAgents/com.marketingclaw.gateway.plist",
    ]);
    expect(
      buildPlatformServiceStartHints({
        platform: "linux",
        installCommand: "marketingclaw gateway install",
        startCommand: "marketingclaw gateway",
        launchAgentPlistPath: "~/Library/LaunchAgents/com.marketingclaw.gateway.plist",
        systemdServiceName: "marketingclaw-gateway",
        windowsTaskName: "MarketingClaw Gateway",
      }),
    ).toEqual([
      "marketingclaw gateway install",
      "marketingclaw gateway",
      "systemctl --user start marketingclaw-gateway.service",
    ]);
  });
});
