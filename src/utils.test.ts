// Tests shared utility helpers used by CLI and runtime modules.
import fs from "node:fs";
import path from "node:path";
import { describe, expect, it, vi } from "vitest";
import { MAX_TIMER_TIMEOUT_MS } from "./shared/number-coercion.js";
import { withTempDir } from "./test-helpers/temp-dir.js";
import { withEnv } from "./test-utils/env.js";
import {
  CONFIG_DIR,
  ensureDir,
  normalizeE164,
  pinConfigDir,
  resolveConfigDir,
  resolveHomeDir,
  resolveUserPath,
  shortenHomeInString,
  shortenHomePath,
  sleep,
} from "./utils.js";

describe("ensureDir", () => {
  it("creates nested directory", async () => {
    await withTempDir({ prefix: "marketingclaw-test-" }, async (tmp) => {
      const target = path.join(tmp, "nested", "dir");
      await ensureDir(target);
      expect(fs.existsSync(target)).toBe(true);
    });
  });
});

describe("sleep", () => {
  it("resolves after delay using fake timers", async () => {
    vi.useFakeTimers();
    try {
      const promise = sleep(1000);
      vi.advanceTimersByTime(1000);
      await expect(promise).resolves.toBeUndefined();
    } finally {
      vi.useRealTimers();
    }
  });

  it("clamps oversized sleep delays before scheduling", async () => {
    vi.useFakeTimers();
    const setTimeoutSpy = vi.spyOn(globalThis, "setTimeout");
    try {
      const promise = sleep(Number.MAX_SAFE_INTEGER);

      expect(setTimeoutSpy).toHaveBeenCalledWith(expect.any(Function), MAX_TIMER_TIMEOUT_MS);

      vi.advanceTimersByTime(MAX_TIMER_TIMEOUT_MS);
      await expect(promise).resolves.toBeUndefined();
    } finally {
      setTimeoutSpy.mockRestore();
      vi.useRealTimers();
    }
  });
});

describe("normalizeE164", () => {
  it.each([
    ["+1234567890", "+1234567890"],
    ["++1234567890", "+1234567890"],
    ["1+234+567", "+1234567"],
    ["whatsapp:+1 (234) 567-8900", "+12345678900"],
    ["signal: 1 234 567", "+1234567"],
    ["not a phone number", ""],
  ])("normalizes %s", (input, expected) => {
    expect(normalizeE164(input)).toBe(expected);
  });
});

describe("resolveConfigDir", () => {
  it("prefers ~/.marketingclaw when legacy dir is missing", async () => {
    await withTempDir({ prefix: "marketingclaw-config-dir-" }, async (root) => {
      const newDir = path.join(root, ".marketingclaw");
      await fs.promises.mkdir(newDir, { recursive: true });
      const resolved = resolveConfigDir({} as NodeJS.ProcessEnv, () => root);
      expect(resolved).toBe(newDir);
    });
  });

  it("expands MARKETINGCLAW_STATE_DIR using the provided env", () => {
    const env = {
      HOME: "/tmp/marketingclaw-home",
      MARKETINGCLAW_STATE_DIR: "~/state",
    } as NodeJS.ProcessEnv;

    expect(resolveConfigDir(env)).toBe(path.resolve("/tmp/marketingclaw-home", "state"));
  });

  it("falls back to the config file directory when only MARKETINGCLAW_CONFIG_PATH is set", () => {
    const env = {
      HOME: "/tmp/marketingclaw-home",
      MARKETINGCLAW_CONFIG_PATH: "~/profiles/dev/marketingclaw.json",
    } as NodeJS.ProcessEnv;

    expect(resolveConfigDir(env)).toBe(path.resolve("/tmp/marketingclaw-home", "profiles", "dev"));
  });

  it("re-pins the exported configuration root after startup environment selection", () => {
    const originalConfigDir = CONFIG_DIR;
    const selectedConfigDir = path.resolve("/tmp/marketingclaw-selected-config-root");
    try {
      expect(
        pinConfigDir({
          MARKETINGCLAW_STATE_DIR: selectedConfigDir,
          MARKETINGCLAW_TEST_FAST: "1",
        }),
      ).toBe(selectedConfigDir);
      expect(CONFIG_DIR).toBe(selectedConfigDir);
    } finally {
      pinConfigDir({
        MARKETINGCLAW_STATE_DIR: originalConfigDir,
        MARKETINGCLAW_TEST_FAST: "1",
      });
    }
  });
});

describe("resolveHomeDir", () => {
  it("prefers MARKETINGCLAW_HOME over HOME", () => {
    withEnv({ MARKETINGCLAW_HOME: "/srv/marketingclaw-home", HOME: "/home/other" }, () => {
      expect(resolveHomeDir()).toBe(path.resolve("/srv/marketingclaw-home"));
    });
  });
});

describe("shortenHomePath", () => {
  it("uses $MARKETINGCLAW_HOME prefix when MARKETINGCLAW_HOME is set", () => {
    withEnv({ MARKETINGCLAW_HOME: "/srv/marketingclaw-home", HOME: "/home/other" }, () => {
      expect(
        shortenHomePath(
          `${path.resolve("/srv/marketingclaw-home")}/.marketingclaw/marketingclaw.json`,
        ),
      ).toBe("$MARKETINGCLAW_HOME/.marketingclaw/marketingclaw.json");
    });
  });
});

describe("shortenHomeInString", () => {
  it("uses $MARKETINGCLAW_HOME replacement when MARKETINGCLAW_HOME is set", () => {
    withEnv({ MARKETINGCLAW_HOME: "/srv/marketingclaw-home", HOME: "/home/other" }, () => {
      expect(
        shortenHomeInString(
          `config: ${path.resolve("/srv/marketingclaw-home")}/.marketingclaw/marketingclaw.json`,
        ),
      ).toBe("config: $MARKETINGCLAW_HOME/.marketingclaw/marketingclaw.json");
    });
  });
});

describe("resolveUserPath", () => {
  it("expands ~ to home dir", () => {
    expect(resolveUserPath("~", {}, () => "/Users/thoffman")).toBe(path.resolve("/Users/thoffman"));
  });

  it("expands ~/ to home dir", () => {
    expect(resolveUserPath("~/marketingclaw", {}, () => "/Users/thoffman")).toBe(
      path.resolve("/Users/thoffman", "marketingclaw"),
    );
  });

  it("resolves relative paths", () => {
    expect(resolveUserPath("tmp/dir")).toBe(path.resolve("tmp/dir"));
  });

  it("prefers MARKETINGCLAW_HOME for tilde expansion", () => {
    withEnv({ MARKETINGCLAW_HOME: "/srv/marketingclaw-home", HOME: "/home/other" }, () => {
      expect(resolveUserPath("~/marketingclaw")).toBe(
        path.resolve("/srv/marketingclaw-home", "marketingclaw"),
      );
    });
  });

  it("uses the provided env for tilde expansion", () => {
    const env = {
      HOME: "/tmp/marketingclaw-home",
      MARKETINGCLAW_HOME: "/srv/marketingclaw-home",
    } as NodeJS.ProcessEnv;

    expect(resolveUserPath("~/marketingclaw", env)).toBe(
      path.resolve("/srv/marketingclaw-home", "marketingclaw"),
    );
  });

  it("keeps blank paths blank", () => {
    expect(resolveUserPath("")).toBe("");
    expect(resolveUserPath("   ")).toBe("");
  });

  it("returns empty string for undefined/null input", () => {
    expect(resolveUserPath(undefined as unknown as string)).toBe("");
    expect(resolveUserPath(null as unknown as string)).toBe("");
  });
});
