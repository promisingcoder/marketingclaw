import { describe, expect, it } from "vitest";
import {
  marketingClawNpmPrepublishVerifyUsage,
  parseMarketingClawNpmPrepublishVerifyArgs,
  usesPreparedLocalDependencyInstall,
} from "../scripts/marketingclaw-npm-prepublish-verify.ts";

describe("parseMarketingClawNpmPrepublishVerifyArgs", () => {
  it("supports help, optional versions, and package-manager separators", () => {
    expect(parseMarketingClawNpmPrepublishVerifyArgs(["--help"])).toEqual({
      dependencyTarballPaths: [],
      help: true,
      tarballPath: "",
    });
    expect(parseMarketingClawNpmPrepublishVerifyArgs(["marketingclaw.tgz"])).toEqual({
      dependencyTarballPaths: [],
      help: false,
      tarballPath: "marketingclaw.tgz",
    });
    expect(
      parseMarketingClawNpmPrepublishVerifyArgs(["--", "marketingclaw.tgz", "2026.3.23"]),
    ).toEqual({
      dependencyTarballPaths: [],
      expectedVersion: "2026.3.23",
      help: false,
      tarballPath: "marketingclaw.tgz",
    });
  });

  it("rejects missing, option-like, and extra arguments before installing", () => {
    expect(() => parseMarketingClawNpmPrepublishVerifyArgs([])).toThrow(
      marketingClawNpmPrepublishVerifyUsage(),
    );
    expect(() => parseMarketingClawNpmPrepublishVerifyArgs(["--tag"])).toThrow(
      "Unknown marketingclaw npm prepublish verifier option: --tag",
    );
    expect(() => parseMarketingClawNpmPrepublishVerifyArgs(["marketingclaw.tgz", "--tag"])).toThrow(
      "Unknown marketingclaw npm prepublish verifier option: --tag",
    );
    expect(
      parseMarketingClawNpmPrepublishVerifyArgs([
        "marketingclaw.tgz",
        "2026.3.23",
        "llm-core.tgz",
        "ai.tgz",
      ]),
    ).toEqual({
      dependencyTarballPaths: ["llm-core.tgz", "ai.tgz"],
      expectedVersion: "2026.3.23",
      help: false,
      tarballPath: "marketingclaw.tgz",
    });
    expect(() =>
      parseMarketingClawNpmPrepublishVerifyArgs(["marketingclaw.tgz", "2026.3.23", "--bad"]),
    ).toThrow("Invalid dependency tarball path: --bad");
  });
});

describe("usesPreparedLocalDependencyInstall", () => {
  it("uses the prepared local project only for the single AI tarball release path", () => {
    expect(usesPreparedLocalDependencyInstall(0)).toBe(false);
    expect(usesPreparedLocalDependencyInstall(1)).toBe(true);
    expect(usesPreparedLocalDependencyInstall(2)).toBe(false);
  });
});
