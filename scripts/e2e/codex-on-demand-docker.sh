#!/usr/bin/env bash
# Installs a prepared MarketingClaw npm tarball in Docker, runs OpenAI onboarding,
# and verifies the Codex plugin plus @openai/codex dependency are downloaded on demand.
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
source "$ROOT_DIR/scripts/lib/docker-e2e-image.sh"
source "$ROOT_DIR/scripts/lib/docker-e2e-package.sh"

IMAGE_NAME="$(docker_e2e_resolve_image "marketingclaw-codex-on-demand-e2e" MARKETINGCLAW_CODEX_ON_DEMAND_E2E_IMAGE)"
DOCKER_TARGET="${MARKETINGCLAW_CODEX_ON_DEMAND_DOCKER_TARGET:-bare}"
HOST_BUILD="${MARKETINGCLAW_CODEX_ON_DEMAND_HOST_BUILD:-1}"
PACKAGE_TGZ="${MARKETINGCLAW_CURRENT_PACKAGE_TGZ:-}"
run_log=""

# This lane installs the package and then exercises a managed npm install of Codex.
# Keep the package install budget above the shared default so slow npm hosts reach
# the Codex assertions instead of failing as a silent package-install timeout.
export MARKETINGCLAW_E2E_NPM_INSTALL_TIMEOUT="${MARKETINGCLAW_E2E_NPM_INSTALL_TIMEOUT:-1200s}"

cleanup() {
  if [ -n "${PACKAGE_TGZ:-}" ]; then
    docker_e2e_cleanup_package_tgz "$PACKAGE_TGZ"
  fi
  if [ -n "${run_log:-}" ]; then
    rm -f "$run_log"
  fi
}
trap cleanup EXIT

docker_e2e_build_or_reuse "$IMAGE_NAME" codex-on-demand "$ROOT_DIR/scripts/e2e/Dockerfile" "$ROOT_DIR" "$DOCKER_TARGET"

prepare_package_tgz() {
  if [ -n "$PACKAGE_TGZ" ]; then
    PACKAGE_TGZ="$(docker_e2e_prepare_package_tgz codex-on-demand "$PACKAGE_TGZ")"
    return 0
  fi
  if [ "$HOST_BUILD" = "0" ] && [ -z "${MARKETINGCLAW_CURRENT_PACKAGE_TGZ:-}" ]; then
    echo "MARKETINGCLAW_CODEX_ON_DEMAND_HOST_BUILD=0 requires MARKETINGCLAW_CURRENT_PACKAGE_TGZ" >&2
    exit 1
  fi
  PACKAGE_TGZ="$(docker_e2e_prepare_package_tgz codex-on-demand)"
}

prepare_package_tgz

docker_e2e_package_mount_args "$PACKAGE_TGZ"
run_log="$(docker_e2e_run_log codex-on-demand)"
MARKETINGCLAW_TEST_STATE_SCRIPT_B64="$(docker_e2e_test_state_shell_b64 codex-on-demand empty)"

echo "Running Codex on-demand Docker E2E..."
if ! docker_e2e_run_with_harness \
  -e COREPACK_ENABLE_DOWNLOAD_PROMPT=0 \
  -e "MARKETINGCLAW_TEST_STATE_SCRIPT_B64=$MARKETINGCLAW_TEST_STATE_SCRIPT_B64" \
  "${DOCKER_E2E_PACKAGE_ARGS[@]}" \
  -i "$IMAGE_NAME" bash -s >"$run_log" 2>&1 <<'EOF'; then
set -euo pipefail

source scripts/lib/marketingclaw-e2e-instance.sh
marketingclaw_e2e_eval_test_state_from_b64 "${MARKETINGCLAW_TEST_STATE_SCRIPT_B64:?missing MARKETINGCLAW_TEST_STATE_SCRIPT_B64}"
export NPM_CONFIG_PREFIX="$HOME/.npm-global"
export npm_config_prefix="$NPM_CONFIG_PREFIX"
export XDG_CACHE_HOME="${XDG_CACHE_HOME:-$HOME/.cache}"
export NPM_CONFIG_CACHE="${NPM_CONFIG_CACHE:-$XDG_CACHE_HOME/npm}"
export npm_config_cache="$NPM_CONFIG_CACHE"
export PATH="$NPM_CONFIG_PREFIX/bin:$PATH"
export OPENAI_API_KEY="sk-marketingclaw-codex-on-demand-e2e"

dump_debug_logs() {
  local status="$1"
  echo "Codex on-demand scenario failed with exit code $status" >&2
  marketingclaw_e2e_dump_logs \
    /tmp/marketingclaw-install.log \
    /tmp/marketingclaw-onboard.json \
    /tmp/marketingclaw-plugins-list.json \
    /tmp/marketingclaw-codex-inspect.json
}
trap 'status=$?; dump_debug_logs "$status"; exit "$status"' ERR

mkdir -p "$NPM_CONFIG_PREFIX" "$XDG_CACHE_HOME" "$NPM_CONFIG_CACHE"
chmod 700 "$XDG_CACHE_HOME" "$NPM_CONFIG_CACHE" || true

marketingclaw_e2e_install_package /tmp/marketingclaw-install.log
command -v marketingclaw >/dev/null
marketingclaw_e2e_enable_marketingclaw_cli_timeout

marketingclaw_e2e_assert_dep_absent "@marketingclaw/codex" "$HOME/.marketingclaw" "$NPM_CONFIG_PREFIX"
marketingclaw_e2e_assert_dep_absent "@openai/codex" "$HOME/.marketingclaw" "$NPM_CONFIG_PREFIX"

echo "Running non-interactive OpenAI onboarding; Codex should install on demand..."
marketingclaw onboard --non-interactive --accept-risk \
  --mode local \
  --auth-choice openai-api-key \
  --secret-input-mode ref \
  --skip-daemon \
  --skip-ui \
  --skip-channels \
  --skip-skills \
  --skip-health \
  --json >/tmp/marketingclaw-onboard.json

marketingclaw plugins list --json >/tmp/marketingclaw-plugins-list.json
marketingclaw plugins inspect codex --runtime --json >/tmp/marketingclaw-codex-inspect.json
node scripts/e2e/lib/codex-on-demand/assertions.mjs

echo "Codex on-demand Docker E2E passed"
EOF
  docker_e2e_print_log "$run_log"
  exit 1
fi

echo "Codex on-demand Docker E2E passed"
