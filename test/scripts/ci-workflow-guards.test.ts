// Ci Workflow Guards tests cover ci workflow guards script behavior.
import { execFileSync } from "node:child_process";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { parse } from "yaml";

const CHECKOUT_V6 = "actions/checkout@df4cb1c069e1874edd31b4311f1884172cec0e10";
const CACHE_V5 = "actions/cache/restore@27d5ce7f107fe9357f9df03efb73ab90386fccae";
const SETUP_GO_V6 = "actions/setup-go@4a3601121dd01d1626a1e23e37211e3254c1c06c";
const UPLOAD_ARTIFACT_V7 = "actions/upload-artifact@043fb46d1a93c77aae656e7c1c64a875d1fc6a0a";
const DOWNLOAD_ARTIFACT_V8 = "actions/download-artifact@3e5f45b2cfb9172054b4087a40e8e0b5a5461e7c";
const OPENGREP_PR_DIFF_WORKFLOW = ".github/workflows/opengrep-precise.yml";

function readCiWorkflow() {
  return parse(readFileSync(".github/workflows/ci.yml", "utf8"));
}

function readWorkflowSanityWorkflow() {
  return parse(readFileSync(".github/workflows/workflow-sanity.yml", "utf8"));
}

function readCriticalQualityWorkflow() {
  return readFileSync(".github/workflows/codeql-critical-quality.yml", "utf8");
}

function readTrackedText(relativePath: string): string {
  if (existsSync(relativePath)) {
    return readFileSync(relativePath, "utf8");
  }
  return execFileSync("git", ["show", `:${relativePath}`], { encoding: "utf8" });
}

function readAndroidCompileSdk(relativePath: string): number {
  const match = readTrackedText(relativePath).match(/^\s*compileSdk\s*=\s*(\d+)\s*$/mu);
  if (!match) {
    throw new Error(`Missing compileSdk in ${relativePath}`);
  }
  return Number(match[1]);
}

function findYamlFiles(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = `${directory}/${entry.name}`;
    if (entry.isDirectory()) {
      return findYamlFiles(path);
    }
    return entry.isFile() && /\.ya?ml$/u.test(entry.name) ? [path] : [];
  });
}

function findUnpinnedExternalActions(): string[] {
  const violations: string[] = [];
  for (const workflowPath of [
    ...findYamlFiles(".github/workflows"),
    ...findYamlFiles(".github/actions"),
  ]) {
    for (const [index, line] of readFileSync(workflowPath, "utf8").split("\n").entries()) {
      const uses = line.match(/^\s*(?:-\s*)?uses:\s*([^#\s]+)/u)?.[1];
      if (!uses || uses.startsWith("./") || uses.startsWith("docker://")) {
        continue;
      }
      const at = uses.lastIndexOf("@");
      if (at < 1 || !/^[a-f0-9]{40}$/u.test(uses.slice(at + 1))) {
        violations.push(`${workflowPath}:${index + 1}: ${uses}`);
      }
    }
  }
  return violations;
}

describe("ci workflow guards", () => {
  it("makes the hosted release-gate fallback explicit and exact-SHA only", () => {
    const workflow = readCiWorkflow();
    const releaseGate = workflow.on.workflow_dispatch.inputs.release_gate;

    expect(releaseGate).toEqual({
      description:
        "Run an exact-SHA maintainer release-gate fallback when PR CI is capacity-stalled.",
      required: false,
      default: false,
      type: "boolean",
    });
    expect(workflow.on.workflow_dispatch.inputs.dispatch_id).toEqual({
      description: "Optional parent workflow dispatch identifier",
      required: false,
      default: "",
      type: "string",
    });
    expect(readFileSync(".github/workflows/ci.yml", "utf8")).toContain(
      "run-name: ${{ github.event_name == 'workflow_dispatch' && inputs.dispatch_id != '' && format('CI {0}', inputs.dispatch_id) || (github.event_name == 'workflow_dispatch' && inputs.release_gate && format('CI release gate {0}', inputs.target_ref) || 'CI') }}",
    );
    const preflightSteps = workflow.jobs.preflight.steps;
    const validationStep = preflightSteps.find(
      (step) => step.name === "Validate release-gate dispatch",
    );
    expect(validationStep.if).toBe(
      "github.event_name == 'workflow_dispatch' && inputs.release_gate",
    );
    expect(validationStep.run).toContain(
      "release_gate requires target_ref to be a full commit SHA",
    );
    expect(validationStep.run).toContain("release_gate must run from the branch at target_ref");
    expect(readFileSync(".github/workflows/ci.yml", "utf8")).toContain(
      "OPENCLAW_CI_RUN_ANDROID: ${{ github.event_name == 'workflow_dispatch' && (inputs.release_gate || inputs.include_android) && 'true' || steps.changed_scope.outputs.run_android || 'false' }}",
    );

    for (const [jobName, job] of Object.entries(workflow.jobs)) {
      const runsOn = (job as { "runs-on"?: unknown })["runs-on"];
      if (typeof runsOn !== "string" || !runsOn.includes("blacksmith-")) {
        continue;
      }
      expect(runsOn, `${jobName} must use GitHub-hosted capacity for release gates`).toContain(
        "github.event_name == 'workflow_dispatch'",
      );
    }
  });

  it("pins every external GitHub Action reference to a full commit SHA", () => {
    expect(findUnpinnedExternalActions()).toEqual([]);
  });

  it("fails OpenGrep SARIF artifact uploads when reports are missing", () => {
    const workflow = parse(readFileSync(OPENGREP_PR_DIFF_WORKFLOW, "utf8"));
    const uploadStep = workflow.jobs.scan.steps.find(
      (step) => step.name === "Upload SARIF as workflow artifact",
    );

    expect(uploadStep.if).toBe("always()");
    expect(uploadStep.uses).toBe(UPLOAD_ARTIFACT_V7);
    expect(uploadStep.with).toMatchObject({
      name: "opengrep-pr-diff-sarif",
      path: ".opengrep-out/precise.sarif",
      "if-no-files-found": "error",
    });
  });

  it("keeps docs-change detection fail-safe and fixture-aware", () => {
    const action = readFileSync(".github/actions/detect-docs-changes/action.yml", "utf8");

    expect(action).toContain("docs_only:");
    expect(action).toContain("docs_changed:");
    expect(action).toContain('BASE="${{ github.event.before }}"');
    expect(action).toContain('BASE="${{ github.event.pull_request.base.sha }}"');
    expect(action).toContain(
      'CHANGED=$(git diff --name-only "$BASE" HEAD 2>/dev/null || echo "UNKNOWN")',
    );
    expect(action).toContain('if [ "$CHANGED" = "UNKNOWN" ] || [ -z "$CHANGED" ]; then');
    expect(action).toContain("docs_only=false");
    expect(action).toContain("docs_changed=false");
    expect(action).toContain("test/fixtures/*)");
    expect(action).toContain("docs/* | *.md | *.mdx)");
  });

  it("bounds matrix fan-out for runner-registration pressure", () => {
    const workflow = readCiWorkflow();

    expect(workflow.concurrency.group).toContain("github.event.pull_request.number");
    expect(workflow.concurrency["cancel-in-progress"]).toContain(
      "github.event_name == 'pull_request'",
    );
    expect(workflow.jobs["checks-fast-core"].strategy["max-parallel"]).toBe(12);
    expect(workflow.jobs["checks-node-core-test-nondist-shard"].strategy["max-parallel"]).toBe(28);
    expect(workflow.jobs["checks-fast-plugin-contracts-shard"].strategy["max-parallel"]).toBe(12);
    expect(workflow.jobs["checks-fast-channel-contracts-shard"].strategy["max-parallel"]).toBe(12);
    expect(workflow.jobs["check-shard"].strategy["max-parallel"]).toBe(12);
    expect(workflow.jobs["check-additional-shard"].strategy["max-parallel"]).toBe(12);
    expect(workflow.jobs["checks-windows"].strategy["max-parallel"]).toBe(2);
    expect(workflow.jobs.android.strategy["max-parallel"]).toBe(2);
  });

  it("installs the Android SDK platform used by Gradle", () => {
    const workflow = readCiWorkflow();
    const appCompileSdk = readAndroidCompileSdk("apps/android/app/build.gradle.kts");
    const benchmarkCompileSdk = readAndroidCompileSdk("apps/android/benchmark/build.gradle.kts");
    const packageId = `platforms;android-${appCompileSdk}.0`;

    expect(appCompileSdk).toBe(benchmarkCompileSdk);
    const job = workflow.jobs.android;
    const cacheStep = job.steps.find((step) => step.name === "Cache Android SDK");
    const installStep = job.steps.find((step) => step.name === "Install Android SDK packages");

    expect(cacheStep.with.key).toContain(`platform-${appCompileSdk}.0-`);
    expect(installStep.run).toContain(`"${packageId}"`);
  });

  it("covers Android app variants, lint, and benchmark compilation", () => {
    const workflow = readCiWorkflow();
    const source = readFileSync(".github/workflows/ci.yml", "utf8");
    const runStep = workflow.jobs.android.steps.find(
      (step) => step.name === "Run Android ${{ matrix.task }}",
    );

    expect(source).toContain('{ check_name: "android-test-play", task: "test-play" }');
    expect(source).toContain(
      '{ check_name: "android-test-third-party", task: "test-third-party" }',
    );
    expect(source).toContain('{ check_name: "android-build-play", task: "build-play" }');
    expect(runStep.run).toContain(":app:testPlayDebugUnitTest");
    expect(runStep.run).toContain(":app:testThirdPartyDebugUnitTest");
    expect(runStep.run).toContain(":app:assemblePlayDebug");
    expect(runStep.run).toContain(":app:assembleThirdPartyDebug");
    expect(runStep.run).toContain(":app:lintPlayDebug");
    expect(runStep.run).toContain(":app:lintThirdPartyDebug");
    expect(runStep.run).toContain(":benchmark:assembleDebug");
  });

  it("debounces canonical main pushes before Blacksmith admission", () => {
    const workflow = readCiWorkflow();
    const source = readFileSync(".github/workflows/ci.yml", "utf8");
    const admission = workflow.jobs["runner-admission"];

    expect(admission["runs-on"]).toBe("ubuntu-24.04");
    expect(admission.steps[0].if).toContain("github.ref == 'refs/heads/main'");
    expect(admission.steps[0].run).toContain('sleep "${OPENCLAW_MAIN_CI_DEBOUNCE_SECONDS}"');
    expect(admission.env.OPENCLAW_MAIN_CI_DEBOUNCE_SECONDS).toBe("90");
    expect(workflow.jobs.preflight.needs).toContain("runner-admission");
    expect(workflow.jobs["security-fast"].needs).toContain("runner-admission");
    expect(source).toContain(
      "cancel-in-progress: ${{ github.event_name == 'pull_request' || (github.event_name == 'push' && github.repository == 'openclaw/openclaw' && github.ref == 'refs/heads/main') }}",
    );
  });

  it("keeps CodeQL critical quality scans off Blacksmith registrations", () => {
    const source = readCriticalQualityWorkflow();
    const workflow = parse(source);
    const blacksmithJobs = Object.entries(workflow.jobs)
      .filter(([, job]) => job && typeof job === "object")
      .filter(([, job]) => (job as Record<string, unknown>)["runs-on"] !== "ubuntu-24.04")
      .map(([name]) => name);

    expect(blacksmithJobs).toEqual([]);
    expect(source).not.toContain("blacksmith-");
  });

  it("uses bundled Node shards and telemetry-backed runner sizes", () => {
    const workflow = readCiWorkflow();
    const source = readFileSync(".github/workflows/ci.yml", "utf8");

    expect(source).toContain("createNodeTestShardBundles");
    expect(workflow.jobs["build-artifacts"]["runs-on"]).toContain("blacksmith-16vcpu-ubuntu-2404");
    expect(workflow.jobs["checks-node-core-test-nondist-shard"]["runs-on"]).toContain(
      "blacksmith-4vcpu-ubuntu-2404",
    );
    expect(workflow.jobs["check-shard"].strategy.matrix.include).toContainEqual({
      check_name: "check-dependencies",
      task: "dependencies",
      runner: "blacksmith-4vcpu-ubuntu-2404",
    });
    expect(workflow.jobs["check-additional-shard"]["runs-on"]).toContain("matrix.runner");
    expect(workflow.jobs["check-additional-shard"].strategy.matrix.include).toContainEqual({
      check_name: "check-session-accessor-boundary",
      group: "session-accessor-boundary",
      runner: "blacksmith-4vcpu-ubuntu-2404",
    });
    expect(workflow.jobs["checks-windows"]["runs-on"]).toContain("matrix.runner");
    expect(source).toContain("blacksmith-8vcpu-windows-2025");
  });

  it("runs the session accessor ratchet as a visible additional check", () => {
    const workflow = readCiWorkflow();
    const additionalJob = workflow.jobs["check-additional-shard"];
    const matrixRows = additionalJob.strategy.matrix.include;
    expect(matrixRows).toContainEqual({
      check_name: "check-session-accessor-boundary",
      group: "session-accessor-boundary",
      runner: "blacksmith-4vcpu-ubuntu-2404",
    });

    const runStep = additionalJob.steps.find((step) => step.name === "Run additional check shard");
    expect(runStep.run).toContain("session-accessor-boundary)");
    expect(runStep.run).toContain(
      'run_check "lint:tmp:session-accessor-boundary" pnpm run lint:tmp:session-accessor-boundary',
    );
  });

  it("runs the transcript reader ratchet as a visible additional check", () => {
    const workflow = readCiWorkflow();
    const additionalJob = workflow.jobs["check-additional-shard"];
    const matrixRows = additionalJob.strategy.matrix.include;
    expect(matrixRows).toContainEqual({
      check_name: "check-session-transcript-reader-boundary",
      group: "session-transcript-reader-boundary",
      runner: "blacksmith-4vcpu-ubuntu-2404",
    });

    const runStep = additionalJob.steps.find((step) => step.name === "Run additional check shard");
    expect(runStep.run).toContain("session-transcript-reader-boundary)");
    expect(runStep.run).toContain(
      'run_check "lint:tmp:session-transcript-reader-boundary" pnpm run lint:tmp:session-transcript-reader-boundary',
    );
  });

  it("kills timed manual checkout fetches after the grace period", () => {
    const workflowPaths = [
      [".github/workflows/ci.yml", "120s"],
      [".github/workflows/workflow-sanity.yml", "30s"],
    ];

    for (const [workflowPath, timeoutSeconds] of workflowPaths) {
      const workflow = readFileSync(workflowPath, "utf8");
      const fetchTimeouts = workflow.match(
        new RegExp(
          `timeout --signal=TERM[^\\n]* ${timeoutSeconds} git(?: -C "(?:\\$workdir|\\$GITHUB_WORKSPACE|clawhub-source)")?`,
          "g",
        ),
      );

      expect(fetchTimeouts?.length, workflowPath).toBeGreaterThan(0);
      expect(
        fetchTimeouts?.every((line) =>
          line.startsWith(`timeout --signal=TERM --kill-after=10s ${timeoutSeconds} git`),
        ),
        workflowPath,
      ).toBe(true);
    }
  });

  it("bounds shared base commit fetches", () => {
    const action = readFileSync(".github/actions/ensure-base-commit/action.yml", "utf8");

    expect(action).toContain("fetch_base_ref()");
    expect(action).toContain("timeout --signal=TERM --kill-after=10s 30s git");
    expect(action).toContain("-c protocol.version=2");
    expect(action).not.toContain("if ! git fetch --no-tags");
  });

  it("bounds early unauthenticated checkout fetches", () => {
    const workflow = readCiWorkflow();

    for (const jobName of ["preflight", "security-fast", "skills-python"]) {
      const checkoutStep = workflow.jobs[jobName].steps.find((step) => step.name === "Checkout");

      expect(checkoutStep.run, jobName).toContain(
        'timeout --signal=TERM --kill-after=10s 120s git -C "$GITHUB_WORKSPACE"',
      );
      expect(checkoutStep.run, jobName).toContain("for attempt in 1 2 3");
      expect(checkoutStep.run, jobName).toContain("timed out on attempt $attempt; retrying");
      expect(checkoutStep.run, jobName).not.toContain("if timeout --signal=TERM");
      expect(checkoutStep.run, jobName).toContain("-c protocol.version=2");
      const expectedDepth = jobName === "preflight" ? 2 : 1;
      expect(checkoutStep.run, jobName).toContain(
        `fetch --no-tags --prune --no-recurse-submodules --depth=${expectedDepth} origin`,
      );
      if (jobName !== "skills-python") {
        expect(checkoutStep.run, jobName).toContain('if [ "$fetch_status" = "124" ]');
        expect(checkoutStep.run, jobName).toContain("timed out");
      }
      expect(checkoutStep.run, jobName).not.toContain(
        'git -C "$GITHUB_WORKSPACE" fetch --no-tags --depth=1',
      );
    }
  });

  it("retries workflow sanity checkout fetch timeouts", () => {
    const workflow = readWorkflowSanityWorkflow();

    for (const jobName of ["no-tabs", "actionlint", "generated-doc-baselines"]) {
      const checkoutStep = workflow.jobs[jobName].steps.find((step) => step.name === "Checkout");

      expect(checkoutStep.run, jobName).toContain("fetch_checkout_ref()");
      expect(checkoutStep.run, jobName).toContain("for attempt in 1 2 3");
      expect(checkoutStep.run, jobName).toContain(
        'timeout --signal=TERM --kill-after=10s 30s git -C "$GITHUB_WORKSPACE"',
      );
      expect(checkoutStep.run, jobName).toContain(
        'if [ "$fetch_status" != "124" ] && [ "$fetch_status" != "137" ]; then',
      );
      expect(checkoutStep.run, jobName).toContain("timed out on attempt $attempt; retrying");
      expect(checkoutStep.run, jobName).toContain(
        "fetch --no-tags --prune --no-recurse-submodules --depth=1 origin",
      );
    }
  });

  it("runs plugin SDK API and surface drift checks in workflow sanity", () => {
    const workflow = readWorkflowSanityWorkflow();
    const steps = workflow.jobs["generated-doc-baselines"].steps;
    const stepNames = steps.map((step) => step.name);

    expect(stepNames).toContain("Check plugin SDK API baseline drift");
    expect(stepNames).toContain("Check plugin SDK surface budget");
    expect(stepNames.indexOf("Check plugin SDK API baseline drift")).toBeLessThan(
      stepNames.indexOf("Check plugin SDK surface budget"),
    );
    expect(steps.find((step) => step.name === "Check plugin SDK surface budget").run).toBe(
      "pnpm plugin-sdk:surface:check",
    );
  });

  it("bounds platform checkout fetches without GNU timeout", () => {
    const source = readFileSync(".github/workflows/ci.yml", "utf8");
    const workflow = readCiWorkflow();

    expect(source.match(/&platform_checkout_step/gu) ?? []).toHaveLength(1);
    expect(source.match(/\*platform_checkout_step/gu) ?? []).toHaveLength(3);
    expect(source.match(/fetch_checkout_ref_once\(\)/gu) ?? []).toHaveLength(1);

    for (const jobName of ["checks-windows", "macos-node", "macos-swift", "ios-build"]) {
      const checkoutStep = workflow.jobs[jobName].steps.find((step) => step.name === "Checkout");

      expect(checkoutStep.run, jobName).toContain("fetch_checkout_ref()");
      expect(checkoutStep.run, jobName).toContain("fetch_checkout_ref_once()");
      expect(checkoutStep.run, jobName).toContain("for attempt in 1 2 3");
      expect(checkoutStep.run, jobName).toContain("fetch_timeout_seconds=90");
      expect(checkoutStep.run, jobName).toContain("-c protocol.version=2");
      expect(checkoutStep.run, jobName).toContain(
        "fetch --no-tags --prune --no-recurse-submodules --depth=1 origin",
      );
      expect(checkoutStep.run, jobName).toContain(
        'if [ "$elapsed" -ge "$fetch_timeout_seconds" ]; then',
      );
      expect(checkoutStep.run, jobName).toContain('kill -TERM "$fetch_pid"');
      expect(checkoutStep.run, jobName).toContain('kill -KILL "$fetch_pid"');
      expect(checkoutStep.run, jobName).toContain(
        'if [ "$fetch_status" != "124" ] && [ "$fetch_status" != "137" ]; then',
      );
      expect(checkoutStep.run, jobName).toContain("timed out on attempt $attempt; retrying");
      expect(checkoutStep.run, jobName).not.toContain(
        'git -C "$GITHUB_WORKSPACE" fetch --no-tags --depth=1',
      );
    }
  });

  it("resets SwiftPM state between macOS release build retries", () => {
    const workflow = readCiWorkflow();
    const buildStep = workflow.jobs["macos-swift"].steps.find(
      (step) => step.name === "Swift build (release)",
    );

    expect(buildStep.run).toContain("for attempt in 1 2 3");
    expect(buildStep.run).toContain('if [[ "$attempt" -eq 3 ]]; then');
    expect(buildStep.run).toContain("swift package --package-path apps/macos reset");
    expect(buildStep.run.indexOf("swift package --package-path apps/macos reset")).toBeGreaterThan(
      buildStep.run.indexOf("swift build failed"),
    );
  });

  it("runs dependency policy guards in PR CI preflight", () => {
    const workflow = readFileSync(".github/workflows/ci.yml", "utf8");
    const preflightGuards = workflow.slice(
      workflow.indexOf("guards)"),
      workflow.indexOf("shrinkwrap)"),
    );
    const shrinkwrapGuards = workflow.slice(
      workflow.indexOf("shrinkwrap)"),
      workflow.indexOf("prod-types)"),
    );

    expect(workflow).toContain("check-guards");
    expect(workflow).toContain("check-shrinkwrap");
    expect(shrinkwrapGuards).toContain("pnpm deps:shrinkwrap:check");
    expect(preflightGuards).toContain("pnpm deps:patches:check");
  });

  it("runs mobile protocol coverage for Node and native-only changes", () => {
    const workflow = readCiWorkflow();
    const coverageStep = workflow.jobs.preflight.steps.find(
      (step) => step.name === "Check mobile protocol event coverage",
    );
    const checkShardRun = workflow.jobs["check-shard"].steps.find(
      (step) => step.name === "Run check shard",
    ).run;

    expect(coverageStep.run).toBe("node scripts/check-protocol-event-coverage.mjs");
    expect(coverageStep.if).toContain("steps.manifest.outputs.run_node == 'true'");
    expect(coverageStep.if).toContain("steps.manifest.outputs.run_ios_build == 'true'");
    expect(coverageStep.if).toContain("steps.manifest.outputs.run_android_job == 'true'");
    expect(checkShardRun).not.toContain("check:protocol-coverage");
  });

  it("does not rebuild Control UI after build:ci-artifacts", () => {
    const workflow = readCiWorkflow();
    const buildArtifactSteps = workflow.jobs["build-artifacts"].steps;
    const buildDistStep = buildArtifactSteps.find((step) => step.name === "Build dist");

    expect(buildDistStep.run).toBe("pnpm build:ci-artifacts");
    expect(buildArtifactSteps.map((step) => step.name)).not.toContain("Build Control UI");
    expect(buildArtifactSteps.some((step) => step.run === "pnpm ui:build")).toBe(false);
  });

  it("restores the dist build cache before building and saves only cache misses", () => {
    const workflow = readCiWorkflow();
    const buildArtifactSteps = workflow.jobs["build-artifacts"].steps;
    const stepNames = buildArtifactSteps.map((step) => step.name);
    const restoreStep = buildArtifactSteps.find((step) => step.name === "Restore dist build cache");
    const buildDistStep = buildArtifactSteps.find((step) => step.name === "Build dist");
    const saveStep = buildArtifactSteps.find((step) => step.name === "Save dist build cache");

    expect(stepNames.indexOf("Restore dist build cache")).toBeLessThan(
      stepNames.indexOf("Build dist"),
    );
    expect(stepNames.indexOf("Build dist")).toBeLessThan(
      stepNames.indexOf("Pack built runtime artifacts"),
    );
    expect(stepNames.indexOf("Run built artifact checks")).toBeLessThan(
      stepNames.indexOf("Save dist build cache"),
    );
    expect(restoreStep.uses).toBe(CACHE_V5);
    expect(buildDistStep.if).toBe("steps.dist_build_cache.outputs.cache-hit != 'true'");
    expect(saveStep.uses).toBe("actions/cache/save@27d5ce7f107fe9357f9df03efb73ab90386fccae");
    expect(saveStep.if).toBe("steps.dist_build_cache.outputs.cache-hit != 'true'");
    expect(saveStep.with.key).toBe("${{ steps.dist_build_cache.outputs.cache-primary-key }}");
    expect(restoreStep.with.path).toContain("dist/");
    expect(restoreStep.with.path).toContain("dist-runtime/");
    expect(restoreStep.with.path).toContain("packages/*/dist/");
    expect(saveStep.with.path).toContain("packages/*/dist/");
    expect(restoreStep.with.key).toContain("dist-build-v2-");
    expect(
      buildArtifactSteps.find((step) => step.name === "Pack built runtime artifacts").run,
    ).toContain("packages/*/dist");
    expect(restoreStep.with.path).toContain("extensions/*/src/host/**/.bundle.hash");
    expect(restoreStep.with.path).toContain("extensions/*/src/host/**/*.bundle.js");
    expect(buildArtifactSteps.map((step) => step.name)).not.toContain("Cache dist build");
  });

  it("runs gateway watch after parallel built artifact checks", () => {
    const workflow = readCiWorkflow();
    const buildArtifactSteps = workflow.jobs["build-artifacts"].steps;
    const builtArtifactChecks = buildArtifactSteps.find(
      (step) => step.name === "Run built artifact checks",
    );
    const run = builtArtifactChecks.run;

    expect(run).toContain('start_check "channels"');
    expect(run).toContain('start_check "core-support-boundary"');
    expect(run).not.toContain('start_check "gateway-watch"');
    expect(run.indexOf('for index in "${!pids[@]}"')).toBeLessThan(
      run.indexOf('if [ "$RUN_GATEWAY_WATCH" = "true" ]; then'),
    );
    expect(run).toContain(
      'node scripts/check-gateway-watch-regression.mjs --skip-build >"$log" 2>&1',
    );
  });

  it("fails and retries quiet Node test shard stalls quickly", () => {
    const workflow = readCiWorkflow();
    const preflightJob = workflow.jobs.preflight;
    const manifestStep = preflightJob.steps.find((step) => step.name === "Build CI manifest");
    const nodeTestJob = workflow.jobs["checks-node-core-test-nondist-shard"];
    const setupGoStep = nodeTestJob.steps.find((step) => step.name === "Setup Go for docs i18n");
    const runStep = nodeTestJob.steps.find((step) => step.name === "Run Node test shard");

    expect(JSON.stringify(preflightJob.steps)).toContain("timeout_minutes: shard.timeoutMinutes");
    expect(manifestStep.run).toContain(
      'shard.groups?.some((group) => group.shard_name === "core-tooling")',
    );
    expect(nodeTestJob["timeout-minutes"]).toBe("${{ matrix.timeout_minutes || 60 }}");
    expect(setupGoStep).toMatchObject({
      if: "matrix.requires_go == true",
      uses: SETUP_GO_V6,
      with: {
        "go-version-file": "scripts/docs-i18n/go.mod",
        "cache-dependency-path": "scripts/docs-i18n/go.sum",
      },
    });
    expect(runStep.env.OPENCLAW_VITEST_NO_OUTPUT_TIMEOUT_MS).toBe("300000");
    expect(runStep.env.OPENCLAW_VITEST_NO_OUTPUT_RETRY).toBe("1");
    expect(runStep.env.OPENCLAW_TEST_PROJECTS_PARALLEL).toBe("2");
    expect(runStep.env.OPENCLAW_NODE_TEST_ENV_JSON).toBe("${{ toJson(matrix.env) }}");
    expect(runStep.run).toContain("env: JSON.parse(process.env.OPENCLAW_NODE_TEST_ENV_JSON");
    expect(runStep.run).toContain('if (plan.env && typeof plan.env === "object"');
    expect(runStep.run).toContain("childEnv[key] = value");
  });

  it("keeps the CI timing summary parked for timing optimization work", () => {
    expect(readFileSync(".github/workflows/ci.yml", "utf8")).toContain(
      "Re-enable this job when we want to collect CI timing data for timing optimization.",
    );

    const workflow = readCiWorkflow();
    const timingJob = workflow.jobs["ci-timings-summary"];

    expect(timingJob.permissions).toMatchObject({ actions: "read", contents: "read" });
    expect(timingJob.needs).toEqual([
      "preflight",
      "security-fast",
      "pnpm-store-warmup",
      "build-artifacts",
      "checks-fast-core",
      "checks-fast-plugin-contracts-shard",
      "checks-fast-channel-contracts-shard",
      "checks-node-compat",
      "checks-node-core-test-nondist-shard",
      "check-shard",
      "check-additional-shard",
      "check-docs",
      "skills-python",
      "checks-windows",
      "macos-node",
      "macos-swift",
      "ios-build",
      "android",
    ]);
    expect(timingJob.if).toContain("false");
    expect(timingJob.if).toContain("always()");
    expect(timingJob.if).toContain("!cancelled()");

    const checkoutStep = timingJob.steps.find(
      (step) => step.name === "Checkout timing summary helper",
    );
    expect(checkoutStep.uses).toBe(CHECKOUT_V6);
    expect(checkoutStep.with.ref).toBe(
      "${{ github.event_name == 'pull_request' && github.event.pull_request.base.sha || needs.preflight.outputs.checkout_revision || github.sha }}",
    );
    expect(checkoutStep.with["persist-credentials"]).toBe(false);

    const writeStep = timingJob.steps.find((step) => step.name === "Write CI timing summary");
    expect(writeStep.env).toMatchObject({ GH_TOKEN: "${{ github.token }}" });
    expect(writeStep.run).toContain(
      'node scripts/ci-run-timings.mjs "$GITHUB_RUN_ID" --limit 25 > ci-timings-summary.txt',
    );
    expect(writeStep.run).toContain('cat ci-timings-summary.txt >> "$GITHUB_STEP_SUMMARY"');

    const uploadStep = timingJob.steps.find((step) => step.name === "Upload CI timing summary");
    expect(uploadStep.uses).toBe(UPLOAD_ARTIFACT_V7);
    expect(uploadStep.with).toMatchObject({
      name: "ci-timings-summary",
      path: "ci-timings-summary.txt",
      "retention-days": 14,
    });
  });

  it("keeps workflow guards in fast CI-routing checks", () => {
    const workflow = readCiWorkflow();
    const preflightStep = workflow.jobs.preflight.steps.find(
      (step) => step.name === "Build CI manifest",
    );
    const taxonomy = parse(readFileSync("taxonomy.yaml", "utf8")) as {
      profiles: Array<{ id: string; categoryIds: string[] }>;
    };
    const smokeProfile = taxonomy.profiles.find((profile) => profile.id === "smoke-ci");
    if (!smokeProfile) {
      throw new Error("taxonomy.yaml is missing the smoke-ci profile");
    }
    const fastCoreJob = workflow.jobs["checks-fast-core"];
    const runStep = fastCoreJob.steps.find(
      (step) => step.name === "Run ${{ matrix.task }} (${{ matrix.runtime }})",
    );
    const smokeShardJob = workflow.jobs["qa-smoke-ci-shard"];
    const smokeRunStep = smokeShardJob.steps.find(
      (step) => step.name === "Run smoke profile shard",
    );
    const smokeUploadStep = smokeShardJob.steps.find(
      (step) => step.name === "Upload QA smoke profile evidence",
    );
    const smokeAggregateJob = workflow.jobs["qa-smoke-ci"];

    const ciWorkflowText = readFileSync(".github/workflows/ci.yml", "utf8");

    expect(preflightStep.run).not.toContain("qa-smoke-profile");
    expect(preflightStep.run).not.toContain("qa_category");
    expect(smokeProfile.categoryIds).toHaveLength(30);
    for (const categoryId of smokeProfile.categoryIds) {
      expect(ciWorkflowText).not.toContain(`"${categoryId}"`);
    }
    expect(runStep.run).toContain("bundled-protocol)");
    expect(runStep.run).not.toContain("qa-smoke-ci)");
    expect(runStep.run).toContain("contracts-plugins-ci-routing)");
    expect(runStep.run).toContain("ci-routing)");
    expect(fastCoreJob["runs-on"]).toContain("matrix.runner");
    expect(smokeShardJob.name).toBe("QA Smoke CI (${{ matrix.name }})");
    expect(smokeShardJob.strategy["max-parallel"]).toBe(3);
    expect(smokeShardJob.strategy.matrix.include.map((entry) => entry.slug)).toEqual([
      "matrix",
      "telegram-1-of-2",
      "telegram-2-of-2",
    ]);
    expect(smokeShardJob["runs-on"]).toContain("blacksmith-16vcpu-ubuntu-2404");
    expect(smokeRunStep.run).toContain("createQaSmokeCiMatrix");
    expect(smokeRunStep.run).toContain("--qa-profile smoke-ci");
    expect(smokeRunStep.run).toContain("--concurrency 8");
    expect(smokeRunStep.run).toContain('scenario_args+=(--scenario "$scenario_id")');
    expect(smokeRunStep.run).not.toContain("--category");
    expect(smokeRunStep.run).not.toContain("--allow-failures");
    expect(smokeRunStep.run).toContain("qa_exit_code=0");
    expect(smokeRunStep.run).toContain('exit "$qa_exit_code"');
    expect(smokeRunStep.run).toContain("scripts/package-openclaw-for-docker.mjs");
    expect(smokeRunStep.run).toContain("OPENCLAW_CURRENT_PACKAGE_TGZ");
    expect(smokeRunStep.run).toContain("--max-old-space-size=16384");
    expect(smokeRunStep.run).not.toContain("scripts/build-all.mjs qaRuntime");
    expect(smokeRunStep.run).not.toContain("OPENAI_API_KEY");
    expect(smokeUploadStep.if).toBe("always()");
    expect(smokeUploadStep.with).toMatchObject({
      path: ".artifacts/qa-e2e/smoke-ci-profile-${{ matrix.slug }}/",
      "if-no-files-found": "warn",
    });
    expect(smokeAggregateJob.name).toBe("QA Smoke CI");
    expect(smokeAggregateJob.needs).toEqual(["preflight", "qa-smoke-ci-shard"]);
    expect(smokeAggregateJob["runs-on"]).toBe("ubuntu-24.04");
    expect(runStep.run.match(/test\/scripts\/ci-workflow-guards\.test\.ts/g)?.length).toBe(2);
  });

  it("keeps network CodeQL off unrelated source-only refactors", () => {
    const workflow = readCriticalQualityWorkflow();
    const networkConfig = readFileSync(
      ".github/codeql/codeql-network-runtime-boundary-critical-quality.yml",
      "utf8",
    );
    const networkSelector = workflow.slice(
      workflow.indexOf(".github/codeql/codeql-network-runtime-boundary-critical-quality.yml"),
      workflow.indexOf("network-runtime-boundary:"),
    );
    const broadCodeqlSelector = workflow.slice(
      workflow.indexOf(".github/codeql/*|.github/workflows/codeql-critical-quality.yml"),
      workflow.indexOf("src/**/*.test.ts|src/**/*.test.tsx"),
    );

    expect(broadCodeqlSelector).not.toContain("network_runtime=true");
    expect(networkSelector).toContain(
      ".github/codeql/codeql-network-runtime-boundary-critical-quality.yml",
    );
    expect(networkSelector).not.toContain("src/*.ts|src/**/*.ts");
    expect(networkSelector).not.toContain("extensions/*.ts|extensions/**/*.ts");
    expect(networkSelector).toContain("src/infra/net/*");
    expect(networkSelector).toContain("src/infra/ssh-tunnel.ts");
    expect(networkSelector).toContain("packages/net-policy/src/*");
    expect(networkConfig).not.toContain("\n  - src\n");
    expect(networkConfig).not.toContain("\n  - extensions\n");
    expect(networkConfig).toContain("\n  - src/infra/net\n");
    expect(networkConfig).toContain("\n  - packages/net-policy/src\n");
    expect(workflow).toContain("Fast PR network boundary diff scan");
    expect(workflow).toContain(
      '| select(.filename | test("(^|/)[^/]+\\\\.(?:e2e\\\\.)?test\\\\.tsx?$") | not)',
    );
    expect(workflow).toContain("Network runtime boundary-sensitive added lines");
    expect(workflow).toContain("if: ${{ github.event_name != 'pull_request' }}");
  });
});
