// Browser tests cover server context.ensure browser available.waits for cdp ready plugin behavior.
import type { ChildProcessWithoutNullStreams } from "node:child_process";
import { EventEmitter } from "node:events";
import { afterEach, describe, expect, it, vi } from "vitest";
import "./server-context.chrome-test-harness.js";
import { PROFILE_ATTACH_RETRY_TIMEOUT_MS } from "./cdp-timeouts.js";
import * as chromeModule from "./chrome.js";
import { BROWSER_ERROR_REASONS, BrowserProfileUnavailableError } from "./errors.js";
import { createBrowserRouteContext } from "./server-context.js";
import { makeBrowserServerState, mockLaunchedChrome } from "./server-context.test-harness.js";

const PROFILE_HTTP_REACHABILITY_TIMEOUT_MS = 300;

function setupEnsureBrowserAvailableHarness() {
  vi.useFakeTimers();

  const launchMarketingClawChrome = vi.mocked(chromeModule.launchMarketingClawChrome);
  const stopMarketingClawChrome = vi.mocked(chromeModule.stopMarketingClawChrome);
  const isChromeReachable = vi.mocked(chromeModule.isChromeReachable);
  const isChromeCdpReady = vi.mocked(chromeModule.isChromeCdpReady);
  isChromeReachable.mockResolvedValue(false);

  const state = makeBrowserServerState();
  const ctx = createBrowserRouteContext({ getState: () => state });
  const profile = ctx.forProfile("marketingclaw");

  return { launchMarketingClawChrome, stopMarketingClawChrome, isChromeCdpReady, profile, state };
}

function createAttachOnlyLoopbackProfile(cdpUrl: string) {
  const state = makeBrowserServerState({
    profile: {
      name: "manual-cdp",
      cdpUrl,
      cdpHost: "127.0.0.1",
      cdpIsLoopback: true,
      cdpPort: 9222,
      color: "#00AA00",
      driver: "marketingclaw",
      headless: false,
      attachOnly: true,
    },
    resolvedOverrides: {
      defaultProfile: "manual-cdp",
      ssrfPolicy: {},
    },
  });
  const ctx = createBrowserRouteContext({ getState: () => state });
  return { profile: ctx.forProfile("manual-cdp"), state };
}

function requireFirstLaunchOptions(launchMarketingClawChrome: {
  mock: { calls: unknown[][] };
}): unknown {
  const [call] = launchMarketingClawChrome.mock.calls;
  if (!call) {
    throw new Error("expected Chrome launch call");
  }
  return call[2];
}

afterEach(() => {
  vi.useRealTimers();
  vi.clearAllMocks();
  vi.restoreAllMocks();
});

describe("browser server-context ensureBrowserAvailable", () => {
  it("waits for CDP readiness after launching to avoid follow-up PortInUseError races (#21149)", async () => {
    const { launchMarketingClawChrome, stopMarketingClawChrome, isChromeCdpReady, profile } =
      setupEnsureBrowserAvailableHarness();
    isChromeCdpReady.mockResolvedValueOnce(false).mockResolvedValue(true);
    mockLaunchedChrome(launchMarketingClawChrome, 123);

    const promise = profile.ensureBrowserAvailable();
    await vi.advanceTimersByTimeAsync(100);
    await expect(promise).resolves.toBeUndefined();

    expect(launchMarketingClawChrome).toHaveBeenCalledTimes(1);
    expect(isChromeCdpReady).toHaveBeenCalled();
    expect(stopMarketingClawChrome).not.toHaveBeenCalled();
  });

  it("stops launched chrome when CDP readiness never arrives", async () => {
    const { launchMarketingClawChrome, stopMarketingClawChrome, isChromeCdpReady, profile } =
      setupEnsureBrowserAvailableHarness();
    isChromeCdpReady.mockResolvedValue(false);
    mockLaunchedChrome(launchMarketingClawChrome, 321);

    const promise = profile.ensureBrowserAvailable();
    const rejected = expect(promise).rejects.toThrow("not reachable after start");
    const diagnosticRejected = expect(promise).rejects.toThrow(
      "CDP diagnostic: websocket_health_command_timeout; mock CDP diagnostic.",
    );
    await vi.advanceTimersByTimeAsync(8100);
    await rejected;
    await diagnosticRejected;

    expect(launchMarketingClawChrome).toHaveBeenCalledTimes(1);
    expect(stopMarketingClawChrome).toHaveBeenCalledTimes(1);
  });

  it("uses configured local CDP readiness timeout after launching", async () => {
    const { launchMarketingClawChrome, stopMarketingClawChrome, isChromeCdpReady, profile, state } =
      setupEnsureBrowserAvailableHarness();
    state.resolved.localCdpReadyTimeoutMs = 250;
    isChromeCdpReady.mockResolvedValue(false);
    mockLaunchedChrome(launchMarketingClawChrome, 322);

    const promise = profile.ensureBrowserAvailable();
    const rejected = expect(promise).rejects.toThrow("not reachable after start");
    await vi.advanceTimersByTimeAsync(300);
    await rejected;

    expect(launchMarketingClawChrome).toHaveBeenCalledTimes(1);
    expect(stopMarketingClawChrome).toHaveBeenCalledTimes(1);
  });

  it("deduplicates concurrent lazy-start calls to prevent PortInUseError", async () => {
    const { launchMarketingClawChrome, stopMarketingClawChrome, isChromeCdpReady, profile } =
      setupEnsureBrowserAvailableHarness();
    isChromeCdpReady.mockResolvedValue(true);
    mockLaunchedChrome(launchMarketingClawChrome, 456);

    const first = profile.ensureBrowserAvailable();
    const second = profile.ensureBrowserAvailable();
    await vi.advanceTimersByTimeAsync(100);
    await expect(Promise.all([first, second])).resolves.toEqual([undefined, undefined]);

    expect(launchMarketingClawChrome).toHaveBeenCalledTimes(1);
    expect(stopMarketingClawChrome).not.toHaveBeenCalled();
  });

  it("deduplicates concurrent lazy-start calls across fresh profile contexts", async () => {
    const { launchMarketingClawChrome, stopMarketingClawChrome, isChromeCdpReady, state } =
      setupEnsureBrowserAvailableHarness();
    isChromeCdpReady.mockResolvedValue(true);
    mockLaunchedChrome(launchMarketingClawChrome, 457);

    const firstCtx = createBrowserRouteContext({ getState: () => state });
    const secondCtx = createBrowserRouteContext({ getState: () => state });
    const first = firstCtx.forProfile("marketingclaw").ensureBrowserAvailable();
    const second = secondCtx.forProfile("marketingclaw").ensureBrowserAvailable();
    await vi.advanceTimersByTimeAsync(100);
    await expect(Promise.all([first, second])).resolves.toEqual([undefined, undefined]);

    expect(launchMarketingClawChrome).toHaveBeenCalledTimes(1);
    expect(stopMarketingClawChrome).not.toHaveBeenCalled();
  });

  it("passes request-local headless override to initial launch", async () => {
    const { launchMarketingClawChrome, stopMarketingClawChrome, isChromeCdpReady, profile } =
      setupEnsureBrowserAvailableHarness();
    isChromeCdpReady.mockResolvedValue(true);
    mockLaunchedChrome(launchMarketingClawChrome, 654);

    const promise = profile.ensureBrowserAvailable({ headless: true });
    await vi.advanceTimersByTimeAsync(100);
    await expect(promise).resolves.toBeUndefined();

    expect(launchMarketingClawChrome).toHaveBeenCalledTimes(1);
    expect(requireFirstLaunchOptions(launchMarketingClawChrome)).toEqual({
      headlessOverride: true,
    });
    expect(stopMarketingClawChrome).not.toHaveBeenCalled();
  });

  it("passes request-local headless override to the owned restart path", async () => {
    const { launchMarketingClawChrome, stopMarketingClawChrome, isChromeCdpReady, profile, state } =
      setupEnsureBrowserAvailableHarness();
    const isChromeReachable = vi.mocked(chromeModule.isChromeReachable);
    const existingProc = new EventEmitter() as unknown as ChildProcessWithoutNullStreams;
    state.profiles.set("marketingclaw", {
      profile: profile.profile,
      running: {
        pid: 111,
        exe: { kind: "chromium", path: "/usr/bin/chromium" },
        userDataDir: "/tmp/marketingclaw-test",
        cdpPort: 18800,
        startedAt: Date.now(),
        proc: existingProc,
      },
      lastTargetId: null,
      reconcile: null,
    });
    isChromeReachable.mockResolvedValue(true);
    isChromeCdpReady.mockResolvedValueOnce(false).mockResolvedValueOnce(true);
    mockLaunchedChrome(launchMarketingClawChrome, 987);

    await expect(profile.ensureBrowserAvailable({ headless: true })).resolves.toBeUndefined();

    expect(stopMarketingClawChrome).toHaveBeenCalledTimes(1);
    expect(launchMarketingClawChrome).toHaveBeenCalledTimes(1);
    expect(requireFirstLaunchOptions(launchMarketingClawChrome)).toEqual({
      headlessOverride: true,
    });
  });

  it("does not share inflight lazy-start promises across different headless overrides", async () => {
    const { launchMarketingClawChrome, isChromeCdpReady, profile } =
      setupEnsureBrowserAvailableHarness();
    const isChromeReachable = vi.mocked(chromeModule.isChromeReachable);
    isChromeReachable.mockResolvedValueOnce(false).mockResolvedValueOnce(true);
    isChromeCdpReady.mockResolvedValue(true);
    mockLaunchedChrome(launchMarketingClawChrome, 456);

    const first = profile.ensureBrowserAvailable();
    const second = profile.ensureBrowserAvailable({ headless: true });
    await vi.advanceTimersByTimeAsync(100);
    await expect(Promise.all([first, second])).resolves.toEqual([undefined, undefined]);

    expect(launchMarketingClawChrome).toHaveBeenCalledTimes(1);
    expect(isChromeReachable.mock.calls.length).toBeGreaterThan(1);
  });

  it("clears the concurrent lazy-start guard after launch failure", async () => {
    const { launchMarketingClawChrome, stopMarketingClawChrome, isChromeCdpReady, profile } =
      setupEnsureBrowserAvailableHarness();
    isChromeCdpReady.mockResolvedValue(true);
    launchMarketingClawChrome.mockRejectedValueOnce(
      new Error("PortInUseError: listen EADDRINUSE 127.0.0.1:18800"),
    );

    const first = profile.ensureBrowserAvailable();
    const second = profile.ensureBrowserAvailable();
    await expect(Promise.all([first, second])).rejects.toThrow("PortInUseError");

    mockLaunchedChrome(launchMarketingClawChrome, 789);
    const retry = profile.ensureBrowserAvailable();
    await vi.advanceTimersByTimeAsync(100);
    await expect(retry).resolves.toBeUndefined();

    expect(launchMarketingClawChrome).toHaveBeenCalledTimes(2);
    expect(stopMarketingClawChrome).not.toHaveBeenCalled();
  });

  it("cools down repeated managed Chrome launch failures across route contexts", async () => {
    const { launchMarketingClawChrome, stopMarketingClawChrome, isChromeCdpReady, state } =
      setupEnsureBrowserAvailableHarness();
    isChromeCdpReady.mockResolvedValue(true);
    launchMarketingClawChrome.mockRejectedValue(new Error("Failed to start Chrome CDP"));

    for (let attempt = 0; attempt < 3; attempt += 1) {
      const ctx = createBrowserRouteContext({ getState: () => state });
      await expect(ctx.forProfile("marketingclaw").ensureBrowserAvailable()).rejects.toThrow(
        "Failed to start Chrome CDP",
      );
    }

    const cooledDownCtx = createBrowserRouteContext({ getState: () => state });
    await expect(
      cooledDownCtx.forProfile("marketingclaw").ensureBrowserAvailable(),
    ).rejects.toThrow(
      'Browser launch for profile "marketingclaw" is cooling down after 3 consecutive managed Chrome launch failures.',
    );
    await expect(
      cooledDownCtx.forProfile("marketingclaw").ensureBrowserAvailable(),
    ).rejects.toThrow("set browser.enabled=false if the browser tool is not needed");

    expect(launchMarketingClawChrome).toHaveBeenCalledTimes(3);
    expect(stopMarketingClawChrome).not.toHaveBeenCalled();
  });

  it("does not let no-display preflight failures block explicit headless recovery", async () => {
    const { launchMarketingClawChrome, stopMarketingClawChrome, isChromeCdpReady, state } =
      setupEnsureBrowserAvailableHarness();
    isChromeCdpReady.mockResolvedValue(true);
    launchMarketingClawChrome.mockRejectedValue(
      new BrowserProfileUnavailableError("display required", {
        metadata: {
          reason: BROWSER_ERROR_REASONS.noDisplayForHeadedProfile,
          details: {
            profile: "marketingclaw",
            requestedHeadless: false,
            headlessSource: "config",
            displayPresent: false,
          },
        },
      }),
    );

    for (let attempt = 0; attempt < 3; attempt += 1) {
      const ctx = createBrowserRouteContext({ getState: () => state });
      await expect(ctx.forProfile("marketingclaw").ensureBrowserAvailable()).rejects.toThrow(
        "display required",
      );
    }

    mockLaunchedChrome(launchMarketingClawChrome, 987);
    const recoveryCtx = createBrowserRouteContext({ getState: () => state });
    const recovery = recoveryCtx
      .forProfile("marketingclaw")
      .ensureBrowserAvailable({ headless: true });
    await vi.advanceTimersByTimeAsync(100);
    await expect(recovery).resolves.toBeUndefined();

    expect(launchMarketingClawChrome).toHaveBeenCalledTimes(4);
    expect(launchMarketingClawChrome.mock.calls.at(-1)?.[2]).toEqual({ headlessOverride: true });
    expect(state.profiles.get("marketingclaw")?.managedLaunchFailure).toBeUndefined();
    expect(stopMarketingClawChrome).not.toHaveBeenCalled();
  });

  it("allows one managed Chrome launch attempt after the cooldown expires", async () => {
    const { launchMarketingClawChrome, isChromeCdpReady, state } =
      setupEnsureBrowserAvailableHarness();
    isChromeCdpReady.mockResolvedValue(true);
    launchMarketingClawChrome.mockRejectedValue(new Error("Failed to start Chrome CDP"));

    for (let attempt = 0; attempt < 3; attempt += 1) {
      const ctx = createBrowserRouteContext({ getState: () => state });
      await expect(ctx.forProfile("marketingclaw").ensureBrowserAvailable()).rejects.toThrow(
        "Failed to start Chrome CDP",
      );
    }

    await vi.advanceTimersByTimeAsync(30_000);
    const retryCtx = createBrowserRouteContext({ getState: () => state });
    await expect(retryCtx.forProfile("marketingclaw").ensureBrowserAvailable()).rejects.toThrow(
      "Failed to start Chrome CDP",
    );

    expect(launchMarketingClawChrome).toHaveBeenCalledTimes(4);
  });

  it("reuses a pre-existing loopback browser after an initial short probe miss", async () => {
    const { launchMarketingClawChrome, stopMarketingClawChrome, isChromeCdpReady, profile, state } =
      setupEnsureBrowserAvailableHarness();
    const isChromeReachable = vi.mocked(chromeModule.isChromeReachable);
    state.resolved.ssrfPolicy = {};

    isChromeReachable.mockResolvedValueOnce(false).mockResolvedValueOnce(true);
    isChromeCdpReady.mockResolvedValueOnce(true);

    await expect(profile.ensureBrowserAvailable()).resolves.toBeUndefined();

    expect(isChromeReachable).toHaveBeenNthCalledWith(
      1,
      "http://127.0.0.1:18800",
      PROFILE_HTTP_REACHABILITY_TIMEOUT_MS,
      undefined,
    );
    expect(isChromeReachable).toHaveBeenNthCalledWith(
      2,
      "http://127.0.0.1:18800",
      PROFILE_ATTACH_RETRY_TIMEOUT_MS,
      undefined,
    );
    expect(launchMarketingClawChrome).not.toHaveBeenCalled();
    expect(stopMarketingClawChrome).not.toHaveBeenCalled();
  });

  it("explains attachOnly for externally managed loopback CDP services", async () => {
    const { launchMarketingClawChrome, stopMarketingClawChrome, isChromeCdpReady, profile } =
      setupEnsureBrowserAvailableHarness();
    const isChromeReachable = vi.mocked(chromeModule.isChromeReachable);

    isChromeReachable.mockResolvedValue(true);
    isChromeCdpReady.mockResolvedValue(false);

    const promise = profile.ensureBrowserAvailable();
    await expect(promise).rejects.toThrow(
      'Port 18800 is in use for profile "marketingclaw" but not by marketingclaw.',
    );
    await expect(promise).rejects.toThrow(
      "set browser.profiles.marketingclaw.attachOnly=true so MarketingClaw attaches without trying to manage the local process",
    );
    await expect(promise).rejects.toThrow(
      "For Browserless Docker, set EXTERNAL to the same WebSocket endpoint MarketingClaw can reach via browser.profiles.<name>.cdpUrl.",
    );

    expect(launchMarketingClawChrome).not.toHaveBeenCalled();
    expect(stopMarketingClawChrome).not.toHaveBeenCalled();
  });

  it("retries remote CDP websocket reachability once before failing", async () => {
    const { launchMarketingClawChrome, stopMarketingClawChrome, isChromeCdpReady } =
      setupEnsureBrowserAvailableHarness();
    const isChromeReachable = vi.mocked(chromeModule.isChromeReachable);

    const state = makeBrowserServerState();
    state.resolved.profiles.marketingclaw = {
      cdpUrl: "ws://browserless:3001",
      color: "#00AA00",
    };
    const ctx = createBrowserRouteContext({ getState: () => state });
    const profile = ctx.forProfile("marketingclaw");
    const expectedRemoteHttpTimeoutMs = state.resolved.remoteCdpTimeoutMs;
    const expectedRemoteWsTimeoutMs = state.resolved.remoteCdpHandshakeTimeoutMs;

    isChromeReachable.mockResolvedValueOnce(true);
    isChromeCdpReady.mockResolvedValueOnce(false).mockResolvedValueOnce(true);

    await expect(profile.ensureBrowserAvailable()).resolves.toBeUndefined();

    expect(isChromeReachable).toHaveBeenCalledTimes(1);
    expect(isChromeCdpReady).toHaveBeenCalledTimes(2);
    expect(isChromeCdpReady).toHaveBeenNthCalledWith(
      1,
      "ws://browserless:3001",
      expectedRemoteHttpTimeoutMs,
      expectedRemoteWsTimeoutMs,
      {
        allowPrivateNetwork: true,
        allowedHostnames: ["browserless"],
        hostnameAllowlist: ["browserless"],
      },
    );
    expect(isChromeCdpReady).toHaveBeenNthCalledWith(
      2,
      "ws://browserless:3001",
      expectedRemoteHttpTimeoutMs,
      expectedRemoteWsTimeoutMs,
      {
        allowPrivateNetwork: true,
        allowedHostnames: ["browserless"],
        hostnameAllowlist: ["browserless"],
      },
    );
    expect(launchMarketingClawChrome).not.toHaveBeenCalled();
    expect(stopMarketingClawChrome).not.toHaveBeenCalled();
  });

  it("treats attachOnly loopback CDP as local control with remote-class probe timeouts", async () => {
    const { launchMarketingClawChrome, stopMarketingClawChrome } =
      setupEnsureBrowserAvailableHarness();
    const isChromeReachable = vi.mocked(chromeModule.isChromeReachable);
    const isChromeCdpReady = vi.mocked(chromeModule.isChromeCdpReady);

    const { profile, state } = createAttachOnlyLoopbackProfile("http://127.0.0.1:9222");

    isChromeReachable.mockResolvedValueOnce(true);
    isChromeCdpReady.mockResolvedValueOnce(true);

    await expect(profile.ensureBrowserAvailable()).resolves.toBeUndefined();

    expect(isChromeReachable).toHaveBeenCalledWith(
      "http://127.0.0.1:9222",
      state.resolved.remoteCdpTimeoutMs,
      undefined,
    );
    expect(isChromeCdpReady).toHaveBeenCalledWith(
      "http://127.0.0.1:9222",
      state.resolved.remoteCdpTimeoutMs,
      state.resolved.remoteCdpHandshakeTimeoutMs,
      undefined,
    );
    expect(launchMarketingClawChrome).not.toHaveBeenCalled();
    expect(stopMarketingClawChrome).not.toHaveBeenCalled();
  });

  it("resolves for attachOnly loopback profile with a bare ws:// cdpUrl when CDP is reachable (#68027)", async () => {
    // Regression for #68027: a bare `ws://host:port` cdpUrl on a loopback
    // attachOnly profile must not surface as
    //   `Browser attachOnly is enabled and profile "<name>" is not running.`
    // when the underlying CDP endpoint is actually healthy. The low-level
    // fix lives in chrome.ts/cdp.ts (see chrome.test.ts #68027 tests); this
    // higher-level test locks the user-facing symptom at
    // ensureBrowserAvailable() so future refactors of the availability flow
    // cannot silently reintroduce the bug by munging/short-circuiting bare
    // ws:// URLs before they reach the helpers.
    const { launchMarketingClawChrome, stopMarketingClawChrome } =
      setupEnsureBrowserAvailableHarness();
    const isChromeReachable = vi.mocked(chromeModule.isChromeReachable);
    const isChromeCdpReady = vi.mocked(chromeModule.isChromeCdpReady);

    const { profile, state } = createAttachOnlyLoopbackProfile("ws://127.0.0.1:9222");

    isChromeReachable.mockResolvedValueOnce(true);
    isChromeCdpReady.mockResolvedValueOnce(true);

    await expect(profile.ensureBrowserAvailable()).resolves.toBeUndefined();

    // The bare ws:// URL must pass through unchanged — the helpers own the
    // discovery-first-then-fallback strategy for bare ws roots.
    expect(isChromeReachable).toHaveBeenCalledWith(
      "ws://127.0.0.1:9222",
      state.resolved.remoteCdpTimeoutMs,
      undefined,
    );
    expect(isChromeCdpReady).toHaveBeenCalledWith(
      "ws://127.0.0.1:9222",
      state.resolved.remoteCdpTimeoutMs,
      state.resolved.remoteCdpHandshakeTimeoutMs,
      undefined,
    );
    expect(launchMarketingClawChrome).not.toHaveBeenCalled();
    expect(stopMarketingClawChrome).not.toHaveBeenCalled();
  });

  it("redacts credentials in remote CDP availability errors", async () => {
    const { launchMarketingClawChrome, stopMarketingClawChrome } =
      setupEnsureBrowserAvailableHarness();
    const isChromeReachable = vi.mocked(chromeModule.isChromeReachable);

    const state = makeBrowserServerState({
      profile: {
        name: "remote",
        cdpUrl: "https://user:pass@browserless.example.com?token=supersecret123",
        cdpHost: "browserless.example.com",
        cdpIsLoopback: false,
        cdpPort: 443,
        color: "#00AA00",
        driver: "marketingclaw",
        headless: false,
        attachOnly: false,
      },
      resolvedOverrides: {
        defaultProfile: "remote",
        ssrfPolicy: {},
      },
    });
    const ctx = createBrowserRouteContext({ getState: () => state });
    const profile = ctx.forProfile("remote");

    isChromeReachable.mockResolvedValue(false);

    const promise = profile.ensureBrowserAvailable();
    await expect(promise).rejects.toThrow(BrowserProfileUnavailableError);
    await expect(promise).rejects.toThrow(
      'Remote CDP for profile "remote" is not reachable at https://browserless.example.com/?token=***.',
    );

    expect(launchMarketingClawChrome).not.toHaveBeenCalled();
    expect(stopMarketingClawChrome).not.toHaveBeenCalled();
  });
});
