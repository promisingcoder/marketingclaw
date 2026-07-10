// Launchd current service tests cover resolving active macOS service labels.
import { describe, expect, it } from "vitest";
import { isCurrentProcessLaunchdServiceLabel } from "./launchd-current-service.js";

describe("isCurrentProcessLaunchdServiceLabel", () => {
  it("matches launchd-provided service labels", () => {
    expect(
      isCurrentProcessLaunchdServiceLabel("ai.marketingclaw.gateway", {
        LAUNCH_JOB_LABEL: "ai.marketingclaw.gateway",
      }),
    ).toBe(true);
  });

  it("falls back to MarketingClaw service markers when XPC_SERVICE_NAME is inherited", () => {
    expect(
      isCurrentProcessLaunchdServiceLabel("ai.marketingclaw.gateway", {
        XPC_SERVICE_NAME: "0",
        MARKETINGCLAW_SERVICE_MARKER: "marketingclaw",
        MARKETINGCLAW_SERVICE_KIND: "gateway",
        MARKETINGCLAW_LAUNCHD_LABEL: "ai.marketingclaw.gateway",
      }),
    ).toBe(true);
  });

  it("preserves label-only fallback when launchd exposes no label variables", () => {
    expect(
      isCurrentProcessLaunchdServiceLabel("ai.marketingclaw.gateway", {
        MARKETINGCLAW_LAUNCHD_LABEL: "ai.marketingclaw.gateway",
      }),
    ).toBe(true);
  });

  it("can require service markers for label-only fallback", () => {
    expect(
      isCurrentProcessLaunchdServiceLabel(
        "ai.marketingclaw.gateway",
        {
          MARKETINGCLAW_LAUNCHD_LABEL: "ai.marketingclaw.gateway",
        },
        { allowConfiguredLabelFallback: false },
      ),
    ).toBe(false);
  });

  it("does not treat unrelated inherited launchd labels as current services", () => {
    expect(
      isCurrentProcessLaunchdServiceLabel("ai.marketingclaw.gateway", {
        XPC_SERVICE_NAME: "0",
        MARKETINGCLAW_LAUNCHD_LABEL: "ai.marketingclaw.gateway",
      }),
    ).toBe(false);
  });
});
