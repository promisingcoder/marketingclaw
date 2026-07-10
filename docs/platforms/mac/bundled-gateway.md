---
summary: "Gateway runtime on macOS (external launchd service)"
read_when:
  - Packaging MarketingClaw.app
  - Debugging the macOS gateway launchd service
  - Installing the gateway CLI for macOS
title: "Gateway on macOS"
---

MarketingClaw.app does not bundle Node/Bun or the Gateway runtime. The macOS app
expects an **external** `marketingclaw` CLI install, does not spawn the Gateway as
a child process, and manages a per-user launchd service to keep the Gateway
running (or attaches to an already-running local Gateway).

## Automatic setup

On a fresh Mac, choose **This Mac** during onboarding. The app runs its
signed, bundled installer script before the Gateway wizard: it installs a
user-space Node runtime and the matching `marketingclaw` CLI under `~/.marketingclaw`,
then installs and starts the per-user launchd service. This path needs no
Terminal, Homebrew, or administrator access.

The app bundles the installer script only, not the Node or Gateway payload;
setup needs an internet connection to download the runtime and matching
MarketingClaw package.

## Manual recovery

Node 24 is recommended for a manual install; Node 22.19+ also works. Install
`marketingclaw` globally:

```bash
npm install -g marketingclaw@<version>
```

Use **Retry setup** after a failed automatic setup. If that still fails,
install the CLI manually with the command above, then choose **Check again**
in onboarding.

## Launchd (Gateway as LaunchAgent)

Label: `ai.marketingclaw.gateway` (default profile), or `ai.marketingclaw.<profile>`
for a named profile.

Plist location (per-user): `~/Library/LaunchAgents/ai.marketingclaw.gateway.plist`
(or `ai.marketingclaw.<profile>.plist`).

The macOS app owns LaunchAgent install/update for the default profile in
Local mode. The CLI can also install it directly: `marketingclaw gateway install`
(named profiles are selected via the `MARKETINGCLAW_PROFILE` env var).

Behavior:

- "MarketingClaw Active" enables/disables the LaunchAgent.
- Quitting the app does **not** stop the Gateway (launchd keeps it alive).
- If a Gateway is already running on the configured port, the app attaches to
  it instead of starting a new one.

Logging:

- launchd stdout: `~/Library/Logs/marketingclaw/gateway.log` (profiles use
  `gateway-<profile>.log`)
- launchd stderr: suppressed

## Version compatibility

The macOS app checks the Gateway version against its own version. Onboarding
automatically runs managed setup when an existing CLI is missing or
incompatible. Use **Retry setup** to repeat installation, or **Check again**
after repairing an external CLI.

## State directory on macOS

Keep MarketingClaw state on a local, non-synced disk. Avoid iCloud Drive and other
cloud-synced folders; sync latency and file locks can affect sessions,
credentials, and Gateway state.

Set `MARKETINGCLAW_STATE_DIR` to a local path only when you need an override.
`marketingclaw doctor` warns about common cloud-synced state paths and recommends
moving back to local storage. See
[environment variables](/help/environment#path-related-env-vars) and
[Doctor](/gateway/doctor).

## Debug app connectivity

Use the macOS debug CLI from a source checkout to exercise the same Gateway
WebSocket handshake and discovery logic the app uses:

```bash
cd apps/macos
swift run marketingclaw-mac connect --json
swift run marketingclaw-mac discover --timeout 3000 --json
```

`connect` accepts `--url`, `--token`, `--timeout`, `--probe`, and `--json`
(plus client-identity overrides; run with `--help` for the full list).
`discover` accepts `--timeout`, `--json`, and `--include-local`. Compare
discovery output with `marketingclaw gateway discover --json` when you need to
separate CLI discovery from app-side connection issues.

## Smoke check

```bash
marketingclaw --version

MARKETINGCLAW_SKIP_CHANNELS=1 \
MARKETINGCLAW_SKIP_CANVAS_HOST=1 \
marketingclaw gateway --port 18999 --bind loopback
```

Then:

```bash
marketingclaw gateway call health --url ws://127.0.0.1:18999 --timeout 3000
```

## Related

- [macOS app](/platforms/macos)
- [Gateway runbook](/gateway)
