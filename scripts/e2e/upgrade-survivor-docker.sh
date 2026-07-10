#!/usr/bin/env bash
# Installs the packed MarketingClaw tarball over dirty old-user state. When
# MARKETINGCLAW_UPGRADE_SURVIVOR_BASELINE_SPEC is set, installs that published
# baseline first and upgrades it to the selected candidate.
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
source "$ROOT_DIR/scripts/lib/docker-e2e-image.sh"
source "$ROOT_DIR/scripts/lib/docker-e2e-package.sh"
source "$ROOT_DIR/scripts/lib/marketingclaw-e2e-instance.sh"

IMAGE_NAME="$(docker_e2e_resolve_image "marketingclaw-upgrade-survivor-e2e" MARKETINGCLAW_UPGRADE_SURVIVOR_E2E_IMAGE)"
SKIP_BUILD="${MARKETINGCLAW_UPGRADE_SURVIVOR_E2E_SKIP_BUILD:-0}"
DOCKER_RUN_TIMEOUT="${MARKETINGCLAW_UPGRADE_SURVIVOR_DOCKER_RUN_TIMEOUT:-1200s}"
BASELINE_SPEC="${MARKETINGCLAW_UPGRADE_SURVIVOR_BASELINE_SPEC:-}"
SCENARIO="${MARKETINGCLAW_UPGRADE_SURVIVOR_SCENARIO:-base}"
UPDATE_RESTART_MODE="${MARKETINGCLAW_UPGRADE_SURVIVOR_UPDATE_RESTART_MODE:-manual}"
COMMAND_TIMEOUT="${MARKETINGCLAW_UPGRADE_SURVIVOR_COMMAND_TIMEOUT:-900s}"
START_BUDGET_SECONDS="$(marketingclaw_e2e_read_positive_int_env MARKETINGCLAW_UPGRADE_SURVIVOR_START_BUDGET_SECONDS 90)"
STATUS_BUDGET_SECONDS="$(marketingclaw_e2e_read_positive_int_env MARKETINGCLAW_UPGRADE_SURVIVOR_STATUS_BUDGET_SECONDS 30)"
PROBE_TIMEOUT_MS="$(marketingclaw_e2e_read_nonnegative_int_env MARKETINGCLAW_UPGRADE_SURVIVOR_PROBE_TIMEOUT_MS 60000)"
PROBE_ATTEMPT_TIMEOUT_MS="$(
  marketingclaw_e2e_read_positive_int_env MARKETINGCLAW_UPGRADE_SURVIVOR_PROBE_ATTEMPT_TIMEOUT_MS 5000
)"
PROBE_MAX_BODY_BYTES="$(
  marketingclaw_e2e_read_positive_int_env MARKETINGCLAW_UPGRADE_SURVIVOR_PROBE_MAX_BODY_BYTES 1048576
)"
ROOT_MANAGED_VPS="${MARKETINGCLAW_UPGRADE_SURVIVOR_ROOT_MANAGED_VPS:-0}"

resolve_lane_artifact_suffix() {
  if [ -n "${MARKETINGCLAW_DOCKER_ALL_LANE_NAME:-}" ]; then
    printf "%s" "$MARKETINGCLAW_DOCKER_ALL_LANE_NAME"
    return
  fi

  if [ "$ROOT_MANAGED_VPS" = "1" ]; then
    printf "root-managed-vps-upgrade"
  elif [ "$UPDATE_RESTART_MODE" = "auto-auth" ]; then
    printf "update-restart-auth"
  elif [ "${MARKETINGCLAW_UPGRADE_SURVIVOR_PUBLISHED_BASELINE:-0}" = "1" ]; then
    printf "published-upgrade-survivor"
  else
    printf "upgrade-survivor"
  fi

  if [ -n "${BASELINE_SPEC// }" ]; then
    printf -- "-%s" "$BASELINE_SPEC"
  fi
  if [ "$SCENARIO" != "base" ]; then
    printf -- "-%s" "$SCENARIO"
  fi
}

LANE_ARTIFACT_SUFFIX="$(resolve_lane_artifact_suffix)"
LANE_ARTIFACT_SUFFIX="${LANE_ARTIFACT_SUFFIX//[^A-Za-z0-9_.-]/_}"
ARTIFACT_DIR="${MARKETINGCLAW_UPGRADE_SURVIVOR_ARTIFACT_DIR:-$ROOT_DIR/.artifacts/upgrade-survivor/$LANE_ARTIFACT_SUFFIX}"
DOCKER_RUN_USER_ARGS=()
PROBE_ENV_ARGS=(
  -e MARKETINGCLAW_UPGRADE_SURVIVOR_PROBE_TIMEOUT_MS="$PROBE_TIMEOUT_MS"
  -e MARKETINGCLAW_UPGRADE_SURVIVOR_PROBE_ATTEMPT_TIMEOUT_MS="$PROBE_ATTEMPT_TIMEOUT_MS"
  -e MARKETINGCLAW_UPGRADE_SURVIVOR_PROBE_MAX_BODY_BYTES="$PROBE_MAX_BODY_BYTES"
)
if [ -n "${MARKETINGCLAW_UPGRADE_SURVIVOR_READYZ_ALLOW_FAILING:-}" ]; then
  PROBE_ENV_ARGS+=(
    -e MARKETINGCLAW_UPGRADE_SURVIVOR_READYZ_ALLOW_FAILING="$MARKETINGCLAW_UPGRADE_SURVIVOR_READYZ_ALLOW_FAILING"
  )
fi
if [ -n "${MARKETINGCLAW_UPGRADE_SURVIVOR_READYZ_ALLOW_DEGRADED:-}" ]; then
  PROBE_ENV_ARGS+=(
    -e MARKETINGCLAW_UPGRADE_SURVIVOR_READYZ_ALLOW_DEGRADED="$MARKETINGCLAW_UPGRADE_SURVIVOR_READYZ_ALLOW_DEGRADED"
  )
fi
cleanup_outer() {
  docker_e2e_cleanup_package_tgz "${PACKAGE_TGZ:-}"
}
trap cleanup_outer EXIT

if [ "$ROOT_MANAGED_VPS" = "1" ]; then
  if [ "${MARKETINGCLAW_UPGRADE_SURVIVOR_PUBLISHED_BASELINE:-0}" != "1" ]; then
    echo "MARKETINGCLAW_UPGRADE_SURVIVOR_ROOT_MANAGED_VPS=1 requires MARKETINGCLAW_UPGRADE_SURVIVOR_PUBLISHED_BASELINE=1" >&2
    exit 1
  fi
  DOCKER_RUN_USER_ARGS+=(--user root -e HOME=/root -e USER=root)
fi

normalize_npm_candidate() {
  local raw="$1"
  case "$raw" in
    latest | beta)
      printf 'marketingclaw@%s\n' "$raw"
      ;;
    openclaw@*)
      printf '%s\n' "$raw"
      ;;
    *@*)
      echo "MARKETINGCLAW_UPGRADE_SURVIVOR_CANDIDATE must be current, latest, beta, marketingclaw@<version>, a bare version, or a .tgz path." >&2
      return 1
      ;;
    *)
      printf 'marketingclaw@%s\n' "$raw"
      ;;
  esac
}

if [ "${MARKETINGCLAW_UPGRADE_SURVIVOR_PUBLISHED_BASELINE:-0}" = "1" ]; then
  if [ -z "${BASELINE_SPEC// }" ]; then
    echo "MARKETINGCLAW_UPGRADE_SURVIVOR_BASELINE_SPEC is required for published upgrade survivor" >&2
    exit 1
  fi

  mkdir -p "$ARTIFACT_DIR"
  chmod -R a+rwX "$ARTIFACT_DIR" || true

  DOCKER_E2E_PACKAGE_ARGS=()
  CANDIDATE_RAW="${MARKETINGCLAW_UPGRADE_SURVIVOR_CANDIDATE:-current}"
  CANDIDATE_KIND="npm"
  CANDIDATE_SPEC=""

  if [ -n "${MARKETINGCLAW_CURRENT_PACKAGE_TGZ:-}" ]; then
    PACKAGE_TGZ="$(docker_e2e_prepare_package_tgz upgrade-survivor "$MARKETINGCLAW_CURRENT_PACKAGE_TGZ")"
    docker_e2e_package_mount_args "$PACKAGE_TGZ"
    CANDIDATE_KIND="tarball"
    CANDIDATE_SPEC="/tmp/marketingclaw-current.tgz"
  elif [ "$CANDIDATE_RAW" = "current" ]; then
    PACKAGE_TGZ="$(docker_e2e_prepare_package_tgz upgrade-survivor)"
    docker_e2e_package_mount_args "$PACKAGE_TGZ"
    CANDIDATE_KIND="tarball"
    CANDIDATE_SPEC="/tmp/marketingclaw-current.tgz"
  elif [[ "$CANDIDATE_RAW" == *.tgz ]]; then
    if [ ! -f "$CANDIDATE_RAW" ]; then
      echo "MarketingClaw candidate tarball does not exist: $CANDIDATE_RAW" >&2
      exit 1
    fi
    PACKAGE_TGZ="$(docker_e2e_prepare_package_tgz upgrade-survivor "$CANDIDATE_RAW")"
    docker_e2e_package_mount_args "$PACKAGE_TGZ"
    CANDIDATE_KIND="tarball"
    CANDIDATE_SPEC="/tmp/marketingclaw-current.tgz"
  else
    CANDIDATE_KIND="npm"
    CANDIDATE_SPEC="$(normalize_npm_candidate "$CANDIDATE_RAW")"
  fi

  MARKETINGCLAW_TEST_STATE_FUNCTION_B64="$(docker_e2e_test_state_function_b64)"

  docker_e2e_build_or_reuse "$IMAGE_NAME" upgrade-survivor "$ROOT_DIR/scripts/e2e/Dockerfile" "$ROOT_DIR" "bare" "$SKIP_BUILD"

  echo "Running published upgrade survivor Docker E2E..."
  docker_e2e_run_with_harness \
    -e COREPACK_ENABLE_DOWNLOAD_PROMPT=0 \
    -e MARKETINGCLAW_TEST_STATE_FUNCTION_B64="$MARKETINGCLAW_TEST_STATE_FUNCTION_B64" \
    -e MARKETINGCLAW_UPGRADE_SURVIVOR_BASELINE="$BASELINE_SPEC" \
    -e MARKETINGCLAW_UPGRADE_SURVIVOR_CANDIDATE_KIND="$CANDIDATE_KIND" \
    -e MARKETINGCLAW_UPGRADE_SURVIVOR_CANDIDATE_SPEC="$CANDIDATE_SPEC" \
    -e MARKETINGCLAW_UPGRADE_SURVIVOR_SCENARIO="$SCENARIO" \
    -e MARKETINGCLAW_UPGRADE_SURVIVOR_UPDATE_RESTART_MODE="$UPDATE_RESTART_MODE" \
    -e MARKETINGCLAW_UPGRADE_SURVIVOR_COMMAND_TIMEOUT="$COMMAND_TIMEOUT" \
    -e MARKETINGCLAW_UPGRADE_SURVIVOR_LEGACY_RUNTIME_DEPS_SYMLINK="${MARKETINGCLAW_UPGRADE_SURVIVOR_LEGACY_RUNTIME_DEPS_SYMLINK:-}" \
    -e MARKETINGCLAW_UPGRADE_SURVIVOR_ROOT_MANAGED_VPS="$ROOT_MANAGED_VPS" \
    -e MARKETINGCLAW_UPGRADE_SURVIVOR_SUMMARY_JSON=/tmp/marketingclaw-upgrade-survivor-artifacts/summary.json \
    -e MARKETINGCLAW_UPGRADE_SURVIVOR_START_BUDGET_SECONDS="$START_BUDGET_SECONDS" \
    -e MARKETINGCLAW_UPGRADE_SURVIVOR_STATUS_BUDGET_SECONDS="$STATUS_BUDGET_SECONDS" \
    "${PROBE_ENV_ARGS[@]}" \
    -v "$ARTIFACT_DIR:/tmp/marketingclaw-upgrade-survivor-artifacts" \
    "${DOCKER_E2E_PACKAGE_ARGS[@]}" \
    "${DOCKER_RUN_USER_ARGS[@]}" \
    "$IMAGE_NAME" \
    timeout --kill-after=30s "$DOCKER_RUN_TIMEOUT" bash scripts/e2e/lib/upgrade-survivor/run.sh
  exit 0
fi

PACKAGE_TGZ="$(docker_e2e_prepare_package_tgz upgrade-survivor "${MARKETINGCLAW_CURRENT_PACKAGE_TGZ:-}")"
docker_e2e_package_mount_args "$PACKAGE_TGZ"
MARKETINGCLAW_TEST_STATE_SCRIPT_B64="$(docker_e2e_test_state_shell_b64 upgrade-survivor upgrade-survivor)"
mkdir -p "$ARTIFACT_DIR"
chmod -R a+rwX "$ARTIFACT_DIR" || true

docker_e2e_build_or_reuse "$IMAGE_NAME" upgrade-survivor "$ROOT_DIR/scripts/e2e/Dockerfile" "$ROOT_DIR" "bare" "$SKIP_BUILD"

echo "Running upgrade survivor Docker E2E..."
docker_e2e_run_with_harness \
  -e COREPACK_ENABLE_DOWNLOAD_PROMPT=0 \
  -e MARKETINGCLAW_TEST_STATE_SCRIPT_B64="$MARKETINGCLAW_TEST_STATE_SCRIPT_B64" \
  -e MARKETINGCLAW_UPGRADE_SURVIVOR_ARTIFACT_ROOT=/tmp/marketingclaw-upgrade-survivor-artifacts \
  -e MARKETINGCLAW_UPGRADE_SURVIVOR_ROOT_MANAGED_VPS="$ROOT_MANAGED_VPS" \
  -e MARKETINGCLAW_UPGRADE_SURVIVOR_SCENARIO="$SCENARIO" \
  -e MARKETINGCLAW_UPGRADE_SURVIVOR_UPDATE_RESTART_MODE="$UPDATE_RESTART_MODE" \
  -e MARKETINGCLAW_UPGRADE_SURVIVOR_COMMAND_TIMEOUT="$COMMAND_TIMEOUT" \
  -e MARKETINGCLAW_UPGRADE_SURVIVOR_START_BUDGET_SECONDS="$START_BUDGET_SECONDS" \
  -e MARKETINGCLAW_UPGRADE_SURVIVOR_STATUS_BUDGET_SECONDS="$STATUS_BUDGET_SECONDS" \
  "${PROBE_ENV_ARGS[@]}" \
  -v "$ARTIFACT_DIR:/tmp/marketingclaw-upgrade-survivor-artifacts" \
  "${DOCKER_E2E_PACKAGE_ARGS[@]}" \
  "${DOCKER_RUN_USER_ARGS[@]}" \
  "$IMAGE_NAME" \
  timeout --kill-after=30s "$DOCKER_RUN_TIMEOUT" bash -lc 'set -euo pipefail
source scripts/lib/marketingclaw-e2e-instance.sh

export npm_config_loglevel=error
export npm_config_fund=false
export npm_config_audit=false
export MARKETINGCLAW_UPGRADE_SURVIVOR_ARTIFACT_ROOT="${MARKETINGCLAW_UPGRADE_SURVIVOR_ARTIFACT_ROOT:-/tmp/marketingclaw-upgrade-survivor-artifacts}"
export MARKETINGCLAW_UPGRADE_SURVIVOR_RUNTIME_ROOT="${MARKETINGCLAW_UPGRADE_SURVIVOR_RUNTIME_ROOT:-/tmp/marketingclaw-upgrade-survivor-runtime}"
mkdir -p "$MARKETINGCLAW_UPGRADE_SURVIVOR_ARTIFACT_ROOT"
export TMPDIR="${MARKETINGCLAW_UPGRADE_SURVIVOR_TMPDIR:-$MARKETINGCLAW_UPGRADE_SURVIVOR_RUNTIME_ROOT/tmp}"
export MARKETINGCLAW_TEST_STATE_TMPDIR="${MARKETINGCLAW_UPGRADE_SURVIVOR_TEST_STATE_TMPDIR:-$MARKETINGCLAW_UPGRADE_SURVIVOR_RUNTIME_ROOT/state-tmp}"
export npm_config_prefix="$MARKETINGCLAW_UPGRADE_SURVIVOR_ARTIFACT_ROOT/npm-prefix"
export NPM_CONFIG_PREFIX="$npm_config_prefix"
export npm_config_cache="${MARKETINGCLAW_UPGRADE_SURVIVOR_NPM_CACHE:-$MARKETINGCLAW_UPGRADE_SURVIVOR_RUNTIME_ROOT/npm-cache}"
export NPM_CONFIG_CACHE="$npm_config_cache"
export npm_config_tmp="$TMPDIR"
mkdir -p "$MARKETINGCLAW_UPGRADE_SURVIVOR_RUNTIME_ROOT" "$TMPDIR" "$MARKETINGCLAW_TEST_STATE_TMPDIR" "$npm_config_prefix" "$npm_config_cache"
chmod 700 "$npm_config_cache" || true
export PATH="$npm_config_prefix/bin:$PATH"
export CI=true
export MARKETINGCLAW_NO_ONBOARD=1
export MARKETINGCLAW_NO_PROMPT=1
export MARKETINGCLAW_SKIP_PROVIDERS=1
export MARKETINGCLAW_SKIP_CHANNELS=1
export MARKETINGCLAW_DISABLE_BONJOUR=1
export GATEWAY_AUTH_TOKEN_REF="upgrade-survivor-token"
export OPENAI_API_KEY="sk-marketingclaw-upgrade-survivor"
export DISCORD_BOT_TOKEN="upgrade-survivor-discord-token"
export TELEGRAM_BOT_TOKEN="123456:upgrade-survivor-telegram-token"
export FEISHU_APP_SECRET="upgrade-survivor-feishu-secret"
export BRAVE_API_KEY="BSA_upgrade_survivor_brave_key"

UPDATE_RESTART_MODE="${MARKETINGCLAW_UPGRADE_SURVIVOR_UPDATE_RESTART_MODE:-manual}"
command_timeout="${MARKETINGCLAW_UPGRADE_SURVIVOR_COMMAND_TIMEOUT:-900s}"
PORT=18789
START_BUDGET="$(marketingclaw_e2e_read_positive_int_env MARKETINGCLAW_UPGRADE_SURVIVOR_START_BUDGET_SECONDS 90)"
STATUS_BUDGET="$(marketingclaw_e2e_read_positive_int_env MARKETINGCLAW_UPGRADE_SURVIVOR_STATUS_BUDGET_SECONDS 30)"
GATEWAY_LOG="$MARKETINGCLAW_UPGRADE_SURVIVOR_ARTIFACT_ROOT/gateway.log"
SYSTEMCTL_SHIM_LOG="$MARKETINGCLAW_UPGRADE_SURVIVOR_ARTIFACT_ROOT/systemctl-shim.log"
SYSTEMCTL_SHIM_PID_FILE="$MARKETINGCLAW_UPGRADE_SURVIVOR_ARTIFACT_ROOT/systemctl-shim.pid"
SYSTEMCTL_SHIM_DAEMON_LOG="$MARKETINGCLAW_UPGRADE_SURVIVOR_ARTIFACT_ROOT/systemctl-shim-gateway.log"
BASELINE_SERVICE_INSTALL_JSON="$MARKETINGCLAW_UPGRADE_SURVIVOR_ARTIFACT_ROOT/baseline-service-install.json"
BASELINE_SERVICE_INSTALL_ERR="$MARKETINGCLAW_UPGRADE_SURVIVOR_ARTIFACT_ROOT/baseline-service-install.err"
export MARKETINGCLAW_UPGRADE_SURVIVOR_SYSTEMCTL_SHIM_LOG="$SYSTEMCTL_SHIM_LOG"
export MARKETINGCLAW_UPGRADE_SURVIVOR_SYSTEMCTL_SHIM_PID_FILE="$SYSTEMCTL_SHIM_PID_FILE"
export MARKETINGCLAW_UPGRADE_SURVIVOR_SYSTEMCTL_SHIM_DAEMON_LOG="$SYSTEMCTL_SHIM_DAEMON_LOG"
export MARKETINGCLAW_UPGRADE_SURVIVOR_BASELINE_SERVICE_INSTALL_JSON="$BASELINE_SERVICE_INSTALL_JSON"
export MARKETINGCLAW_UPGRADE_SURVIVOR_BASELINE_SERVICE_INSTALL_ERR="$BASELINE_SERVICE_INSTALL_ERR"

gateway_pid=""
plugin_registry_pid=""
cleanup() {
  if [ -n "${plugin_registry_pid:-}" ]; then
    kill "$plugin_registry_pid" >/dev/null 2>&1 || true
  fi
  marketingclaw_e2e_terminate_gateways "${gateway_pid:-}"
  if [ -s "$SYSTEMCTL_SHIM_PID_FILE" ]; then
    marketingclaw_e2e_terminate_gateways "$(cat "$SYSTEMCTL_SHIM_PID_FILE" 2>/dev/null || true)"
  fi
}
trap cleanup EXIT

configure_configured_plugin_install_fixture_registry() {
  [ "${MARKETINGCLAW_UPGRADE_SURVIVOR_SCENARIO:-base}" = "configured-plugin-installs" ] || return 0

  local fixture_root="$MARKETINGCLAW_UPGRADE_SURVIVOR_ARTIFACT_ROOT/configured-plugin-installs-npm-fixture"
  local package_dir="$fixture_root/package"
  local tarball="$fixture_root/marketingclaw-brave-plugin-2026.5.2.tgz"
  local port_file="$fixture_root/npm-registry-port"
  local log_file="$fixture_root/npm-registry.log"
  mkdir -p "$package_dir"
  FIXTURE_PACKAGE_DIR="$package_dir" node <<'"'"'NODE'"'"'
const fs = require("node:fs");
const path = require("node:path");
const root = process.env.FIXTURE_PACKAGE_DIR;
fs.mkdirSync(root, { recursive: true });
fs.writeFileSync(
  path.join(root, "package.json"),
  `${JSON.stringify(
    {
      name: "@marketingclaw/brave-plugin",
      version: "2026.5.2",
      marketingclaw: { extensions: ["./index.js"] },
    },
    null,
    2,
  )}\n`,
);
fs.writeFileSync(
  path.join(root, "marketingclaw.plugin.json"),
  `${JSON.stringify(
    {
      id: "brave",
      activation: { onStartup: false },
      providerAuthEnvVars: { brave: ["BRAVE_API_KEY"] },
      contracts: { webSearchProviders: ["brave"] },
      configSchema: {
        type: "object",
        additionalProperties: false,
        properties: {
          webSearch: {
            type: "object",
            additionalProperties: false,
            properties: {
              apiKey: { type: ["string", "object"] },
              mode: { type: "string", enum: ["web", "llm-context"] },
              baseUrl: { type: ["string", "object"] },
            },
          },
        },
      },
    },
    null,
    2,
  )}\n`,
);
fs.writeFileSync(
  path.join(root, "index.js"),
  `module.exports = { id: "brave", name: "Brave Fixture", register() {} };\n`,
);
NODE
  tar -czf "$tarball" -C "$fixture_root" package
  node scripts/e2e/lib/plugins/npm-registry-server.mjs \
    "$port_file" \
    "@marketingclaw/brave-plugin" \
    "2026.5.2" \
    "$tarball" \
    >"$log_file" 2>&1 &
  plugin_registry_pid="$!"

  for _ in $(seq 1 100); do
    if [ -s "$port_file" ]; then
      export NPM_CONFIG_REGISTRY="http://127.0.0.1:$(cat "$port_file")"
      export npm_config_registry="$NPM_CONFIG_REGISTRY"
      return 0
    fi
    if ! kill -0 "$plugin_registry_pid" 2>/dev/null; then
      marketingclaw_e2e_print_log "$log_file" >&2
      return 1
    fi
    sleep 0.1
  done

  marketingclaw_e2e_print_log "$log_file" >&2
  echo "Timed out waiting for configured plugin install npm fixture registry." >&2
  return 1
}

marketingclaw_e2e_eval_test_state_from_b64 "${MARKETINGCLAW_TEST_STATE_SCRIPT_B64:?missing MARKETINGCLAW_TEST_STATE_SCRIPT_B64}"
node scripts/e2e/lib/upgrade-survivor/assertions.mjs seed

marketingclaw_e2e_install_package "$MARKETINGCLAW_UPGRADE_SURVIVOR_ARTIFACT_ROOT/install.log" "upgrade survivor package" "$npm_config_prefix"
command -v marketingclaw >/dev/null
package_version="$(node -p "JSON.parse(require(\"node:fs\").readFileSync(process.argv[1] + \"/lib/node_modules/marketingclaw/package.json\", \"utf8\")).version" "$npm_config_prefix")"
MARKETINGCLAW_PACKAGE_ACCEPTANCE_LEGACY_COMPAT="$(
  node scripts/e2e/lib/package-compat.mjs "$package_version"
)"
export MARKETINGCLAW_PACKAGE_ACCEPTANCE_LEGACY_COMPAT

echo "Checking dirty-state config before update..."
MARKETINGCLAW_UPGRADE_SURVIVOR_ASSERT_STAGE=baseline node scripts/e2e/lib/upgrade-survivor/assertions.mjs assert-config
MARKETINGCLAW_UPGRADE_SURVIVOR_ASSERT_STAGE=baseline node scripts/e2e/lib/upgrade-survivor/assertions.mjs assert-state
if [ "$UPDATE_RESTART_MODE" = "auto-auth" ]; then
  # shellcheck disable=SC1091
  source scripts/e2e/lib/upgrade-survivor/update-restart-auth.sh
  prepare_update_restart_probe_current_install "$PORT" "$GATEWAY_LOG"
fi

echo "Running package update against the mounted tarball..."
update_args=(update --tag "${MARKETINGCLAW_CURRENT_PACKAGE_TGZ:?missing MARKETINGCLAW_CURRENT_PACKAGE_TGZ}" --yes --json)
if [ "$UPDATE_RESTART_MODE" != "auto-auth" ]; then
  update_args+=(--no-restart)
fi
set +e
marketingclaw_e2e_maybe_timeout "$command_timeout" env -u MARKETINGCLAW_GATEWAY_TOKEN -u MARKETINGCLAW_GATEWAY_PASSWORD MARKETINGCLAW_ALLOW_ROOT=1 marketingclaw "${update_args[@]}" >/tmp/marketingclaw-upgrade-survivor-update.json 2>/tmp/marketingclaw-upgrade-survivor-update.err
update_status=$?
set -e
if [ "$update_status" -ne 0 ]; then
  echo "marketingclaw update failed" >&2
  marketingclaw_e2e_print_log /tmp/marketingclaw-upgrade-survivor-update.err >&2
  marketingclaw_e2e_print_log /tmp/marketingclaw-upgrade-survivor-update.json >&2
  exit "$update_status"
fi

if [ "$UPDATE_RESTART_MODE" = "auto-auth" ]; then
  echo "Skipping doctor repair until after restart proof."
else
  echo "Running non-interactive doctor repair..."
  configure_configured_plugin_install_fixture_registry
  if ! marketingclaw_e2e_maybe_timeout "$command_timeout" marketingclaw doctor --fix --non-interactive >/tmp/marketingclaw-upgrade-survivor-doctor.log 2>&1; then
    echo "marketingclaw doctor failed" >&2
    marketingclaw_e2e_print_log /tmp/marketingclaw-upgrade-survivor-doctor.log >&2
    exit 1
  fi
  if ! marketingclaw_e2e_maybe_timeout "$command_timeout" marketingclaw config validate >>/tmp/marketingclaw-upgrade-survivor-doctor.log 2>&1; then
    echo "post-doctor config validation failed" >&2
    marketingclaw_e2e_print_log /tmp/marketingclaw-upgrade-survivor-doctor.log >&2
    exit 1
  fi
fi

echo "Verifying config and state survived update..."
node scripts/e2e/lib/upgrade-survivor/assertions.mjs assert-config
node scripts/e2e/lib/upgrade-survivor/assertions.mjs assert-state

startup_summary="n/a"
if [ "$UPDATE_RESTART_MODE" = "auto-auth" ]; then
  echo "Gateway restart was handled by marketingclaw update."
else
  echo "Starting gateway from upgraded state..."
  start_epoch="$(node -e "process.stdout.write(String(Date.now()))")"
  marketingclaw gateway --port "$PORT" --bind loopback --allow-unconfigured >"$GATEWAY_LOG" 2>&1 &
  gateway_pid="$!"
  marketingclaw_e2e_wait_gateway_ready "$gateway_pid" "$GATEWAY_LOG" 360 "$PORT"
  ready_epoch="$(node -e "process.stdout.write(String(Date.now()))")"
  start_seconds=$(((ready_epoch - start_epoch + 999) / 1000))
  if [ "$start_seconds" -gt "$START_BUDGET" ]; then
    echo "gateway startup exceeded survivor budget: ${start_seconds}s > ${START_BUDGET}s" >&2
    marketingclaw_e2e_print_log "$GATEWAY_LOG" >&2
    exit 1
  fi
  startup_summary="${start_seconds}s"
fi

echo "Checking gateway HTTP probes..."
node scripts/e2e/lib/upgrade-survivor/probe-gateway.mjs \
  --base-url "http://127.0.0.1:$PORT" \
  --path /healthz \
  --expect live \
  --out /tmp/marketingclaw-upgrade-survivor-healthz.json

readyz_probe_args=(
  --base-url "http://127.0.0.1:$PORT"
  --path /readyz
  --expect ready
)
if [ -n "${MARKETINGCLAW_UPGRADE_SURVIVOR_READYZ_ALLOW_FAILING:-}" ]; then
  readyz_probe_args+=(--allow-failing "$MARKETINGCLAW_UPGRADE_SURVIVOR_READYZ_ALLOW_FAILING")
fi
if [ "${MARKETINGCLAW_UPGRADE_SURVIVOR_READYZ_ALLOW_DEGRADED:-}" = "1" ]; then
  readyz_probe_args+=(--allow-degraded-ready)
fi
readyz_probe_args+=(--out /tmp/marketingclaw-upgrade-survivor-readyz.json)
node scripts/e2e/lib/upgrade-survivor/probe-gateway.mjs "${readyz_probe_args[@]}"

echo "Checking gateway RPC status..."
status_start="$(node -e "process.stdout.write(String(Date.now()))")"
if ! marketingclaw_e2e_maybe_timeout "$command_timeout" marketingclaw gateway status --url "ws://127.0.0.1:$PORT" --token "$GATEWAY_AUTH_TOKEN_REF" --require-rpc --timeout 30000 --json >/tmp/marketingclaw-upgrade-survivor-status.json 2>/tmp/marketingclaw-upgrade-survivor-status.err; then
  echo "gateway status failed" >&2
  marketingclaw_e2e_print_log /tmp/marketingclaw-upgrade-survivor-status.err >&2
  marketingclaw_e2e_print_log "$GATEWAY_LOG" >&2
  marketingclaw_e2e_print_log "$SYSTEMCTL_SHIM_DAEMON_LOG" >&2
  exit 1
fi
status_end="$(node -e "process.stdout.write(String(Date.now()))")"
status_seconds=$(((status_end - status_start + 999) / 1000))
if [ "$status_seconds" -gt "$STATUS_BUDGET" ]; then
  echo "gateway status exceeded survivor budget: ${status_seconds}s > ${STATUS_BUDGET}s" >&2
  marketingclaw_e2e_print_log /tmp/marketingclaw-upgrade-survivor-status.json >&2
  exit 1
fi
node scripts/e2e/lib/upgrade-survivor/assertions.mjs assert-status-json /tmp/marketingclaw-upgrade-survivor-status.json

echo "Upgrade survivor Docker E2E passed scenario=${MARKETINGCLAW_UPGRADE_SURVIVOR_SCENARIO:-base} updateRestartMode=${UPDATE_RESTART_MODE} startup=${startup_summary} status=${status_seconds}s."
'
