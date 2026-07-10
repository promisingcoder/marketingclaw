/**
 * Gateway startup orchestration tests.
 */
import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import type { MarketingClawConfig } from "../config/config.js";

const ensureMarketingClawModelsJsonMock = vi.fn<
  (
    config: unknown,
    agentDir: unknown,
    options?: unknown,
  ) => Promise<{ agentDir: string; wrote: boolean }>
>(async () => ({ agentDir: "/tmp/agent", wrote: false }));
const resolveConfiguredModelRefMock = vi.fn(({ cfg }: { cfg: MarketingClawConfig }) => {
  const configured = cfg.agents?.defaults?.model;
  const primary = typeof configured === "string" ? configured : configured?.primary;
  const [provider = "openai", ...modelParts] = (primary ?? "openai/gpt-5.5").split("/");
  return { provider, model: modelParts.join("/") };
});

vi.mock("../agents/agent-scope.js", () => ({
  resolveDefaultAgentDir: () => "/tmp/agent",
  resolveAgentWorkspaceDir: () => "/tmp/workspace",
  resolveDefaultAgentId: () => "default",
}));

vi.mock("../agents/models-config.js", () => ({
  ensureMarketingClawModelsJson: (config: unknown, agentDir: unknown, options?: unknown) =>
    ensureMarketingClawModelsJsonMock(config, agentDir, options),
}));

vi.mock("../agents/model-selection.js", () => ({
  isCliProvider: () => false,
  resolveConfiguredModelRef: (params: { cfg: MarketingClawConfig }) =>
    resolveConfiguredModelRefMock(params),
}));

let prewarmConfiguredPrimaryModel: typeof import("./server-startup-post-attach.js").testing.prewarmConfiguredPrimaryModel;
let shouldSkipStartupModelPrewarm: typeof import("./server-startup-post-attach.js").testing.shouldSkipStartupModelPrewarm;

function expectModelsJsonPrewarmCall(cfg: MarketingClawConfig) {
  expect(ensureMarketingClawModelsJsonMock).toHaveBeenCalledTimes(1);
  const [calledConfig, agentDir, options] =
    ensureMarketingClawModelsJsonMock.mock.calls.at(0) ?? [];
  expect(calledConfig).toBe(cfg);
  expect(agentDir).toBe("/tmp/agent");
  expect(options).toEqual({
    workspaceDir: "/tmp/workspace",
    providerDiscoveryProviderIds: ["openai"],
    providerDiscoveryTimeoutMs: 5000,
    providerDiscoveryEntriesOnly: true,
  });
}

describe("gateway startup primary model warmup", () => {
  beforeAll(async () => {
    ({
      testing: { prewarmConfiguredPrimaryModel, shouldSkipStartupModelPrewarm },
    } = await import("./server-startup-post-attach.js"));
  });

  beforeEach(() => {
    ensureMarketingClawModelsJsonMock.mockClear();
    resolveConfiguredModelRefMock.mockClear();
  });

  it("prewarms an explicit configured primary model", async () => {
    const cfg = {
      agents: {
        defaults: {
          model: {
            primary: "openai/gpt-5.4",
          },
        },
      },
    } as MarketingClawConfig;

    await prewarmConfiguredPrimaryModel({
      cfg,
      log: { warn: vi.fn() },
    });

    expectModelsJsonPrewarmCall(cfg);
    expect(resolveConfiguredModelRefMock).toHaveBeenCalledTimes(1);
  });

  it("skips warmup when no explicit primary model is configured", async () => {
    await prewarmConfiguredPrimaryModel({
      cfg: {} as MarketingClawConfig,
      log: { warn: vi.fn() },
    });

    expect(ensureMarketingClawModelsJsonMock).not.toHaveBeenCalled();
    expect(resolveConfiguredModelRefMock).not.toHaveBeenCalled();
  });

  it("honors the startup model prewarm skip env", () => {
    expect(shouldSkipStartupModelPrewarm({})).toBe(false);
    expect(
      shouldSkipStartupModelPrewarm({
        MARKETINGCLAW_SKIP_STARTUP_MODEL_PREWARM: "1",
      }),
    ).toBe(true);
    expect(
      shouldSkipStartupModelPrewarm({
        MARKETINGCLAW_SKIP_STARTUP_MODEL_PREWARM: "true",
      }),
    ).toBe(true);
  });

  it("skips static warmup for configured CLI backends", async () => {
    await prewarmConfiguredPrimaryModel({
      cfg: {
        agents: {
          defaults: {
            model: {
              primary: "codex-cli/gpt-5.5",
            },
            cliBackends: {
              "codex-cli": {
                command: "codex",
                args: ["exec"],
              },
            },
          },
        },
      } as MarketingClawConfig,
      log: { warn: vi.fn() },
    });

    expect(ensureMarketingClawModelsJsonMock).not.toHaveBeenCalled();
    expect(resolveConfiguredModelRefMock).not.toHaveBeenCalled();
  });

  it("warns when scoped models.json preparation fails", async () => {
    ensureMarketingClawModelsJsonMock.mockRejectedValueOnce(new Error("models write failed"));
    const warn = vi.fn();

    await prewarmConfiguredPrimaryModel({
      cfg: {
        agents: {
          defaults: {
            model: {
              primary: "codex/gpt-5.4",
            },
          },
        },
      } as MarketingClawConfig,
      log: { warn },
    });

    expect(warn).toHaveBeenCalledWith(
      "startup model warmup failed for codex/gpt-5.4: Error: models write failed",
    );
  });
});
