// Command registration policy tests cover CLI registration boundaries and duplicate guards.
import { describe, expect, it } from "vitest";
import {
  shouldEagerRegisterSubcommands,
  shouldRegisterPrimaryCommandOnly,
  shouldRegisterPrimarySubcommandOnly,
  shouldSkipPluginCommandRegistration,
} from "./command-registration-policy.js";

describe("command-registration-policy", () => {
  it("matches primary command registration policy", () => {
    expect(shouldRegisterPrimaryCommandOnly(["node", "marketingclaw", "status"])).toBe(true);
    expect(shouldRegisterPrimaryCommandOnly(["node", "marketingclaw", "status", "--help"])).toBe(
      true,
    );
    expect(shouldRegisterPrimaryCommandOnly(["node", "marketingclaw", "-V"])).toBe(false);
    expect(shouldRegisterPrimaryCommandOnly(["node", "marketingclaw", "acp", "-v"])).toBe(true);
  });

  it("matches plugin registration skip policy", () => {
    expect(
      shouldSkipPluginCommandRegistration({
        argv: ["node", "marketingclaw", "--help"],
        primary: null,
        hasBuiltinPrimary: false,
      }),
    ).toBe(true);
    expect(
      shouldSkipPluginCommandRegistration({
        argv: ["node", "marketingclaw", "config", "--help"],
        primary: "config",
        hasBuiltinPrimary: true,
      }),
    ).toBe(true);
    expect(
      shouldSkipPluginCommandRegistration({
        argv: ["node", "marketingclaw", "voicecall", "--help"],
        primary: "voicecall",
        hasBuiltinPrimary: false,
      }),
    ).toBe(false);
    expect(
      shouldSkipPluginCommandRegistration({
        argv: ["node", "marketingclaw", "help", "--help"],
        primary: "help",
        hasBuiltinPrimary: false,
      }),
    ).toBe(true);
    expect(
      shouldSkipPluginCommandRegistration({
        argv: ["node", "marketingclaw", "help", "voicecall"],
        primary: "help",
        hasBuiltinPrimary: false,
      }),
    ).toBe(false);
    expect(
      shouldSkipPluginCommandRegistration({
        argv: ["node", "marketingclaw", "auth", "login"],
        primary: "auth",
        hasBuiltinPrimary: false,
      }),
    ).toBe(true);
    expect(
      shouldSkipPluginCommandRegistration({
        argv: ["node", "marketingclaw", "tool", "image_generate"],
        primary: "tool",
        hasBuiltinPrimary: false,
      }),
    ).toBe(true);
    expect(
      shouldSkipPluginCommandRegistration({
        argv: ["node", "marketingclaw", "tools", "effective"],
        primary: "tools",
        hasBuiltinPrimary: false,
      }),
    ).toBe(true);
    expect(
      shouldSkipPluginCommandRegistration({
        argv: ["node", "marketingclaw", "googlemeet", "login"],
        primary: "googlemeet",
        hasBuiltinPrimary: false,
      }),
    ).toBe(false);
  });

  it("matches lazy subcommand registration policy", () => {
    expect(shouldEagerRegisterSubcommands({ MARKETINGCLAW_DISABLE_LAZY_SUBCOMMANDS: "1" })).toBe(
      true,
    );
    expect(shouldEagerRegisterSubcommands({ MARKETINGCLAW_DISABLE_LAZY_SUBCOMMANDS: "0" })).toBe(
      false,
    );
    expect(shouldRegisterPrimarySubcommandOnly(["node", "marketingclaw", "acp"], {})).toBe(true);
    expect(
      shouldRegisterPrimarySubcommandOnly(["node", "marketingclaw", "acp", "--help"], {}),
    ).toBe(true);
    expect(
      shouldRegisterPrimarySubcommandOnly(["node", "marketingclaw", "acp"], {
        MARKETINGCLAW_DISABLE_LAZY_SUBCOMMANDS: "1",
      }),
    ).toBe(false);
  });
});
