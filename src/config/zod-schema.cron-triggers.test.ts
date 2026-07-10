import { describe, expect, it } from "vitest";
import { MarketingClawSchema } from "./zod-schema.js";

describe("MarketingClawSchema cron triggers", () => {
  it("accepts the strict trigger gate and interval floor", () => {
    expect(
      MarketingClawSchema.parse({ cron: { triggers: { enabled: true, minIntervalMs: 45_000 } } })
        .cron?.triggers,
    ).toEqual({ enabled: true, minIntervalMs: 45_000 });
  });

  it("rejects invalid and unknown trigger settings", () => {
    expect(
      MarketingClawSchema.safeParse({ cron: { triggers: { minIntervalMs: 0 } } }).success,
    ).toBe(false);
    expect(
      MarketingClawSchema.safeParse({ cron: { triggers: { enabled: true, extra: true } } }).success,
    ).toBe(false);
  });
});
