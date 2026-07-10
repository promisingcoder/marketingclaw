// Marketingclaw Test State tests cover marketingclaw test state script behavior.
import { execFile } from "node:child_process";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";
import { describe, expect, it } from "vitest";

const execFileAsync = promisify(execFile);
const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const scriptPath = path.join(repoRoot, "scripts/lib/marketingclaw-test-state.mjs");
const onboardDockerScriptPath = path.join(repoRoot, "scripts/e2e/onboard-docker.sh");

function shellQuote(value: string): string {
  return `'${value.replace(/'/gu, `'\\''`)}'`;
}

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/gu, "\\$&");
}

function cleanupTestStateHomeTrap(): string {
  return [
    'cleanup_marketingclaw_test_state_home() { [ -z "${MARKETINGCLAW_TEST_STATE_HOME:-}" ] || rm -rf "$MARKETINGCLAW_TEST_STATE_HOME"; }',
    "trap cleanup_marketingclaw_test_state_home EXIT",
  ].join("; ");
}

const secretKeyPattern = /^[a-f0-9]{64}$/u;

describe("scripts/lib/marketingclaw-test-state", () => {
  it("creates a sourceable env file and JSON description", async () => {
    const tempRoot = await fs.mkdtemp(path.join(os.tmpdir(), "marketingclaw-test-state-script-"));
    const envFile = path.join(tempRoot, "env.sh");
    try {
      const { stdout } = await execFileAsync(process.execPath, [
        scriptPath,
        "--",
        "create",
        "--label",
        "script-test",
        "--scenario",
        "update-stable",
        "--env-file",
        envFile,
        "--json",
      ]);
      const payload = JSON.parse(stdout);
      expect(payload.label).toBe("script-test");
      expect(payload.scenario).toBe("update-stable");
      for (const field of ["root", "home", "stateDir", "configPath", "workspaceDir"] as const) {
        expect(typeof payload[field]).toBe("string");
        expect(payload[field].length).toBeGreaterThan(0);
      }
      expect(payload.home).toBe(path.join(payload.root, "home"));
      expect(payload.stateDir).toBe(path.join(payload.home, ".marketingclaw"));
      expect(payload.configPath).toBe(path.join(payload.stateDir, "marketingclaw.json"));
      expect(payload.workspaceDir).toBe(path.join(payload.home, "workspace"));
      expect(payload.env.MARKETINGCLAW_AUTH_PROFILE_SECRET_KEY).toMatch(secretKeyPattern);
      expect(payload.env).toEqual({
        HOME: payload.home,
        USERPROFILE: payload.home,
        MARKETINGCLAW_HOME: payload.home,
        MARKETINGCLAW_STATE_DIR: payload.stateDir,
        MARKETINGCLAW_CONFIG_PATH: payload.configPath,
        MARKETINGCLAW_AUTH_PROFILE_SECRET_KEY: payload.env.MARKETINGCLAW_AUTH_PROFILE_SECRET_KEY,
      });
      expect(payload.config).toEqual({
        update: {
          channel: "stable",
        },
        plugins: {},
      });

      const envFileText = await fs.readFile(envFile, "utf8");
      expect(envFileText).toContain("export HOME=");
      expect(envFileText).toContain("export MARKETINGCLAW_HOME=");
      expect(envFileText).toContain("export MARKETINGCLAW_STATE_DIR=");
      expect(envFileText).toContain("export MARKETINGCLAW_CONFIG_PATH=");
      expect(envFileText).toContain("export MARKETINGCLAW_AUTH_PROFILE_SECRET_KEY=");

      const probe = await execFileAsync("bash", [
        "-lc",
        `source ${shellQuote(envFile)}; node -e 'const fs=require("node:fs"); const config=JSON.parse(fs.readFileSync(process.env.MARKETINGCLAW_CONFIG_PATH,"utf8")); process.stdout.write(JSON.stringify({home:process.env.HOME,stateDir:process.env.MARKETINGCLAW_STATE_DIR,secretKey:process.env.MARKETINGCLAW_AUTH_PROFILE_SECRET_KEY,channel:config.update.channel}));'`,
      ]);
      expect(JSON.parse(probe.stdout)).toEqual({
        home: payload.home,
        stateDir: payload.stateDir,
        secretKey: payload.env.MARKETINGCLAW_AUTH_PROFILE_SECRET_KEY,
        channel: "stable",
      });
      await fs.rm(payload.root, { recursive: true, force: true });
    } finally {
      await fs.rm(tempRoot, { recursive: true, force: true });
    }
  });

  it("renders a Docker-friendly shell snippet", async () => {
    const tempRoot = await fs.mkdtemp(path.join(os.tmpdir(), "marketingclaw-test-state-shell-"));
    const snippetFile = path.join(tempRoot, "state.sh");
    try {
      const { stdout } = await execFileAsync(process.execPath, [
        scriptPath,
        "shell",
        "--label",
        "update-channel-switch",
        "--scenario",
        "update-stable",
      ]);
      expect(stdout).toContain(
        'MARKETINGCLAW_TEST_STATE_TMP_ROOT="${MARKETINGCLAW_TEST_STATE_TMPDIR:-${TMPDIR:-/tmp}}"',
      );
      expect(stdout).toContain(
        'mktemp -d "$MARKETINGCLAW_TEST_STATE_TMP_ROOT/marketingclaw-update-channel-switch-update-stable-home.XXXXXX"',
      );
      expect(stdout).toContain("MARKETINGCLAW_TEST_STATE_JSON");
      expect(stdout).toContain('"channel": "stable"');
      await fs.writeFile(snippetFile, stdout, "utf8");

      const probe = await execFileAsync("bash", [
        "-lc",
        `${cleanupTestStateHomeTrap()}; source ${shellQuote(snippetFile)}; node -e 'const fs=require("node:fs"); const config=JSON.parse(fs.readFileSync(process.env.MARKETINGCLAW_CONFIG_PATH,"utf8")); process.stdout.write(JSON.stringify({home:process.env.HOME,marketingclawHome:process.env.MARKETINGCLAW_HOME,workspace:process.env.MARKETINGCLAW_TEST_WORKSPACE_DIR,secretKey:process.env.MARKETINGCLAW_AUTH_PROFILE_SECRET_KEY,channel:config.update.channel}));'`,
      ]);

      const payload = JSON.parse(probe.stdout);
      expect(payload.home.startsWith(os.tmpdir())).toBe(true);
      expect(path.basename(payload.home)).toMatch(
        /^marketingclaw-update-channel-switch-update-stable-home\./u,
      );
      expect(payload.marketingclawHome).toBe(payload.home);
      expect(payload.workspace).toBe(`${payload.home}/workspace`);
      expect(payload.secretKey).toMatch(secretKeyPattern);
      expect(payload.channel).toBe("stable");

      const customTemp = path.join(tempRoot, "state-tmp");
      const customProbe = await execFileAsync("bash", [
        "-lc",
        `${cleanupTestStateHomeTrap()}; export MARKETINGCLAW_TEST_STATE_TMPDIR=${shellQuote(customTemp)}; source ${shellQuote(snippetFile)}; node -e 'process.stdout.write(JSON.stringify({home:process.env.HOME,tmpRoot:process.env.MARKETINGCLAW_TEST_STATE_TMP_ROOT}));'`,
      ]);
      const customPayload = JSON.parse(customProbe.stdout);
      expect(customPayload.tmpRoot).toBe(customTemp);
      expect(customPayload.home).toMatch(
        new RegExp(
          `^${escapeRegex(customTemp)}/marketingclaw-update-channel-switch-update-stable-home\\.`,
        ),
      );

      const trailingSlashProbe = await execFileAsync("bash", [
        "-lc",
        `${cleanupTestStateHomeTrap()}; export MARKETINGCLAW_TEST_STATE_TMPDIR=${shellQuote(`${customTemp}/`)}; source ${shellQuote(snippetFile)}; node -e 'process.stdout.write(JSON.stringify({home:process.env.HOME,tmpRoot:process.env.MARKETINGCLAW_TEST_STATE_TMP_ROOT,stateDir:process.env.MARKETINGCLAW_STATE_DIR}));'`,
      ]);
      const trailingSlashPayload = JSON.parse(trailingSlashProbe.stdout);
      expect(trailingSlashPayload.tmpRoot).toBe(customTemp);
      expect(trailingSlashPayload.home).toMatch(
        new RegExp(
          `^${escapeRegex(customTemp)}/marketingclaw-update-channel-switch-update-stable-home\\.`,
        ),
      );
      expect(trailingSlashPayload.stateDir).toBe(`${trailingSlashPayload.home}/.marketingclaw`);
    } finally {
      await fs.rm(tempRoot, { recursive: true, force: true });
    }
  });

  it("keeps shell key generation independent of node", async () => {
    const tempRoot = await fs.mkdtemp(
      path.join(os.tmpdir(), "marketingclaw-test-state-path-node-"),
    );
    const fakeBin = path.join(tempRoot, "bin");
    const snippetFile = path.join(tempRoot, "state.sh");
    const functionFile = path.join(tempRoot, "state-function.sh");
    try {
      await fs.mkdir(fakeBin, { recursive: true });
      await fs.writeFile(
        path.join(fakeBin, "node"),
        "#!/bin/sh\necho 'fake node should not be used for key generation' >&2\nexit 42\n",
        "utf8",
      );
      await fs.chmod(path.join(fakeBin, "node"), 0o755);

      const shell = await execFileAsync(process.execPath, [
        scriptPath,
        "shell",
        "--label",
        "path-node",
        "--scenario",
        "empty",
      ]);
      await fs.writeFile(snippetFile, shell.stdout, "utf8");

      const shellProbe = await execFileAsync("bash", [
        "-lc",
        `${cleanupTestStateHomeTrap()}; export PATH=${shellQuote(fakeBin)}:$PATH; source ${shellQuote(snippetFile)}; printf '%s' "$MARKETINGCLAW_AUTH_PROFILE_SECRET_KEY"`,
      ]);
      expect(shellProbe.stdout).toMatch(secretKeyPattern);

      const renderedFunction = await execFileAsync(process.execPath, [
        scriptPath,
        "shell-function",
      ]);
      await fs.writeFile(functionFile, renderedFunction.stdout, "utf8");

      const functionProbe = await execFileAsync("bash", [
        "-lc",
        `${cleanupTestStateHomeTrap()}; export PATH=${shellQuote(fakeBin)}:$PATH; export MARKETINGCLAW_TEST_STATE_TMPDIR=${shellQuote(path.join(tempRoot, "function-tmp"))}; source ${shellQuote(functionFile)}; marketingclaw_test_state_create "path node" minimal; printf '%s' "$MARKETINGCLAW_AUTH_PROFILE_SECRET_KEY"`,
      ]);
      expect(functionProbe.stdout).toMatch(secretKeyPattern);
    } finally {
      await fs.rm(tempRoot, { recursive: true, force: true });
    }
  });

  it("creates the upgrade survivor scenario", async () => {
    const { stdout } = await execFileAsync(process.execPath, [
      scriptPath,
      "--",
      "create",
      "--label",
      "upgrade-survivor",
      "--scenario",
      "upgrade-survivor",
      "--json",
    ]);
    const payload = JSON.parse(stdout);
    try {
      expect(payload.scenario).toBe("upgrade-survivor");
      expect(payload.config.update).toStrictEqual({ channel: "stable" });
      expect(payload.config.gateway.auth).toStrictEqual({
        mode: "token",
        token: {
          id: "GATEWAY_AUTH_TOKEN_REF",
          provider: "default",
          source: "env",
        },
      });
      expect(payload.config.channels.discord.enabled).toBe(true);
      expect(payload.config.channels.discord.dm).toStrictEqual({
        allowFrom: ["111111111111111111"],
        policy: "allowlist",
      });
      expect(payload.config.channels.telegram.enabled).toBe(true);
      expect(payload.config.channels.whatsapp.enabled).toBe(true);
    } finally {
      await fs.rm(payload.root, { recursive: true, force: true });
    }
  });

  it("renders a reusable Docker shell function", async () => {
    const tempRoot = await fs.mkdtemp(path.join(os.tmpdir(), "marketingclaw-test-state-function-"));
    const snippetFile = path.join(tempRoot, "state-function.sh");
    try {
      const { stdout } = await execFileAsync(process.execPath, [scriptPath, "shell-function"]);
      expect(stdout).toContain("marketingclaw_test_state_create()");
      expect(stdout).toContain("unset MARKETINGCLAW_AGENT_DIR");
      expect(stdout).toContain("update-stable");
      await fs.writeFile(snippetFile, stdout, "utf8");

      const probe = await execFileAsync("bash", [
        "-lc",
        `${cleanupTestStateHomeTrap()}; export MARKETINGCLAW_TEST_STATE_TMPDIR=${shellQuote(path.join(tempRoot, "function-tmp"))}; source ${shellQuote(snippetFile)}; export MARKETINGCLAW_AGENT_DIR=/tmp/outside-agent; marketingclaw_test_state_create "onboard case" minimal; node -e 'const fs=require("node:fs"); const config=JSON.parse(fs.readFileSync(process.env.MARKETINGCLAW_CONFIG_PATH,"utf8")); process.stdout.write(JSON.stringify({home:process.env.HOME,tmpDir:process.env.MARKETINGCLAW_TEST_STATE_TMPDIR,agentDir:process.env.MARKETINGCLAW_AGENT_DIR || null,workspace:process.env.MARKETINGCLAW_TEST_WORKSPACE_DIR,secretKey:process.env.MARKETINGCLAW_AUTH_PROFILE_SECRET_KEY,config}));'`,
      ]);

      const payload = JSON.parse(probe.stdout);
      expect(payload.home).toBe(`${payload.tmpDir}/${path.basename(payload.home)}`);
      expect(payload.home).toContain("/marketingclaw-onboard-case-minimal-home.");
      expect(payload.agentDir).toBeNull();
      expect(payload.workspace).toBe(`${payload.home}/workspace`);
      expect(payload.secretKey).toMatch(secretKeyPattern);
      expect(payload.config).toStrictEqual({});

      const trailingTmpDir = path.join(tempRoot, "function-trailing-tmp");
      const trailingProbe = await execFileAsync("bash", [
        "-lc",
        `${cleanupTestStateHomeTrap()}; export MARKETINGCLAW_TEST_STATE_TMPDIR=${shellQuote(`${trailingTmpDir}/`)}; source ${shellQuote(snippetFile)}; marketingclaw_test_state_create "onboard case" minimal; node -e 'process.stdout.write(JSON.stringify({home:process.env.HOME,tmpDir:process.env.MARKETINGCLAW_TEST_STATE_TMPDIR,stateDir:process.env.MARKETINGCLAW_STATE_DIR,workspace:process.env.MARKETINGCLAW_TEST_WORKSPACE_DIR}));'`,
      ]);

      const trailingPayload = JSON.parse(trailingProbe.stdout);
      expect(trailingPayload.home).toBe(`${trailingTmpDir}/${path.basename(trailingPayload.home)}`);
      expect(trailingPayload.stateDir).toBe(`${trailingPayload.home}/.marketingclaw`);
      expect(trailingPayload.workspace).toBe(`${trailingPayload.home}/workspace`);

      const existingHome = path.join(tempRoot, "existing-home");
      const existingProbe = await execFileAsync("bash", [
        "-lc",
        `source ${shellQuote(snippetFile)}; marketingclaw_test_state_create ${shellQuote(existingHome)} minimal; firstKey="$MARKETINGCLAW_AUTH_PROFILE_SECRET_KEY"; export firstKey; printf '{"kept":true}\\n' > "$MARKETINGCLAW_CONFIG_PATH"; marketingclaw_test_state_create ${shellQuote(existingHome)} empty; node -e 'const fs=require("node:fs"); const config=JSON.parse(fs.readFileSync(process.env.MARKETINGCLAW_CONFIG_PATH,"utf8")); process.stdout.write(JSON.stringify({home:process.env.HOME,secretKey:process.env.MARKETINGCLAW_AUTH_PROFILE_SECRET_KEY,firstKey:process.env.firstKey,config}));'`,
      ]);

      const existingPayload = JSON.parse(existingProbe.stdout);
      expect(existingPayload.home).toBe(existingHome);
      expect(existingPayload.secretKey).toBe(existingPayload.firstKey);
      expect(existingPayload.config).toEqual({ kept: true });
    } finally {
      await fs.rm(tempRoot, { recursive: true, force: true });
    }
  });

  it("keeps onboard Docker temp homes on the shared test-state helper", async () => {
    const scriptText = await fs.readFile(onboardDockerScriptPath, "utf8");
    const scenarioText = await fs.readFile("scripts/e2e/lib/onboard/scenario.sh", "utf8");

    expect(scriptText).toContain("MARKETINGCLAW_TEST_STATE_FUNCTION_B64");
    expect(scriptText).toContain("scripts/e2e/lib/onboard/scenario.sh");
    expect(scenarioText).toContain("set_isolated_marketingclaw_env local-basic");
    expect(scenarioText).toContain("run_wizard_cmd channels channels");
    expect(scriptText).not.toContain("make_home");
    expect(scenarioText).not.toContain("make_home");
  });
});
