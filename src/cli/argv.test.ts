// Argv tests cover CLI argument parsing helpers and platform-specific normalization.
import { describe, expect, it } from "vitest";
import {
  buildParseArgv,
  getFlagValue,
  getCommandPositionalsWithRootOptions,
  getCommandPathWithRootOptions,
  getPrimaryCommand,
  getPositiveIntFlagValue,
  getVerboseFlag,
  hasHelpOrVersion,
  hasFlag,
  isHelpOrVersionInvocation,
  isRootHelpInvocation,
  isRootVersionInvocation,
  normalizeGeneratedHelpCommandArgv,
  normalizeRootHelpTargetArgv,
  normalizeRootLogLevelArgv,
  normalizeRootNoColorArgv,
  shouldMigrateStateFromPath,
} from "./argv.js";

describe("argv helpers", () => {
  it.each([
    {
      name: "help flag",
      argv: ["node", "marketingclaw", "--help"],
      expected: true,
    },
    {
      name: "version flag",
      argv: ["node", "marketingclaw", "-V"],
      expected: true,
    },
    {
      name: "normal command",
      argv: ["node", "marketingclaw", "status"],
      expected: false,
    },
    {
      name: "root -v alias",
      argv: ["node", "marketingclaw", "-v"],
      expected: true,
    },
    {
      name: "root -v alias with profile",
      argv: ["node", "marketingclaw", "--profile", "work", "-v"],
      expected: true,
    },
    {
      name: "root -v alias with log-level",
      argv: ["node", "marketingclaw", "--log-level", "debug", "-v"],
      expected: true,
    },
    {
      name: "subcommand -v should not be treated as version",
      argv: ["node", "marketingclaw", "acp", "-v"],
      expected: false,
    },
    {
      name: "root -v alias with equals profile",
      argv: ["node", "marketingclaw", "--profile=work", "-v"],
      expected: true,
    },
    {
      name: "subcommand path after global root flags should not be treated as version",
      argv: ["node", "marketingclaw", "--dev", "skills", "list", "-v"],
      expected: false,
    },
  ])("detects help/version flags: $name", ({ argv, expected }) => {
    expect(hasHelpOrVersion(argv)).toBe(expected);
  });

  it.each([
    {
      name: "known command group help command help flag",
      argv: ["node", "marketingclaw", "backup", "help", "--help"],
      expected: ["node", "marketingclaw", "backup", "help"],
    },
    {
      name: "known command group help command short help flag",
      argv: ["node", "marketingclaw", "--profile", "work", "backup", "help", "-h"],
      expected: ["node", "marketingclaw", "--profile", "work", "backup", "help"],
    },
    {
      name: "leaf positional help remains untouched",
      argv: ["node", "marketingclaw", "docs", "help", "--help"],
      expected: ["node", "marketingclaw", "docs", "help", "--help"],
    },
    {
      name: "known command group help target",
      argv: ["node", "marketingclaw", "plugins", "help", "list"],
      expected: ["node", "marketingclaw", "plugins", "list", "--help"],
    },
    {
      name: "known command group help target help flag",
      argv: ["node", "marketingclaw", "plugins", "help", "list", "--help"],
      expected: ["node", "marketingclaw", "plugins", "list", "--help"],
    },
    {
      name: "unknown plugin command group help target",
      argv: ["node", "marketingclaw", "external-plugin", "help", "inspect"],
      expected: ["node", "marketingclaw", "external-plugin", "inspect", "--help"],
    },
    {
      name: "unknown plugin command group help target help flag",
      argv: ["node", "marketingclaw", "external-plugin", "help", "inspect", "--help"],
      expected: ["node", "marketingclaw", "external-plugin", "inspect", "--help"],
    },
    {
      name: "generated help target with trailing root option",
      argv: ["node", "marketingclaw", "memory", "help", "status", "--no-color"],
      expected: ["node", "marketingclaw", "--no-color", "memory", "status", "--help"],
    },
    {
      name: "extra help positionals remain untouched",
      argv: ["node", "marketingclaw", "backup", "help", "missing", "extra", "--help"],
      expected: ["node", "marketingclaw", "backup", "help", "missing", "extra", "--help"],
    },
    {
      name: "terminator help flag remains untouched",
      argv: ["node", "marketingclaw", "backup", "help", "--", "--help"],
      expected: ["node", "marketingclaw", "backup", "help", "--", "--help"],
    },
  ])("normalizes generated help commands: $name", ({ argv, expected }) => {
    expect(normalizeGeneratedHelpCommandArgv(argv)).toEqual(expected);
  });

  it.each([
    {
      name: "root help target",
      argv: ["node", "marketingclaw", "help", "plugins"],
      expected: ["node", "marketingclaw", "plugins", "--help"],
    },
    {
      name: "root help target with help flag",
      argv: ["node", "marketingclaw", "help", "plugins", "--help"],
      expected: ["node", "marketingclaw", "plugins", "--help"],
    },
    {
      name: "root option before help target",
      argv: ["node", "marketingclaw", "--profile", "work", "help", "memory"],
      expected: ["node", "marketingclaw", "--profile", "work", "memory", "--help"],
    },
    {
      name: "bare root help remains untouched",
      argv: ["node", "marketingclaw", "help"],
      expected: ["node", "marketingclaw", "help"],
    },
    {
      name: "root help self-help remains untouched",
      argv: ["node", "marketingclaw", "help", "--help"],
      expected: ["node", "marketingclaw", "help", "--help"],
    },
    {
      name: "nested root help target",
      argv: ["node", "marketingclaw", "help", "plugins", "list"],
      expected: ["node", "marketingclaw", "plugins", "list", "--help"],
    },
    {
      name: "nested root help target with help flag",
      argv: ["node", "marketingclaw", "help", "plugins", "list", "--help"],
      expected: ["node", "marketingclaw", "plugins", "list", "--help"],
    },
    {
      name: "nested root help target with trailing root option",
      argv: ["node", "marketingclaw", "help", "memory", "status", "--no-color"],
      expected: ["node", "marketingclaw", "--no-color", "memory", "status", "--help"],
    },
  ])("normalizes root help targets: $name", ({ argv, expected }) => {
    expect(normalizeRootHelpTargetArgv(argv)).toEqual(expected);
  });

  it.each([
    {
      name: "subcommand trailing no-color",
      argv: ["node", "marketingclaw", "doctor", "--no-color", "--post-upgrade", "--json"],
      expected: ["node", "marketingclaw", "--no-color", "doctor", "--post-upgrade", "--json"],
    },
    {
      name: "keeps existing root options first",
      argv: [
        "node",
        "marketingclaw",
        "--profile",
        "work",
        "doctor",
        "--no-color",
        "--lint",
        "--json",
      ],
      expected: [
        "node",
        "marketingclaw",
        "--profile",
        "work",
        "--no-color",
        "doctor",
        "--lint",
        "--json",
      ],
    },
    {
      name: "keeps no-color after possible command option value",
      argv: ["node", "marketingclaw", "doctor", "--lint", "--json", "--no-color"],
      expected: ["node", "marketingclaw", "doctor", "--lint", "--json", "--no-color"],
    },
    {
      name: "flag terminator leaves no-color positional",
      argv: ["node", "marketingclaw", "doctor", "--", "--no-color"],
      expected: ["node", "marketingclaw", "doctor", "--", "--no-color"],
    },
    {
      name: "command option value remains literal",
      argv: ["node", "marketingclaw", "agent", "--message", "--no-color"],
      expected: ["node", "marketingclaw", "agent", "--message", "--no-color"],
    },
    {
      name: "assigned command option value does not block no-color",
      argv: ["node", "marketingclaw", "agent", "--message=hello", "--no-color"],
      expected: ["node", "marketingclaw", "--no-color", "agent", "--message=hello"],
    },
  ])("normalizes root --no-color before command parsing: $name", ({ argv, expected }) => {
    expect(normalizeRootNoColorArgv(argv)).toEqual(expected);
  });

  it("allows final command metadata to lift no-color after boolean command flags", () => {
    const argv = ["node", "marketingclaw", "doctor", "--lint", "--json", "--no-color"];

    expect(
      normalizeRootNoColorArgv(argv, {
        shouldPreserveNoColor: ({ remainingArgs, noColorIndex }) =>
          remainingArgs[noColorIndex - 1] === "--message",
      }),
    ).toEqual(["node", "marketingclaw", "--no-color", "doctor", "--lint", "--json"]);
  });

  it.each([
    {
      name: "subcommand trailing log-level",
      argv: ["node", "marketingclaw", "doctor", "--log-level", "debug", "--json"],
      expected: ["node", "marketingclaw", "--log-level", "debug", "doctor", "--json"],
    },
    {
      name: "subcommand trailing log-level equals form",
      argv: ["node", "marketingclaw", "doctor", "--log-level=trace", "--json"],
      expected: ["node", "marketingclaw", "--log-level=trace", "doctor", "--json"],
    },
    {
      name: "keeps existing root options first",
      argv: ["node", "marketingclaw", "--profile", "work", "doctor", "--log-level", "debug"],
      expected: ["node", "marketingclaw", "--profile", "work", "--log-level", "debug", "doctor"],
    },
    {
      name: "keeps log-level after possible command option value",
      argv: ["node", "marketingclaw", "agent", "--message", "--log-level", "debug"],
      expected: ["node", "marketingclaw", "agent", "--message", "--log-level", "debug"],
    },
    {
      name: "flag terminator leaves log-level positional",
      argv: ["node", "marketingclaw", "nodes", "run", "--", "--log-level", "debug"],
      expected: ["node", "marketingclaw", "nodes", "run", "--", "--log-level", "debug"],
    },
    {
      name: "missing value remains command scoped",
      argv: ["node", "marketingclaw", "doctor", "--log-level", "--json"],
      expected: ["node", "marketingclaw", "doctor", "--log-level", "--json"],
    },
  ])("normalizes root --log-level before command parsing: $name", ({ argv, expected }) => {
    expect(normalizeRootLogLevelArgv(argv)).toEqual(expected);
  });

  it("allows final command metadata to lift log-level after boolean command flags", () => {
    const argv = ["node", "marketingclaw", "doctor", "--lint", "--json", "--log-level", "debug"];

    expect(
      normalizeRootLogLevelArgv(argv, {
        shouldPreserveLogLevel: ({ remainingArgs, logLevelIndex }) =>
          remainingArgs[logLevelIndex - 1] === "--message",
      }),
    ).toEqual(["node", "marketingclaw", "--log-level", "debug", "doctor", "--lint", "--json"]);
  });

  it("preserves log-level when final command metadata owns the option", () => {
    const argv = ["node", "marketingclaw", "plugin-cmd", "--log-level", "debug"];

    expect(
      normalizeRootLogLevelArgv(argv, {
        shouldPreserveLogLevel: ({ remainingArgs, logLevelIndex }) =>
          remainingArgs[logLevelIndex] === "--log-level",
      }),
    ).toEqual(argv);
  });

  it.each([
    {
      name: "root help command",
      argv: ["node", "marketingclaw", "help"],
      expected: true,
    },
    {
      name: "root help command with target",
      argv: ["node", "marketingclaw", "help", "matrix"],
      expected: true,
    },
    {
      name: "nested help command",
      argv: ["node", "marketingclaw", "matrix", "encryption", "help"],
      expected: true,
    },
    {
      name: "known subcommand root help command",
      argv: ["node", "marketingclaw", "config", "help"],
      expected: true,
    },
    {
      name: "known leaf command positional help",
      argv: ["node", "marketingclaw", "docs", "help"],
      expected: false,
    },
    {
      name: "known subcommand leaf positional help",
      argv: ["node", "marketingclaw", "config", "set", "some.path", "help"],
      expected: false,
    },
    {
      name: "unknown plugin command help",
      argv: ["node", "marketingclaw", "external-plugin", "tools", "help"],
      expected: true,
    },
    {
      name: "help flag",
      argv: ["node", "marketingclaw", "matrix", "encryption", "--help"],
      expected: true,
    },
    {
      name: "help as option value",
      argv: ["node", "marketingclaw", "agent", "--message", "help"],
      expected: false,
    },
    {
      name: "help after terminator",
      argv: ["node", "marketingclaw", "nodes", "invoke", "--", "help"],
      expected: false,
    },
    {
      name: "help flag after terminator",
      argv: ["node", "marketingclaw", "nodes", "invoke", "--", "--help"],
      expected: false,
    },
    {
      name: "version flag after terminator",
      argv: ["node", "marketingclaw", "nodes", "invoke", "--", "--version"],
      expected: false,
    },
  ])("detects help/version invocations: $name", ({ argv, expected }) => {
    expect(isHelpOrVersionInvocation(argv)).toBe(expected);
  });

  it.each([
    {
      name: "root --version",
      argv: ["node", "marketingclaw", "--version"],
      expected: true,
    },
    {
      name: "root -V",
      argv: ["node", "marketingclaw", "-V"],
      expected: true,
    },
    {
      name: "root -v alias with profile",
      argv: ["node", "marketingclaw", "--profile", "work", "-v"],
      expected: true,
    },
    {
      name: "subcommand version flag",
      argv: ["node", "marketingclaw", "status", "--version"],
      expected: false,
    },
    {
      name: "unknown root flag with version",
      argv: ["node", "marketingclaw", "--unknown", "--version"],
      expected: false,
    },
  ])("detects root-only version invocations: $name", ({ argv, expected }) => {
    expect(isRootVersionInvocation(argv)).toBe(expected);
  });

  it.each([
    {
      name: "root --help",
      argv: ["node", "marketingclaw", "--help"],
      expected: true,
    },
    {
      name: "root -h",
      argv: ["node", "marketingclaw", "-h"],
      expected: true,
    },
    {
      name: "root --help with profile",
      argv: ["node", "marketingclaw", "--profile", "work", "--help"],
      expected: true,
    },
    {
      name: "subcommand --help",
      argv: ["node", "marketingclaw", "status", "--help"],
      expected: false,
    },
    {
      name: "help before subcommand token",
      argv: ["node", "marketingclaw", "--help", "status"],
      expected: false,
    },
    {
      name: "help after -- terminator",
      argv: ["node", "marketingclaw", "nodes", "invoke", "--", "device.status", "--help"],
      expected: false,
    },
    {
      name: "unknown root flag before help",
      argv: ["node", "marketingclaw", "--unknown", "--help"],
      expected: false,
    },
    {
      name: "unknown root flag after help",
      argv: ["node", "marketingclaw", "--help", "--unknown"],
      expected: false,
    },
  ])("detects root-only help invocations: $name", ({ argv, expected }) => {
    expect(isRootHelpInvocation(argv)).toBe(expected);
  });

  it.each([
    {
      name: "single command with trailing flag",
      argv: ["node", "marketingclaw", "status", "--json"],
      expected: ["status"],
    },
    {
      name: "two-part command",
      argv: ["node", "marketingclaw", "agents", "list"],
      expected: ["agents", "list"],
    },
    {
      name: "terminator cuts parsing",
      argv: ["node", "marketingclaw", "status", "--", "ignored"],
      expected: ["status"],
    },
  ])("extracts command path: $name", ({ argv, expected }) => {
    expect(getCommandPathWithRootOptions(argv, 2)).toEqual(expected);
  });

  it("extracts command path while skipping known root option values", () => {
    expect(
      getCommandPathWithRootOptions(
        [
          "node",
          "marketingclaw",
          "--profile",
          "work",
          "--container",
          "demo",
          "--no-color",
          "config",
          "validate",
        ],
        2,
      ),
    ).toEqual(["config", "validate"]);
  });

  it("extracts routed config get positionals with interleaved root options", () => {
    expect(
      getCommandPositionalsWithRootOptions(
        [
          "node",
          "marketingclaw",
          "config",
          "get",
          "--log-level",
          "debug",
          "update.channel",
          "--json",
        ],
        {
          commandPath: ["config", "get"],
          booleanFlags: ["--json"],
        },
      ),
    ).toEqual(["update.channel"]);
  });

  it("extracts routed config unset positionals with interleaved root options", () => {
    expect(
      getCommandPositionalsWithRootOptions(
        ["node", "marketingclaw", "config", "unset", "--profile", "work", "update.channel"],
        {
          commandPath: ["config", "unset"],
        },
      ),
    ).toEqual(["update.channel"]);
  });

  it("returns null when routed command sees unknown options", () => {
    expect(
      getCommandPositionalsWithRootOptions(
        ["node", "marketingclaw", "config", "get", "--mystery", "value", "update.channel"],
        {
          commandPath: ["config", "get"],
          booleanFlags: ["--json"],
        },
      ),
    ).toBeNull();
  });

  it.each([
    {
      name: "returns first command token",
      argv: ["node", "marketingclaw", "agents", "list"],
      expected: "agents",
    },
    {
      name: "returns null when no command exists",
      argv: ["node", "marketingclaw"],
      expected: null,
    },
    {
      name: "skips known root option values",
      argv: ["node", "marketingclaw", "--log-level", "debug", "status"],
      expected: "status",
    },
  ])("returns primary command: $name", ({ argv, expected }) => {
    expect(getPrimaryCommand(argv)).toBe(expected);
  });

  it.each([
    {
      name: "detects flag before terminator",
      argv: ["node", "marketingclaw", "status", "--json"],
      flag: "--json",
      expected: true,
    },
    {
      name: "ignores flag after terminator",
      argv: ["node", "marketingclaw", "--", "--json"],
      flag: "--json",
      expected: false,
    },
  ])("parses boolean flags: $name", ({ argv, flag, expected }) => {
    expect(hasFlag(argv, flag)).toBe(expected);
  });

  it.each([
    {
      name: "value in next token",
      argv: ["node", "marketingclaw", "status", "--timeout", "5000"],
      expected: "5000",
    },
    {
      name: "value in equals form",
      argv: ["node", "marketingclaw", "status", "--timeout=2500"],
      expected: "2500",
    },
    {
      name: "missing value",
      argv: ["node", "marketingclaw", "status", "--timeout"],
      expected: null,
    },
    {
      name: "next token is another flag",
      argv: ["node", "marketingclaw", "status", "--timeout", "--json"],
      expected: null,
    },
    {
      name: "flag appears after terminator",
      argv: ["node", "marketingclaw", "--", "--timeout=99"],
      expected: undefined,
    },
    {
      name: "repeated flag uses final value",
      argv: ["node", "marketingclaw", "status", "--timeout", "100", "--timeout=200"],
      expected: "200",
    },
    {
      name: "missing repeated value remains invalid",
      argv: ["node", "marketingclaw", "status", "--timeout", "--timeout", "200"],
      expected: null,
    },
  ])("extracts flag values: $name", ({ argv, expected }) => {
    expect(getFlagValue(argv, "--timeout")).toBe(expected);
  });

  it("parses verbose flags", () => {
    expect(getVerboseFlag(["node", "marketingclaw", "status", "--verbose"])).toBe(true);
    expect(getVerboseFlag(["node", "marketingclaw", "status", "--debug"])).toBe(false);
    expect(
      getVerboseFlag(["node", "marketingclaw", "status", "--debug"], { includeDebug: true }),
    ).toBe(true);
  });

  it.each([
    {
      name: "missing flag",
      argv: ["node", "marketingclaw", "status"],
      expected: undefined,
    },
    {
      name: "missing value",
      argv: ["node", "marketingclaw", "status", "--timeout"],
      expected: null,
    },
    {
      name: "valid positive integer",
      argv: ["node", "marketingclaw", "status", "--timeout", "5000"],
      expected: 5000,
    },
    {
      name: "valid signed decimal positive integer",
      argv: ["node", "marketingclaw", "status", "--timeout", "+5000"],
      expected: 5000,
    },
    {
      name: "invalid integer",
      argv: ["node", "marketingclaw", "status", "--timeout", "nope"],
      expected: null,
    },
    {
      name: "non-decimal integer",
      argv: ["node", "marketingclaw", "status", "--timeout", "0x10"],
      expected: null,
    },
    {
      name: "partial integer",
      argv: ["node", "marketingclaw", "status", "--timeout", "5s"],
      expected: null,
    },
    {
      name: "zero",
      argv: ["node", "marketingclaw", "status", "--timeout", "0"],
      expected: null,
    },
    {
      name: "negative integer",
      argv: ["node", "marketingclaw", "status", "--timeout", "-5"],
      expected: null,
    },
    {
      name: "repeated value uses final valid integer",
      argv: ["node", "marketingclaw", "status", "--timeout", "nope", "--timeout", "5000"],
      expected: 5000,
    },
    {
      name: "repeated value rejects final invalid integer",
      argv: ["node", "marketingclaw", "status", "--timeout", "5000", "--timeout", "nope"],
      expected: null,
    },
  ])("parses positive integer flag values: $name", ({ argv, expected }) => {
    expect(getPositiveIntFlagValue(argv, "--timeout")).toBe(expected);
  });

  it.each([
    {
      name: "keeps plain node argv",
      rawArgs: ["node", "marketingclaw", "status"],
      expected: ["node", "marketingclaw", "status"],
    },
    {
      name: "keeps version-suffixed node binary",
      rawArgs: ["node-22", "marketingclaw", "status"],
      expected: ["node-22", "marketingclaw", "status"],
    },
    {
      name: "keeps windows versioned node exe",
      rawArgs: ["node-22.2.0.exe", "marketingclaw", "status"],
      expected: ["node-22.2.0.exe", "marketingclaw", "status"],
    },
    {
      name: "keeps dotted node binary",
      rawArgs: ["node-22.2", "marketingclaw", "status"],
      expected: ["node-22.2", "marketingclaw", "status"],
    },
    {
      name: "keeps dotted node exe",
      rawArgs: ["node-22.2.exe", "marketingclaw", "status"],
      expected: ["node-22.2.exe", "marketingclaw", "status"],
    },
    {
      name: "keeps absolute versioned node path",
      rawArgs: ["/usr/bin/node-22.2.0", "marketingclaw", "status"],
      expected: ["/usr/bin/node-22.2.0", "marketingclaw", "status"],
    },
    {
      name: "keeps node24 shorthand",
      rawArgs: ["node24", "marketingclaw", "status"],
      expected: ["node24", "marketingclaw", "status"],
    },
    {
      name: "keeps absolute node24 shorthand",
      rawArgs: ["/usr/bin/node24", "marketingclaw", "status"],
      expected: ["/usr/bin/node24", "marketingclaw", "status"],
    },
    {
      name: "keeps windows node24 exe",
      rawArgs: ["node24.exe", "marketingclaw", "status"],
      expected: ["node24.exe", "marketingclaw", "status"],
    },
    {
      name: "keeps nodejs binary",
      rawArgs: ["nodejs", "marketingclaw", "status"],
      expected: ["nodejs", "marketingclaw", "status"],
    },
    {
      name: "prefixes fallback when first arg is not a node launcher",
      rawArgs: ["node-dev", "marketingclaw", "status"],
      expected: ["node", "marketingclaw", "node-dev", "marketingclaw", "status"],
    },
    {
      name: "prefixes fallback when raw args start at program name",
      rawArgs: ["marketingclaw", "status"],
      expected: ["node", "marketingclaw", "status"],
    },
    {
      name: "keeps bun execution argv",
      rawArgs: ["bun", "src/entry.ts", "status"],
      expected: ["bun", "src/entry.ts", "status"],
    },
  ] as const)("builds parse argv from raw args: $name", ({ rawArgs, expected }) => {
    const parsed = buildParseArgv({
      programName: "marketingclaw",
      rawArgs: [...rawArgs],
    });
    expect(parsed).toEqual([...expected]);
  });

  it("builds parse argv from fallback args", () => {
    const fallbackArgv = buildParseArgv({
      programName: "marketingclaw",
      fallbackArgv: ["status"],
    });
    expect(fallbackArgv).toEqual(["node", "marketingclaw", "status"]);
  });

  it.each([
    { argv: ["node", "marketingclaw", "status"], expected: true },
    { argv: ["node", "marketingclaw", "health"], expected: false },
    { argv: ["node", "marketingclaw", "sessions"], expected: false },
    { argv: ["node", "marketingclaw", "--profile", "work", "status"], expected: true },
    { argv: ["node", "marketingclaw", "--log-level=debug", "models", "list"], expected: true },
    { argv: ["node", "marketingclaw", "config", "get", "update"], expected: false },
    { argv: ["node", "marketingclaw", "config", "unset", "update"], expected: false },
    { argv: ["node", "marketingclaw", "models", "list"], expected: true },
    { argv: ["node", "marketingclaw", "models", "status"], expected: true },
    { argv: ["node", "marketingclaw", "update", "status", "--json"], expected: false },
    { argv: ["node", "marketingclaw", "agent", "--message", "hi"], expected: true },
    { argv: ["node", "marketingclaw", "agents", "list"], expected: true },
    { argv: ["node", "marketingclaw", "message", "send"], expected: true },
  ] as const)("decides when to migrate state: $argv", ({ argv, expected }) => {
    const commandPath = getCommandPathWithRootOptions([...argv], 2);
    expect(shouldMigrateStateFromPath(commandPath)).toBe(expected);
  });

  it.each([
    { path: ["status"], expected: true },
    { path: ["update", "status"], expected: false },
    { path: ["config", "get"], expected: false },
    { path: ["agent"], expected: true },
    { path: ["models", "status"], expected: true },
    { path: ["agents", "list"], expected: true },
  ])("reuses command path for migrate state decisions: $path", ({ path, expected }) => {
    expect(shouldMigrateStateFromPath(path)).toBe(expected);
  });
});
