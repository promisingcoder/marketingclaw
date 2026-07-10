// Matrix tests cover device health plugin behavior.
import { describe, expect, it } from "vitest";
import {
  isMarketingClawManagedMatrixDevice,
  summarizeMatrixDeviceHealth,
} from "./device-health.js";

describe("matrix device health", () => {
  it("detects MarketingClaw-managed device names", () => {
    expect(isMarketingClawManagedMatrixDevice("MarketingClaw Gateway")).toBe(true);
    expect(isMarketingClawManagedMatrixDevice("MarketingClaw Debug")).toBe(true);
    expect(isMarketingClawManagedMatrixDevice("Element iPhone")).toBe(false);
    expect(isMarketingClawManagedMatrixDevice(null)).toBe(false);
  });

  it("summarizes stale MarketingClaw-managed devices separately from the current device", () => {
    const summary = summarizeMatrixDeviceHealth([
      {
        deviceId: "du314Zpw3A",
        displayName: "MarketingClaw Gateway",
        current: true,
      },
      {
        deviceId: "BritdXC6iL",
        displayName: "MarketingClaw Gateway",
        current: false,
      },
      {
        deviceId: "G6NJU9cTgs",
        displayName: "MarketingClaw Debug",
        current: false,
      },
      {
        deviceId: "phone123",
        displayName: "Element iPhone",
        current: false,
      },
    ]);

    expect(summary).toEqual({
      currentDeviceId: "du314Zpw3A",
      currentMarketingClawDevices: [
        {
          deviceId: "du314Zpw3A",
          displayName: "MarketingClaw Gateway",
          current: true,
        },
      ],
      staleMarketingClawDevices: [
        {
          deviceId: "BritdXC6iL",
          displayName: "MarketingClaw Gateway",
          current: false,
        },
        {
          deviceId: "G6NJU9cTgs",
          displayName: "MarketingClaw Debug",
          current: false,
        },
      ],
    });
  });
});
