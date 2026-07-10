// Covers Nix integration config compatibility scenarios U3, U5, and U9.
import path from "node:path";
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  DEFAULT_GATEWAY_PORT,
  resolveConfigPathCandidate,
  resolveGatewayPort,
  resolveIsNixMode,
  resolveStateDir,
} from "./config.js";
import { withTempHome } from "./test-helpers.js";

vi.unmock("../version.js");

function envWith(overrides: Record<string, string | undefined>): NodeJS.ProcessEnv {
  // Hermetic env: don't inherit process.env because other tests may mutate it.
  return { ...overrides };
}

describe("Nix integration (U3, U5, U9)", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("U3: isNixMode env var detection", () => {
    it("isNixMode is false when MARKETINGCLAW_NIX_MODE is not set", () => {
      expect(resolveIsNixMode(envWith({ MARKETINGCLAW_NIX_MODE: undefined }))).toBe(false);
    });

    it("isNixMode is false when MARKETINGCLAW_NIX_MODE is empty", () => {
      expect(resolveIsNixMode(envWith({ MARKETINGCLAW_NIX_MODE: "" }))).toBe(false);
    });

    it("isNixMode is false when MARKETINGCLAW_NIX_MODE is not '1'", () => {
      expect(resolveIsNixMode(envWith({ MARKETINGCLAW_NIX_MODE: "true" }))).toBe(false);
    });

    it("isNixMode is true when MARKETINGCLAW_NIX_MODE=1", () => {
      expect(resolveIsNixMode(envWith({ MARKETINGCLAW_NIX_MODE: "1" }))).toBe(true);
    });
  });

  describe("U5: CONFIG_PATH and STATE_DIR env var overrides", () => {
    it("STATE_DIR defaults to ~/.marketingclaw when env not set", () => {
      expect(resolveStateDir(envWith({ MARKETINGCLAW_STATE_DIR: undefined }))).toMatch(
        /\.marketingclaw$/,
      );
    });

    it("STATE_DIR respects MARKETINGCLAW_STATE_DIR override", () => {
      expect(resolveStateDir(envWith({ MARKETINGCLAW_STATE_DIR: "/custom/state/dir" }))).toBe(
        path.resolve("/custom/state/dir"),
      );
    });

    it("STATE_DIR respects MARKETINGCLAW_HOME when state override is unset", () => {
      const customHome = path.join(path.sep, "custom", "home");
      expect(
        resolveStateDir(
          envWith({ MARKETINGCLAW_HOME: customHome, MARKETINGCLAW_STATE_DIR: undefined }),
        ),
      ).toBe(path.join(path.resolve(customHome), ".marketingclaw"));
    });

    it("CONFIG_PATH defaults to MARKETINGCLAW_HOME/.marketingclaw/marketingclaw.json", () => {
      const customHome = path.join(path.sep, "custom", "home");
      expect(
        resolveConfigPathCandidate(
          envWith({
            MARKETINGCLAW_HOME: customHome,
            MARKETINGCLAW_CONFIG_PATH: undefined,
            MARKETINGCLAW_STATE_DIR: undefined,
          }),
        ),
      ).toBe(path.join(path.resolve(customHome), ".marketingclaw", "marketingclaw.json"));
    });

    it("CONFIG_PATH defaults to ~/.marketingclaw/marketingclaw.json when env not set", () => {
      expect(
        resolveConfigPathCandidate(
          envWith({ MARKETINGCLAW_CONFIG_PATH: undefined, MARKETINGCLAW_STATE_DIR: undefined }),
        ),
      ).toMatch(/\.marketingclaw[\\/]marketingclaw\.json$/);
    });

    it("CONFIG_PATH respects MARKETINGCLAW_CONFIG_PATH override", () => {
      expect(
        resolveConfigPathCandidate(
          envWith({ MARKETINGCLAW_CONFIG_PATH: "/nix/store/abc/marketingclaw.json" }),
        ),
      ).toBe(path.resolve("/nix/store/abc/marketingclaw.json"));
    });

    it("CONFIG_PATH expands ~ in MARKETINGCLAW_CONFIG_PATH override", async () => {
      await withTempHome(async (home) => {
        expect(
          resolveConfigPathCandidate(
            envWith({
              MARKETINGCLAW_HOME: home,
              MARKETINGCLAW_CONFIG_PATH: "~/.marketingclaw/custom.json",
            }),
            () => home,
          ),
        ).toBe(path.join(home, ".marketingclaw", "custom.json"));
      });
    });

    it("CONFIG_PATH uses STATE_DIR when only state dir is overridden", () => {
      expect(
        resolveConfigPathCandidate(
          envWith({ MARKETINGCLAW_STATE_DIR: "/custom/state", MARKETINGCLAW_TEST_FAST: "1" }),
          () => path.join(path.sep, "tmp", "marketingclaw-config-home"),
        ),
      ).toBe(path.join(path.resolve("/custom/state"), "marketingclaw.json"));
    });
  });

  describe("U6: gateway port resolution", () => {
    it("uses default when env and config are unset", () => {
      expect(resolveGatewayPort({}, envWith({ MARKETINGCLAW_GATEWAY_PORT: undefined }))).toBe(
        DEFAULT_GATEWAY_PORT,
      );
    });

    it("prefers MARKETINGCLAW_GATEWAY_PORT over config", () => {
      expect(
        resolveGatewayPort(
          { gateway: { port: 19002 } },
          envWith({ MARKETINGCLAW_GATEWAY_PORT: "19001" }),
        ),
      ).toBe(19001);
    });

    it("falls back to config when env is invalid", () => {
      expect(
        resolveGatewayPort(
          { gateway: { port: 19003 } },
          envWith({ MARKETINGCLAW_GATEWAY_PORT: "nope" }),
        ),
      ).toBe(19003);
    });
  });
});
