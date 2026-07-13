// Tests npm registry spec parsing for packages, tags, and versions.
import { describe, expect, it } from "vitest";
import {
  compareMarketingClawReleaseVersions,
  formatPrereleaseResolutionError,
  isExactSemverVersion,
  isMarketingClawOrgNpmSpec,
  isMarketingClawStableCorrectionVersion,
  isPrereleaseSemverVersion,
  isPrereleaseResolutionAllowed,
  parseRegistryNpmSpec,
  validateRegistryNpmSpec,
} from "./npm-registry-spec.js";

function parseSpecOrThrow(spec: string) {
  const parsed = parseRegistryNpmSpec(spec);
  if (parsed === null) {
    throw new Error(`Expected ${spec} to parse`);
  }
  return parsed;
}

describe("npm registry spec validation", () => {
  it.each([
    "@marketingclaw/voice-call",
    "@marketingclaw/voice-call@1.2.3",
    "@marketingclaw/voice-call@1.2.3-beta.4",
    "@marketingclaw/voice-call@latest",
    "@marketingclaw/voice-call@beta",
  ])("accepts %s", (spec) => {
    expect(validateRegistryNpmSpec(spec)).toBeNull();
  });

  it.each([
    {
      spec: "@marketingclaw/voice-call@^1.2.3",
      expected: "exact version or dist-tag",
    },
    {
      spec: "@marketingclaw/voice-call@~1.2.3",
      expected: "exact version or dist-tag",
    },
    {
      spec: "https://npmjs.org/pkg.tgz",
      expected: "URLs are not allowed",
    },
    {
      spec: "git+ssh://github.com/promisingcoder/marketingclaw",
      expected: "URLs are not allowed",
    },
    {
      spec: "@marketingclaw/voice-call@",
      expected: "missing version/tag after @",
    },
    {
      spec: "@marketingclaw/voice-call@../beta",
      expected: "invalid version/tag",
    },
  ])("rejects %s", ({ spec, expected }) => {
    expect(validateRegistryNpmSpec(spec)).toContain(expected);
  });
});

describe("npm registry spec parsing helpers", () => {
  it.each([
    {
      spec: "@marketingclaw/voice-call",
      expected: {
        name: "@marketingclaw/voice-call",
        raw: "@marketingclaw/voice-call",
        selectorKind: "none",
        selectorIsPrerelease: false,
      },
    },
    {
      spec: "@marketingclaw/voice-call@beta",
      expected: {
        name: "@marketingclaw/voice-call",
        raw: "@marketingclaw/voice-call@beta",
        selector: "beta",
        selectorKind: "tag",
        selectorIsPrerelease: false,
      },
    },
    {
      spec: "@marketingclaw/voice-call@2026.5.3-1",
      expected: {
        name: "@marketingclaw/voice-call",
        raw: "@marketingclaw/voice-call@2026.5.3-1",
        selector: "2026.5.3-1",
        selectorKind: "exact-version",
        selectorIsPrerelease: false,
      },
    },
    {
      spec: "@marketingclaw/voice-call@1.2.3-beta.1",
      expected: {
        name: "@marketingclaw/voice-call",
        raw: "@marketingclaw/voice-call@1.2.3-beta.1",
        selector: "1.2.3-beta.1",
        selectorKind: "exact-version",
        selectorIsPrerelease: true,
      },
    },
  ])("parses %s", ({ spec, expected }) => {
    expect(parseRegistryNpmSpec(spec)).toEqual(expected);
  });

  it.each([
    { spec: "@marketingclaw/voice-call", expected: true },
    { spec: "@marketingclaw/voice-call@1.2.3", expected: true },
    { spec: "@openclaw/demo-plugin", expected: true },
    { spec: "@clawdbot/demo-plugin", expected: false },
    { spec: "@other/voice-call", expected: false },
    { spec: "voice-call", expected: false },
    { spec: "npm:@marketingclaw/voice-call", expected: false },
    { spec: undefined, expected: false },
  ])("detects MarketingClaw-org npm specs for %s", ({ spec, expected }) => {
    expect(isMarketingClawOrgNpmSpec(spec)).toBe(expected);
  });

  it.each([
    { value: "v1.2.3", expected: true },
    { value: "1.2", expected: false },
  ])("detects exact semver versions for %s", ({ value, expected }) => {
    expect(isExactSemverVersion(value)).toBe(expected);
  });

  it.each([
    { value: "1.2.3-beta.1", expected: true },
    { value: "1.2.3-1", expected: true },
    { value: "2026.5.3-beta.1", expected: true },
    { value: "2026.5.3-1", expected: false },
    { value: "2026.2.30-1", expected: false },
    { value: "1.2.3", expected: false },
  ])("detects prerelease semver versions for %s", ({ value, expected }) => {
    expect(isPrereleaseSemverVersion(value)).toBe(expected);
  });

  it.each([
    { value: "2026.5.3-1", expected: true },
    { value: "2026.5.3-2", expected: true },
    { value: "2026.5.3-beta.1", expected: false },
    { value: "1.2.3-1", expected: false },
    { value: "2026.2.30-1", expected: true },
  ])("detects MarketingClaw stable correction versions for %s", ({ value, expected }) => {
    expect(isMarketingClawStableCorrectionVersion(value)).toBe(expected);
  });

  it.each([
    { left: "2026.5.3-1", right: "2026.5.3", expected: 1 },
    { left: "2026.5.3-2", right: "2026.5.3-1", expected: 1 },
    { left: "2026.5.3", right: "2026.5.3-beta.3", expected: 1 },
    { left: "2026.5.3-beta.3", right: "2026.5.3-alpha.9", expected: 1 },
    { left: "1.2.3-1", right: "1.2.3", expected: null },
  ])("compares MarketingClaw release versions for %s and %s", ({ left, right, expected }) => {
    expect(compareMarketingClawReleaseVersions(left, right)).toBe(expected);
  });
});

describe("npm prerelease resolution policy", () => {
  it.each([
    {
      spec: "@marketingclaw/voice-call",
      resolvedVersion: "1.2.3-beta.1",
      expected: false,
    },
    {
      spec: "@marketingclaw/voice-call@latest",
      resolvedVersion: "1.2.3-rc.1",
      expected: false,
    },
    {
      spec: "@marketingclaw/voice-call@latest",
      resolvedVersion: "2026.5.3-1",
      expected: true,
    },
    {
      spec: "@marketingclaw/voice-call@beta",
      resolvedVersion: "1.2.3-beta.4",
      expected: true,
    },
    {
      spec: "@marketingclaw/voice-call@1.2.3-beta.1",
      resolvedVersion: "1.2.3-beta.1",
      expected: true,
    },
    {
      spec: "@marketingclaw/voice-call",
      resolvedVersion: "1.2.3",
      expected: true,
    },
    {
      spec: "@marketingclaw/voice-call@latest",
      resolvedVersion: undefined,
      expected: true,
    },
  ])("decides prerelease resolution for %s -> %s", ({ spec, resolvedVersion, expected }) => {
    expect(
      isPrereleaseResolutionAllowed({
        spec: parseSpecOrThrow(spec),
        resolvedVersion,
      }),
    ).toBe(expected);
  });

  it.each([
    {
      spec: "@marketingclaw/voice-call",
      resolvedVersion: "1.2.3-beta.1",
      expected: `Use "@marketingclaw/voice-call@beta"`,
    },
    {
      spec: "@marketingclaw/voice-call@beta",
      resolvedVersion: "1.2.3-rc.1",
      expected: "Use an explicit prerelease tag or exact prerelease version",
    },
  ])("formats prerelease guidance for %s", ({ spec, resolvedVersion, expected }) => {
    expect(
      formatPrereleaseResolutionError({
        spec: parseSpecOrThrow(spec),
        resolvedVersion,
      }),
    ).toContain(expected);
  });
});
