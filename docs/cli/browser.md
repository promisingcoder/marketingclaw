---
summary: "CLI reference for `marketingclaw browser` (lifecycle, profiles, tabs, actions, state, and debugging)"
read_when:
  - You use `marketingclaw browser` and want examples for common tasks
  - You want to control a browser running on another machine via a node host
  - You want to attach to your local signed-in Chrome via Chrome MCP
title: "Browser"
---

# `marketingclaw browser`

Manage MarketingClaw's browser control surface and run browser actions: lifecycle, profiles, tabs, snapshots, screenshots, navigation, input, state emulation, and debugging.

Related: [Browser tool](/tools/browser)

## Common flags

- `--url <gatewayWsUrl>`: Gateway WebSocket URL (defaults to config).
- `--token <token>`: Gateway token (if required).
- `--timeout <ms>`: request timeout in ms (default: `30000`).
- `--expect-final`: wait for a final Gateway response.
- `--browser-profile <name>`: choose a browser profile (default: `marketingclaw`, or `browser.defaultProfile`).
- `--json`: machine-readable output (where supported).

## Quick start (local)

```bash
marketingclaw browser profiles
marketingclaw browser --browser-profile marketingclaw start
marketingclaw browser --browser-profile marketingclaw open https://example.com
marketingclaw browser --browser-profile marketingclaw snapshot
```

Agents can run the same readiness check with `browser({ action: "doctor" })`.

## Quick troubleshooting

If `start` fails with `not reachable after start`, troubleshoot CDP readiness first. If `start` and `tabs` succeed but `open` or `navigate` fails, the browser control plane is healthy and the failure is usually a navigation SSRF policy block.

Minimal sequence:

```bash
marketingclaw browser --browser-profile marketingclaw doctor
marketingclaw browser --browser-profile marketingclaw start
marketingclaw browser --browser-profile marketingclaw tabs
marketingclaw browser --browser-profile marketingclaw open https://example.com
```

Detailed guidance: [Browser troubleshooting](/tools/browser#cdp-startup-failure-vs-navigation-ssrf-block)

## Lifecycle

```bash
marketingclaw browser status
marketingclaw browser doctor
marketingclaw browser doctor --deep
marketingclaw browser start
marketingclaw browser start --headless
marketingclaw browser stop
marketingclaw browser --browser-profile marketingclaw reset-profile
```

- `doctor --deep` adds a live snapshot probe: useful when basic CDP readiness is green but you want proof the current tab can be inspected.
- `stop` closes the active control session and clears temporary emulation overrides even for `attachOnly` and remote CDP profiles where MarketingClaw did not launch the browser process itself. For local managed profiles, `stop` also stops the spawned browser process.
- `start --headless` applies only to that start request, and only when MarketingClaw launches a local managed browser. It does not rewrite `browser.headless` or profile config, and is a no-op for an already-running browser.
- On Linux hosts without `DISPLAY` or `WAYLAND_DISPLAY`, local managed profiles run headless automatically unless `MARKETINGCLAW_BROWSER_HEADLESS=0`, `browser.headless=false`, or `browser.profiles.<name>.headless=false` explicitly requests a visible browser.

## If the command is missing

If `marketingclaw browser` is an unknown command, check `plugins.allow` in `~/.marketingclaw/marketingclaw.json`. When `plugins.allow` is present, list the bundled browser plugin explicitly unless the config already has a root `browser` block:

```json5
{
  plugins: {
    allow: ["telegram", "browser"],
  },
}
```

An explicit root `browser` block (for example `browser.enabled=true` or `browser.profiles.<name>`) also activates the bundled browser plugin under a restrictive plugin allowlist.

Related: [Browser tool](/tools/browser#missing-browser-command-or-tool)

## Profiles

Profiles are named browser routing configs:

- `marketingclaw` (default): launches or attaches to a dedicated MarketingClaw-managed Chrome instance (isolated user data dir).
- `user`: controls your existing signed-in Chrome session via Chrome DevTools MCP.
- custom CDP profiles: point at a local or remote CDP endpoint.

```bash
marketingclaw browser profiles
marketingclaw browser create-profile --name work --color "#FF5A36"
marketingclaw browser create-profile --name chrome-live --driver existing-session
marketingclaw browser create-profile --name remote --cdp-url https://browser-host.example.com
marketingclaw browser delete-profile --name work
```

Use a specific profile with `--browser-profile <name>` on any subcommand, for example `marketingclaw browser --browser-profile work tabs`.

## Tabs

```bash
marketingclaw browser tabs
marketingclaw browser tab new --label docs
marketingclaw browser tab label t1 docs
marketingclaw browser tab select 2
marketingclaw browser tab close 2
marketingclaw browser open https://docs.marketingclaw.ai --label docs
marketingclaw browser focus docs
marketingclaw browser close t1
```

`tabs` returns `suggestedTargetId` first, then the stable `tabId` (such as `t1`), the optional label, and the raw `targetId`. Pass `suggestedTargetId` back into `focus`, `close`, snapshots, and actions. Assign a label with `open --label`, `tab new --label`, or `tab label`; labels, tab ids, raw target ids, and unique target-id prefixes are all accepted. The request field is still named `targetId` for compatibility, but it accepts any of these tab references.

Raw target ids are volatile diagnostic handles, not durable agent memory: when Chromium replaces the underlying raw target during a navigation or form submit, MarketingClaw keeps the stable `tabId`/label attached to the replacement tab when it can prove the match. Prefer `suggestedTargetId`.

## Snapshot / screenshot / actions

Snapshot:

```bash
marketingclaw browser snapshot
marketingclaw browser snapshot --urls
```

Screenshot:

```bash
marketingclaw browser screenshot
marketingclaw browser screenshot --full-page
marketingclaw browser screenshot --ref e12
marketingclaw browser screenshot --labels
```

- `--full-page` is for page captures only; it cannot be combined with `--ref` or `--element`.
- `existing-session` / `user` profiles support page screenshots and `--ref` screenshots from snapshot output, but not CSS `--element` screenshots.
- `--labels` overlays current snapshot refs on the screenshot. On Playwright-backed profiles it works with `--full-page` (full-page overlay), `--ref` (element-clip overlay by ARIA ref), and `--element` (element-clip overlay by CSS selector); in element-clip modes labels are projected relative to the element. The response also includes an `annotations` array (omitted when empty) with each ref's bounding box: `ref`, `number`, `role`, optional `name`, and `box: {x, y, width, height}` in the captured image's coordinate space (viewport / fullpage / element-relative).
  `existing-session` profiles render a chrome-mcp overlay on page screenshots but do not use the Playwright projection helper and do not include `annotations`; CSS `--element` screenshots are unsupported there. Without Playwright or chrome-mcp, labeled screenshots are not available.
- `snapshot --urls` appends discovered link destinations to AI snapshots so agents can choose direct navigation targets instead of guessing from link text alone.

Navigate/click/type (ref-based UI automation):

```bash
marketingclaw browser navigate https://example.com
marketingclaw browser click <ref>
marketingclaw browser click-coords 120 340
marketingclaw browser type <ref> "hello"
marketingclaw browser press Enter
marketingclaw browser hover <ref>
marketingclaw browser scrollintoview <ref>
marketingclaw browser drag <startRef> <endRef>
marketingclaw browser select <ref> OptionA OptionB
marketingclaw browser fill --fields '[{"ref":"1","value":"Ada"}]'
marketingclaw browser wait --text "Done"
marketingclaw browser evaluate --fn '(el) => el.textContent' --ref <ref>
marketingclaw browser evaluate --fn 'const title = document.title; return title;'
marketingclaw browser evaluate --timeout-ms 30000 --fn 'async () => { await window.ready; return true; }'
```

`evaluate --fn` accepts a function source, an expression, or a statement body. Statement bodies are wrapped as async functions, so use `return` for the value you want back. Use `--timeout-ms` when the page-side function may need longer than the default evaluate timeout. `browser.evaluateEnabled=false` (default: `true`) disables both `evaluate` and `wait --fn`.

Action responses return the current raw `targetId` after action-triggered page replacement when MarketingClaw can prove the replacement tab. Scripts should still store and pass `suggestedTargetId`/labels for long-lived workflows.

File + dialog helpers:

```bash
marketingclaw browser upload /tmp/marketingclaw/uploads/file.pdf --ref <ref>
marketingclaw browser upload media://inbound/file.pdf --ref <ref>
marketingclaw browser waitfordownload
marketingclaw browser download <ref> report.pdf
marketingclaw browser dialog --accept
marketingclaw browser dialog --dismiss --dialog-id d1
```

Managed Chrome profiles save ordinary click-triggered downloads into the MarketingClaw downloads directory (`/tmp/marketingclaw/downloads` by default, or the configured temp root). Use `waitfordownload` or `download` when the agent needs to wait for a specific file and return its path; those explicit waiters own the next download. Uploads accept files from the MarketingClaw temp uploads root and MarketingClaw-managed inbound media, including `media://inbound/<id>` and sandbox-relative `media/inbound/<id>` references. Nested media refs, traversal, and arbitrary local paths are rejected.

When an action opens a modal dialog, the action response returns `blockedByDialog` with `browserState.dialogs.pending`; pass `--dialog-id` to answer it directly. Dialogs handled outside MarketingClaw appear under `browserState.dialogs.recent`.

## State and storage

Viewport + emulation:

```bash
marketingclaw browser resize 1280 720
marketingclaw browser set viewport 1280 720
marketingclaw browser set offline on
marketingclaw browser set media dark
marketingclaw browser set timezone Europe/London
marketingclaw browser set locale en-GB
marketingclaw browser set geo 51.5074 -0.1278 --accuracy 25
marketingclaw browser set device "iPhone 14"
marketingclaw browser set headers '{"x-test":"1"}'
marketingclaw browser set credentials myuser mypass
```

Cookies + storage:

```bash
marketingclaw browser cookies
marketingclaw browser cookies set session abc123 --url https://example.com
marketingclaw browser cookies clear
marketingclaw browser storage local get
marketingclaw browser storage local set token abc123
marketingclaw browser storage session clear
```

## Debugging

```bash
marketingclaw browser console --level error
marketingclaw browser pdf
marketingclaw browser responsebody "**/api"
marketingclaw browser highlight <ref>
marketingclaw browser errors --clear
marketingclaw browser requests --filter api
marketingclaw browser trace start
marketingclaw browser trace stop --out trace.zip
```

## Existing Chrome via MCP

Use the built-in `user` profile, or create your own `existing-session` profile:

```bash
marketingclaw browser --browser-profile user tabs
marketingclaw browser create-profile --name chrome-live --driver existing-session
marketingclaw browser create-profile --name brave-live --driver existing-session --user-data-dir "~/Library/Application Support/BraveSoftware/Brave-Browser"
marketingclaw browser create-profile --name chrome-port --driver existing-session --cdp-url http://127.0.0.1:9222
marketingclaw browser --browser-profile chrome-live tabs
```

The default existing-session path is host-only Chrome MCP auto-connect. If the browser is already running with a DevTools endpoint, pass `--cdp-url` so Chrome MCP attaches to that endpoint instead. For Docker, Browserless, or other remote setups where Chrome MCP semantics are not needed, use a CDP profile instead.

Current existing-session limits:

- Snapshot-driven actions use refs, not CSS selectors.
- `browser.actionTimeoutMs` defaults supported `act` requests to 60000 ms when callers omit `timeoutMs`; per-call `timeoutMs` still wins.
- `click` is left-click only.
- `type` does not support `slowly=true`.
- `press` does not support `delayMs`.
- `hover`, `scrollintoview`, `drag`, `select`, `fill`, and `evaluate` reject per-call timeout overrides.
- `select` supports one value only.
- `wait --load networkidle` is not supported (works on managed and raw/remote CDP profiles).
- File uploads require `--ref` / `--input-ref`, do not support CSS `--element`, and support one file at a time.
- Dialog hooks do not support `--timeout`.
- Screenshots support page captures and `--ref`, but not CSS `--element`.
- `responsebody`, download interception, PDF export, and batch actions still require a managed browser or raw CDP profile.

## Remote browser control (node host proxy)

If the Gateway runs on a different machine than the browser, run a **node host** on the machine that has Chrome/Brave/Edge/Chromium. The Gateway proxies browser actions to that node; no separate browser control server is required.

Use `gateway.nodes.browser.mode` to control auto-routing and `gateway.nodes.browser.node` to pin a specific node if multiple are connected.

Security + remote setup: [Browser tool](/tools/browser), [Remote access](/gateway/remote), [Tailscale](/gateway/tailscale), [Security](/gateway/security)

## Related

- [CLI reference](/cli)
- [Browser](/tools/browser)
