// Logger browser import tests cover safe import behavior in browser-like runtimes.
import { importFreshModule } from "marketingclaw/plugin-sdk/test-fixtures";
import { afterEach, describe, expect, it, vi } from "vitest";

type LoggerModule = typeof import("./logger.js");

const originalGetBuiltinModule = (
  process as NodeJS.Process & { getBuiltinModule?: (id: string) => unknown }
).getBuiltinModule;

async function importBrowserSafeLogger(params?: {
  resolvePreferredMarketingClawTmpDir?: ReturnType<typeof vi.fn>;
}): Promise<{
  module: LoggerModule;
  resolvePreferredMarketingClawTmpDir: ReturnType<typeof vi.fn>;
}> {
  const resolvePreferredMarketingClawTmpDir =
    params?.resolvePreferredMarketingClawTmpDir ??
    vi.fn(() => {
      throw new Error(
        "resolvePreferredMarketingClawTmpDir should not run during browser-safe import",
      );
    });

  vi.doMock("../infra/tmp-marketingclaw-dir.js", async () => {
    const actual = await vi.importActual<typeof import("../infra/tmp-marketingclaw-dir.js")>(
      "../infra/tmp-marketingclaw-dir.js",
    );
    return {
      ...actual,
      resolvePreferredMarketingClawTmpDir,
    };
  });

  Object.defineProperty(process, "getBuiltinModule", {
    configurable: true,
    value: undefined,
  });

  const module = await importFreshModule<LoggerModule>(
    import.meta.url,
    "./logger.js?scope=browser-safe",
  );
  return { module, resolvePreferredMarketingClawTmpDir };
}

describe("logging/logger browser-safe import", () => {
  afterEach(() => {
    vi.doUnmock("../infra/tmp-marketingclaw-dir.js");
    Object.defineProperty(process, "getBuiltinModule", {
      configurable: true,
      value: originalGetBuiltinModule,
    });
  });

  it("does not resolve the preferred temp dir at import time when node fs is unavailable", async () => {
    const { module, resolvePreferredMarketingClawTmpDir } = await importBrowserSafeLogger();

    expect(resolvePreferredMarketingClawTmpDir).not.toHaveBeenCalled();
    expect(module.DEFAULT_LOG_DIR).toBe("/tmp/marketingclaw");
    expect(module.DEFAULT_LOG_FILE).toBe("/tmp/marketingclaw/marketingclaw.log");
  });

  it("disables file logging when imported in a browser-like environment", async () => {
    const { module, resolvePreferredMarketingClawTmpDir } = await importBrowserSafeLogger();

    expect(module.getResolvedLoggerSettings()).toStrictEqual({
      level: "silent",
      file: "/tmp/marketingclaw/marketingclaw.log",
      maxFileBytes: 100 * 1024 * 1024,
    });
    expect(module.isFileLogLevelEnabled("info")).toBe(false);
    expect(module.getLogger().info("browser-safe")).toBeUndefined();
    expect(resolvePreferredMarketingClawTmpDir).not.toHaveBeenCalled();
  });
});
