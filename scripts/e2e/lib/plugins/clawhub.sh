run_plugins_clawhub_scenario() {
  if [ "${MARKETINGCLAW_PLUGINS_E2E_CLAWHUB:-1}" = "0" ]; then
    echo "Skipping ClawHub plugin install and uninstall (MARKETINGCLAW_PLUGINS_E2E_CLAWHUB=0)."
  else
    echo "Testing ClawHub plugin install and uninstall..."
    CLAWHUB_PLUGIN_SPEC="${MARKETINGCLAW_PLUGINS_E2E_CLAWHUB_SPEC:-clawhub:@openclaw/kitchen-sink}"
    CLAWHUB_PLUGIN_ID="${MARKETINGCLAW_PLUGINS_E2E_CLAWHUB_ID:-marketingclaw-kitchen-sink-fixture}"
    export CLAWHUB_PLUGIN_SPEC CLAWHUB_PLUGIN_ID

    start_clawhub_fixture_server() {
      local fixture_dir="$1"
      local server_log="$fixture_dir/clawhub-fixture.log"
      local server_port_file="$fixture_dir/clawhub-fixture-port"
      local server_pid_file="$fixture_dir/clawhub-fixture-pid"

      marketingclaw_plugins_validate_fixture_log_print_bytes || return $?

      node scripts/e2e/lib/clawhub-fixture-server.cjs plugins "$server_port_file" >"$server_log" 2>&1 &
      local server_pid="$!"
      echo "$server_pid" >"$server_pid_file"
      marketingclaw_plugins_register_fixture_pid_file "$server_pid_file"

      for _ in $(seq 1 100); do
        if [[ -s "$server_port_file" ]]; then
          export MARKETINGCLAW_CLAWHUB_URL="http://127.0.0.1:$(cat "$server_port_file")"
          return 0
        fi
        if ! kill -0 "$server_pid" 2>/dev/null; then
          marketingclaw_plugins_print_fixture_log "$server_log"
          return 1
        fi
        sleep 0.1
      done

      marketingclaw_plugins_print_fixture_log "$server_log"
      echo "Timed out waiting for ClawHub fixture server." >&2
      return 1
    }

    if [[ "${MARKETINGCLAW_PLUGINS_E2E_LIVE_CLAWHUB:-0}" = "1" ]]; then
      export MARKETINGCLAW_CLAWHUB_URL="${MARKETINGCLAW_CLAWHUB_URL:-${CLAWHUB_URL:-https://clawhub.ai}}"
      export NPM_CONFIG_REGISTRY="${MARKETINGCLAW_PLUGINS_E2E_LIVE_NPM_REGISTRY:-https://registry.npmjs.org/}"
    else
      # Keep the release-path smoke hermetic; live ClawHub can rate-limit CI.
      if [[ -n "${MARKETINGCLAW_CLAWHUB_URL:-}" || -n "${CLAWHUB_URL:-}" ]]; then
        echo "Ignoring ambient ClawHub URL for fixture-mode plugin E2E; set MARKETINGCLAW_PLUGINS_E2E_LIVE_CLAWHUB=1 for live ClawHub."
      fi
      unset MARKETINGCLAW_CLAWHUB_URL CLAWHUB_URL
      clawhub_fixture_dir="$(mktemp -d "$MARKETINGCLAW_PLUGINS_TMP_DIR/marketingclaw-clawhub-fixture.XXXXXX")"
      local fixture_status=0
      start_clawhub_fixture_server "$clawhub_fixture_dir" || fixture_status="$?"
      if [[ "$fixture_status" -ne 0 ]]; then
        return "$fixture_status"
      fi
    fi

    node scripts/e2e/lib/plugins/assertions.mjs clawhub-preflight

    run_plugins_marketingclaw_logged install-clawhub plugins install "$CLAWHUB_PLUGIN_SPEC"
    run_plugins_marketingclaw_capture "$MARKETINGCLAW_PLUGINS_TMP_DIR/plugins-clawhub-installed.json" plugins list --json
    run_plugins_marketingclaw_capture "$MARKETINGCLAW_PLUGINS_TMP_DIR/plugins-clawhub-inspect.json" plugins inspect "$CLAWHUB_PLUGIN_ID" --json

    node scripts/e2e/lib/plugins/assertions.mjs clawhub-installed

    marketingclaw_e2e_maybe_timeout "$MARKETINGCLAW_PLUGINS_CLI_TIMEOUT" node "$MARKETINGCLAW_ENTRY" plugins update "$CLAWHUB_PLUGIN_ID" >"$MARKETINGCLAW_PLUGINS_TMP_DIR/plugins-clawhub-update.log" 2>&1
    run_plugins_marketingclaw_capture "$MARKETINGCLAW_PLUGINS_TMP_DIR/plugins-clawhub-updated.json" plugins list --json
    run_plugins_marketingclaw_capture "$MARKETINGCLAW_PLUGINS_TMP_DIR/plugins-clawhub-updated-inspect.json" plugins inspect "$CLAWHUB_PLUGIN_ID" --json

    node scripts/e2e/lib/plugins/assertions.mjs clawhub-updated

    run_plugins_marketingclaw_logged uninstall-clawhub plugins uninstall "$CLAWHUB_PLUGIN_SPEC" --force
    run_plugins_marketingclaw_capture "$MARKETINGCLAW_PLUGINS_TMP_DIR/plugins-clawhub-uninstalled.json" plugins list --json

    node scripts/e2e/lib/plugins/assertions.mjs clawhub-removed
  fi
}
