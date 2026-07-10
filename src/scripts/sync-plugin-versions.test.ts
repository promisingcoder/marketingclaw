// Plugin version sync tests cover script updates to plugin package versions.
import fs from "node:fs";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { syncPluginVersions } from "../../scripts/sync-plugin-versions.js";
import { cleanupTempDirs, makeTempDir } from "../../test/helpers/temp-dir.js";

const tempDirs: string[] = [];

function writeJson(filePath: string, value: unknown) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

describe("syncPluginVersions", () => {
  afterEach(() => {
    cleanupTempDirs(tempDirs);
  });

  it("preserves workspace marketingclaw devDependencies and plugin host floors", () => {
    const rootDir = makeTempDir(tempDirs, "marketingclaw-sync-plugin-versions-");

    writeJson(path.join(rootDir, "package.json"), {
      name: "marketingclaw",
      version: "2026.4.1",
    });
    writeJson(path.join(rootDir, "packages/ai/package.json"), {
      name: "@marketingclaw/ai",
      version: "2026.3.30",
    });
    writeJson(path.join(rootDir, "packages/llm-core/package.json"), {
      name: "@marketingclaw/llm-core",
      version: "0.0.0-private",
      private: true,
    });
    writeJson(path.join(rootDir, "extensions/imessage/package.json"), {
      name: "@marketingclaw/imessage",
      version: "2026.3.30",
      devDependencies: {
        marketingclaw: "workspace:*",
      },
      peerDependencies: {
        marketingclaw: ">=2026.3.30",
      },
      marketingclaw: {
        install: {
          minHostVersion: ">=2026.3.30",
        },
        compat: {
          pluginApi: ">=2026.3.30",
        },
        build: {
          marketingclawVersion: "2026.3.30",
        },
      },
    });

    const summary = syncPluginVersions(rootDir);
    const updatedPackage = JSON.parse(
      fs.readFileSync(path.join(rootDir, "extensions/imessage/package.json"), "utf8"),
    ) as {
      version?: string;
      devDependencies?: Record<string, string>;
      peerDependencies?: Record<string, string>;
      marketingclaw?: {
        install?: {
          minHostVersion?: string;
        };
        compat?: {
          pluginApi?: string;
        };
        build?: {
          marketingclawVersion?: string;
        };
      };
    };

    expect(summary.updated).toContain("@marketingclaw/imessage");
    expect(summary.updated).toContain("@marketingclaw/ai");
    expect(summary.updated).not.toContain("@marketingclaw/llm-core");
    expect(
      JSON.parse(fs.readFileSync(path.join(rootDir, "packages/ai/package.json"), "utf8")),
    ).toMatchObject({ version: "2026.4.1" });
    expect(
      JSON.parse(fs.readFileSync(path.join(rootDir, "packages/llm-core/package.json"), "utf8")),
    ).toMatchObject({ private: true, version: "0.0.0-private" });
    expect(updatedPackage.version).toBe("2026.4.1");
    expect(updatedPackage.devDependencies?.marketingclaw).toBe("workspace:*");
    expect(updatedPackage.peerDependencies?.marketingclaw).toBe(">=2026.4.1");
    expect(updatedPackage.marketingclaw?.install?.minHostVersion).toBe(">=2026.3.30");
    expect(updatedPackage.marketingclaw?.compat?.pluginApi).toBe(">=2026.4.1");
    expect(updatedPackage.marketingclaw?.build?.marketingclawVersion).toBe("2026.4.1");
  });

  it("reports pending version sync without writing in check mode", () => {
    const rootDir = makeTempDir(tempDirs, "marketingclaw-sync-plugin-versions-check-");

    writeJson(path.join(rootDir, "package.json"), {
      name: "marketingclaw",
      version: "2026.4.2",
    });
    writeJson(path.join(rootDir, "extensions/discord/package.json"), {
      name: "@marketingclaw/discord",
      version: "2026.4.1",
      peerDependencies: {
        marketingclaw: ">=2026.4.1",
      },
      marketingclaw: {
        compat: {
          pluginApi: ">=2026.4.1",
        },
      },
    });

    const summary = syncPluginVersions(rootDir, { write: false });
    const unchangedPackage = JSON.parse(
      fs.readFileSync(path.join(rootDir, "extensions/discord/package.json"), "utf8"),
    ) as {
      version?: string;
      peerDependencies?: Record<string, string>;
      marketingclaw?: {
        compat?: {
          pluginApi?: string;
        };
      };
    };

    expect(summary.updated).toEqual(["@marketingclaw/discord"]);
    expect(unchangedPackage.version).toBe("2026.4.1");
    expect(unchangedPackage.peerDependencies?.marketingclaw).toBe(">=2026.4.1");
    expect(unchangedPackage.marketingclaw?.compat?.pluginApi).toBe(">=2026.4.1");
  });

  it("uses the base release version for beta changelog entries", () => {
    const rootDir = makeTempDir(tempDirs, "marketingclaw-sync-plugin-versions-beta-changelog-");

    writeJson(path.join(rootDir, "package.json"), {
      name: "marketingclaw",
      version: "2026.5.3-beta.1",
    });
    writeJson(path.join(rootDir, "extensions/matrix/package.json"), {
      name: "@marketingclaw/matrix",
      version: "2026.5.3-beta.1",
    });
    fs.mkdirSync(path.join(rootDir, "extensions/matrix"), { recursive: true });
    fs.writeFileSync(
      path.join(rootDir, "extensions/matrix/CHANGELOG.md"),
      "# Changelog\n\n## 2026.5.2\n\n### Changes\n\n- Previous release.\n",
      "utf8",
    );

    const summary = syncPluginVersions(rootDir);
    const changelog = fs.readFileSync(path.join(rootDir, "extensions/matrix/CHANGELOG.md"), "utf8");

    expect(summary.changelogged).toEqual(["@marketingclaw/matrix"]);
    expect(changelog).toContain("## 2026.5.3\n\n### Changes\n- Version alignment");
    expect(changelog).not.toContain("## 2026.5.3-beta.1");

    const checkSummary = syncPluginVersions(rootDir, { write: false });

    expect(checkSummary.changelogged).toStrictEqual([]);
  });
});
