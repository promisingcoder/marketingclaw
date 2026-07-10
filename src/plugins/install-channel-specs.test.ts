import { describe, expect, it } from "vitest";
import {
  resolveClawHubInstallSpecsForUpdateChannel,
  resolveNpmInstallSpecsForUpdateChannel,
} from "./install-channel-specs.js";

describe("resolveNpmInstallSpecsForUpdateChannel", () => {
  it.each(["@marketingclaw/discord", "@marketingclaw/discord@latest"])(
    "targets the exact core version for official extended-stable intent %s",
    (spec) => {
      expect(
        resolveNpmInstallSpecsForUpdateChannel({
          spec,
          updateChannel: "extended-stable",
          officialPackageName: "@marketingclaw/discord",
          coreVersion: "2026.7.33",
        }),
      ).toEqual({
        installSpec: "@marketingclaw/discord@2026.7.33",
        recordSpec: spec,
      });
    },
  );

  it.each([
    "@marketingclaw/discord@2026.6.33",
    "@marketingclaw/discord@next",
    "@marketingclaw/discord@beta",
    "@marketingclaw/discord@^2026.6.0",
    "https://registry.example.test/discord.tgz",
  ])("preserves explicit extended-stable intent %s", (spec) => {
    expect(
      resolveNpmInstallSpecsForUpdateChannel({
        spec,
        updateChannel: "extended-stable",
        officialPackageName: "@marketingclaw/discord",
        coreVersion: "2026.7.33",
      }),
    ).toEqual({ installSpec: spec, recordSpec: spec });
  });

  it("does not rewrite a third-party package", () => {
    expect(
      resolveNpmInstallSpecsForUpdateChannel({
        spec: "@acme/discord",
        updateChannel: "extended-stable",
        officialPackageName: "@marketingclaw/discord",
        coreVersion: "2026.7.33",
      }),
    ).toEqual({ installSpec: "@acme/discord", recordSpec: "@acme/discord" });
  });

  it("fails closed without an authoritative extended-stable core version", () => {
    expect(() =>
      resolveNpmInstallSpecsForUpdateChannel({
        spec: "@marketingclaw/discord",
        updateChannel: "extended-stable",
        officialPackageName: "@marketingclaw/discord",
      }),
    ).toThrow("requires an exact core version");
  });

  it("preserves beta behavior", () => {
    expect(
      resolveNpmInstallSpecsForUpdateChannel({
        spec: "@marketingclaw/discord@latest",
        updateChannel: "beta",
        officialPackageName: "@marketingclaw/discord",
        coreVersion: "2026.7.33",
      }),
    ).toEqual({
      installSpec: "@marketingclaw/discord@beta",
      recordSpec: "@marketingclaw/discord@latest",
      fallbackSpec: "@marketingclaw/discord@latest",
      fallbackLabel: "@marketingclaw/discord@beta",
    });
  });
});

describe("resolveClawHubInstallSpecsForUpdateChannel", () => {
  it("does not rewrite ClawHub on extended-stable", () => {
    expect(
      resolveClawHubInstallSpecsForUpdateChannel({
        spec: "clawhub:@marketingclaw/discord",
        updateChannel: "extended-stable",
      }),
    ).toEqual({
      installSpec: "clawhub:@marketingclaw/discord",
      recordSpec: "clawhub:@marketingclaw/discord",
    });
  });
});
