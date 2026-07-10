import fs from "node:fs/promises";
import path from "node:path";
import { afterEach, describe, expect, it, vi } from "vitest";
import { useAutoCleanupTempDirTracker } from "../../test/helpers/temp-dir.js";

const resolvePreferredMarketingClawTmpDirMock = vi.hoisted(() => vi.fn());

vi.mock("./tmp-marketingclaw-dir.js", async (importOriginal) => {
  const actual = await importOriginal<typeof import("./tmp-marketingclaw-dir.js")>();
  return {
    ...actual,
    resolvePreferredMarketingClawTmpDir: resolvePreferredMarketingClawTmpDirMock,
  };
});

import { withTempDir } from "./install-source-utils.js";

describe("withTempDir private root", () => {
  const tempDirs = useAutoCleanupTempDirTracker(afterEach);

  it.runIf(process.platform !== "win32")(
    "preserves parent temp root permissions when using private MarketingClaw temp root",
    async () => {
      const mockParentRoot = tempDirs.make("marketingclaw-chmod-test-");
      const mockMarketingClawDir = path.join(mockParentRoot, "marketingclaw");

      await fs.mkdir(mockMarketingClawDir, { recursive: true });
      await fs.chmod(mockParentRoot, 0o1777);
      const canonicalMarketingClawDir = await fs.realpath(mockMarketingClawDir);

      resolvePreferredMarketingClawTmpDirMock.mockReturnValue(mockMarketingClawDir);

      let observedDir = "";
      const value = await withTempDir("marketingclaw-test-", async (tmpDir) => {
        observedDir = tmpDir;
        expect(path.dirname(tmpDir)).toBe(canonicalMarketingClawDir);
        await fs.writeFile(path.join(tmpDir, "marker.txt"), "ok");
        return "done";
      });

      expect(value).toBe("done");

      await expect(
        fs.stat(observedDir).then(
          () => true,
          () => false,
        ),
      ).resolves.toBe(false);

      const privateRootStat = await fs.stat(mockMarketingClawDir);
      expect(privateRootStat.mode & 0o7777).toBe(0o700);

      const parentStat = await fs.stat(mockParentRoot);
      expect(parentStat.mode & 0o7777).toBe(0o1777);
    },
  );
});
