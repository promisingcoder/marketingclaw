#!/usr/bin/env bash
# Installs a prepared MarketingClaw npm tarball in Docker, runs non-interactive
# onboarding for a channel, and verifies one mocked model turn through Gateway.
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
source "$ROOT_DIR/scripts/lib/docker-e2e-image.sh"
source "$ROOT_DIR/scripts/lib/docker-e2e-package.sh"

IMAGE_NAME="$(docker_e2e_resolve_image "marketingclaw-npm-onboard-channel-agent-e2e" MARKETINGCLAW_NPM_ONBOARD_E2E_IMAGE)"
DOCKER_TARGET="${MARKETINGCLAW_NPM_ONBOARD_DOCKER_TARGET:-bare}"
HOST_BUILD="${MARKETINGCLAW_NPM_ONBOARD_HOST_BUILD:-1}"
PACKAGE_TGZ="${MARKETINGCLAW_CURRENT_PACKAGE_TGZ:-}"
CHANNEL="${MARKETINGCLAW_NPM_ONBOARD_CHANNEL:-telegram}"
JSON_ARTIFACT_MAX_BYTES="$(
  docker_e2e_read_positive_int_env MARKETINGCLAW_NPM_ONBOARD_JSON_ARTIFACT_MAX_BYTES 1048576
)"
STATUS_TEXT_MAX_BYTES="$(
  docker_e2e_read_positive_int_env MARKETINGCLAW_NPM_ONBOARD_STATUS_TEXT_MAX_BYTES 1048576
)"
run_log=""

cleanup() {
  if [ -n "${PACKAGE_TGZ:-}" ]; then
    docker_e2e_cleanup_package_tgz "$PACKAGE_TGZ"
  fi
  if [ -n "${run_log:-}" ]; then
    rm -f "$run_log"
  fi
}
trap cleanup EXIT

case "$CHANNEL" in
telegram | discord | slack) ;;
*)
  echo "MARKETINGCLAW_NPM_ONBOARD_CHANNEL must be telegram, discord, or slack, got: $CHANNEL" >&2
  exit 1
  ;;
esac

docker_e2e_build_or_reuse "$IMAGE_NAME" npm-onboard-channel-agent "$ROOT_DIR/scripts/e2e/Dockerfile" "$ROOT_DIR" "$DOCKER_TARGET"

prepare_package_tgz() {
  if [ -n "$PACKAGE_TGZ" ]; then
    PACKAGE_TGZ="$(docker_e2e_prepare_package_tgz npm-onboard-channel-agent "$PACKAGE_TGZ")"
    return 0
  fi
  if [ "$HOST_BUILD" = "0" ] && [ -z "${MARKETINGCLAW_CURRENT_PACKAGE_TGZ:-}" ]; then
    echo "MARKETINGCLAW_NPM_ONBOARD_HOST_BUILD=0 requires MARKETINGCLAW_CURRENT_PACKAGE_TGZ" >&2
    exit 1
  fi
  PACKAGE_TGZ="$(docker_e2e_prepare_package_tgz npm-onboard-channel-agent)"
}

prepare_package_tgz

docker_e2e_package_mount_args "$PACKAGE_TGZ"
run_log="$(docker_e2e_run_log npm-onboard-channel-agent)"
MARKETINGCLAW_TEST_STATE_SCRIPT_B64="$(docker_e2e_test_state_shell_b64 npm-onboard-channel-agent empty)"

echo "Running npm tarball onboard/channel/agent Docker E2E ($CHANNEL)..."
if ! docker_e2e_run_with_harness \
  -e COREPACK_ENABLE_DOWNLOAD_PROMPT=0 \
  -e MARKETINGCLAW_NPM_ONBOARD_CHANNEL="$CHANNEL" \
  -e "MARKETINGCLAW_NPM_ONBOARD_JSON_ARTIFACT_MAX_BYTES=$JSON_ARTIFACT_MAX_BYTES" \
  -e "MARKETINGCLAW_NPM_ONBOARD_STATUS_TEXT_MAX_BYTES=$STATUS_TEXT_MAX_BYTES" \
  -e "MARKETINGCLAW_TEST_STATE_SCRIPT_B64=$MARKETINGCLAW_TEST_STATE_SCRIPT_B64" \
  "${DOCKER_E2E_PACKAGE_ARGS[@]}" \
  -i "$IMAGE_NAME" bash -s >"$run_log" 2>&1 <<'EOF'; then
set -Eeuo pipefail

source scripts/lib/marketingclaw-e2e-instance.sh
marketingclaw_e2e_eval_test_state_from_b64 "${MARKETINGCLAW_TEST_STATE_SCRIPT_B64:?missing MARKETINGCLAW_TEST_STATE_SCRIPT_B64}"
export NPM_CONFIG_PREFIX="$HOME/.npm-global"
export PATH="$NPM_CONFIG_PREFIX/bin:$PATH"
export OPENAI_API_KEY="sk-marketingclaw-npm-onboard-e2e"
export MARKETINGCLAW_GATEWAY_TOKEN="npm-onboard-channel-agent-token"

CHANNEL="${MARKETINGCLAW_NPM_ONBOARD_CHANNEL:?missing MARKETINGCLAW_NPM_ONBOARD_CHANNEL}"
PORT="18789"
MOCK_PORT="44080"
SUCCESS_MARKER="MARKETINGCLAW_AGENT_E2E_OK_ASSISTANT"
scenario_tmp="$(mktemp -d "${TMPDIR:-/tmp}/marketingclaw-npm-onboard-channel-agent.XXXXXX")"
MOCK_REQUEST_LOG="$scenario_tmp/mock-openai-requests.jsonl"
export SUCCESS_MARKER MOCK_REQUEST_LOG
mock_pid=""

case "$CHANNEL" in
  telegram)
    CHANNEL_TOKEN="123456:marketingclaw-npm-onboard-token"
    DEP_SENTINEL="grammy"
    CHANNEL_ADD_ARGS=(--token "$CHANNEL_TOKEN")
    CHANNEL_CONFIG_TOKENS=("$CHANNEL_TOKEN")
    ;;
  discord)
    CHANNEL_TOKEN="marketingclaw-npm-onboard-discord-token"
    DEP_SENTINEL="discord-api-types"
    CHANNEL_ADD_ARGS=(--token "$CHANNEL_TOKEN")
    CHANNEL_CONFIG_TOKENS=("$CHANNEL_TOKEN")
    ;;
  slack)
    SLACK_BOT_TOKEN="xoxb-marketingclaw-npm-onboard-slack-token"
    SLACK_APP_TOKEN="xapp-marketingclaw-npm-onboard-slack-token"
    DEP_SENTINEL="@slack/bolt"
    CHANNEL_ADD_ARGS=(--bot-token "$SLACK_BOT_TOKEN" --app-token "$SLACK_APP_TOKEN")
    CHANNEL_CONFIG_TOKENS=("$SLACK_BOT_TOKEN" "$SLACK_APP_TOKEN")
    ;;
  *)
    echo "unsupported channel: $CHANNEL" >&2
    exit 1
    ;;
esac

cleanup() {
  marketingclaw_e2e_stop_process "${mock_pid:-}"
  rm -rf "$scenario_tmp"
}
trap cleanup EXIT

dump_debug_logs() {
  local status="$1"
  echo "npm onboard/channel/agent scenario failed with exit code $status" >&2
  marketingclaw_e2e_dump_logs \
    /tmp/marketingclaw-install.log \
    /tmp/marketingclaw-onboard.json \
    /tmp/marketingclaw-channel-add.log \
    /tmp/marketingclaw-channels-status.json \
    /tmp/marketingclaw-channels-status.err \
    /tmp/marketingclaw-status.txt \
    /tmp/marketingclaw-status.err \
    /tmp/marketingclaw-doctor.log \
    /tmp/marketingclaw-agent.combined \
    /tmp/marketingclaw-agent.err \
    /tmp/marketingclaw-agent.json \
    /tmp/marketingclaw-mock-openai.log \
    "$MOCK_REQUEST_LOG" \
    "$MARKETINGCLAW_HOME/.marketingclaw/marketingclaw.json" \
    "$MARKETINGCLAW_HOME/.marketingclaw/agents/main/agent/auth-profiles.json"
}
trap 'status=$?; dump_debug_logs "$status"; exit "$status"' ERR

marketingclaw_e2e_install_package /tmp/marketingclaw-install.log

command -v marketingclaw >/dev/null
marketingclaw_e2e_enable_marketingclaw_cli_timeout
package_root="$(marketingclaw_e2e_package_root)"
if [ -d "$package_root/dist/extensions/$CHANNEL" ]; then
  CHANNEL_PACKAGE_MODE="bundled"
else
  CHANNEL_PACKAGE_MODE="external"
  echo "$CHANNEL is not packaged with core MarketingClaw; expecting channel selection to install it on demand."
fi

mock_pid="$(marketingclaw_e2e_start_mock_openai "$MOCK_PORT" /tmp/marketingclaw-mock-openai.log)"
marketingclaw_e2e_wait_mock_openai "$MOCK_PORT"

echo "Running non-interactive onboarding..."
marketingclaw onboard --non-interactive --accept-risk \
  --mode local \
  --auth-choice openai-api-key \
  --secret-input-mode ref \
  --gateway-port "$PORT" \
  --gateway-bind loopback \
  --skip-daemon \
  --skip-ui \
  --skip-skills \
  --skip-health \
  --json >/tmp/marketingclaw-onboard.json

node scripts/e2e/lib/npm-onboard-channel-agent/assertions.mjs assert-onboard-state "$HOME"

marketingclaw_e2e_assert_dep_absent "$DEP_SENTINEL" "$HOME/.marketingclaw"

echo "Configuring $CHANNEL..."
marketingclaw channels add --channel "$CHANNEL" "${CHANNEL_ADD_ARGS[@]}" >/tmp/marketingclaw-channel-add.log 2>&1
node scripts/e2e/lib/npm-onboard-channel-agent/assertions.mjs assert-channel-config "$CHANNEL" "${CHANNEL_CONFIG_TOKENS[@]}"

echo "Checking status surfaces for $CHANNEL..."
marketingclaw channels status --json >/tmp/marketingclaw-channels-status.json 2>/tmp/marketingclaw-channels-status.err
marketingclaw status >/tmp/marketingclaw-status.txt 2>/tmp/marketingclaw-status.err
node scripts/e2e/lib/npm-onboard-channel-agent/assertions.mjs assert-status-surfaces "$CHANNEL" /tmp/marketingclaw-channels-status.json /tmp/marketingclaw-status.txt

echo "Running doctor after channel activation..."
marketingclaw doctor --repair --non-interactive >/tmp/marketingclaw-doctor.log 2>&1
if [ "$CHANNEL_PACKAGE_MODE" = "external" ]; then
  marketingclaw_e2e_assert_dep_present "$DEP_SENTINEL" "$HOME/.marketingclaw"
else
  marketingclaw_e2e_assert_dep_absent "$DEP_SENTINEL" "$HOME/.marketingclaw"
fi

node scripts/e2e/lib/npm-onboard-channel-agent/assertions.mjs configure-mock-model "$MOCK_PORT"
node scripts/e2e/lib/npm-onboard-channel-agent/assertions.mjs assert-mock-model-config "$MOCK_PORT"

echo "Running local agent turn against mocked OpenAI..."
set +e
marketingclaw agent --local \
  --agent main \
  --session-id npm-onboard-channel-agent \
  --message "Return the success marker from the test server." \
  --thinking off \
  --json >/tmp/marketingclaw-agent.combined 2>&1
agent_status=$?
set -e
if [ "$agent_status" -ne 0 ]; then
  dump_debug_logs "$agent_status"
  exit "$agent_status"
fi

node scripts/e2e/lib/npm-onboard-channel-agent/assertions.mjs assert-agent-turn "$SUCCESS_MARKER" "$MOCK_REQUEST_LOG"

echo "npm tarball onboard/channel/agent Docker E2E passed for $CHANNEL"
EOF
  docker_e2e_print_log "$run_log"
  exit 1
fi

echo "npm tarball onboard/channel/agent Docker E2E passed ($CHANNEL)"
