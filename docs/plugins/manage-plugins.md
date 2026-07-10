---
summary: "Quick examples for listing, installing, updating, inspecting, and uninstalling MarketingClaw plugins"
read_when:
  - You want quick plugin list, install, update, inspect, or uninstall examples
  - You want to choose a plugin install source
  - You want the right reference for publishing plugin packages
title: "Manage plugins"
sidebarTitle: "Manage plugins"
doc-schema-version: 1
---

Common plugin management commands. For the full command contract, flags,
source-selection rules, and edge cases, see [`marketingclaw plugins`](/cli/plugins).

Typical workflow: find a package, install it from ClawHub, npm, git, or a
local path, let the managed Gateway auto-restart (or restart it manually),
then verify the plugin's runtime registrations.

## List and search plugins

```bash
marketingclaw plugins list
marketingclaw plugins list --enabled
marketingclaw plugins list --verbose
marketingclaw plugins list --json
marketingclaw plugins search "calendar"
```

`--json` for scripts:

```bash
marketingclaw plugins list --json \
  | jq '.plugins[] | {id, enabled, format, source, dependencyStatus}'
```

`plugins list` is a cold inventory check: what MarketingClaw can discover from
config, manifests, and the persisted plugin registry. It does not prove an
already-running Gateway imported the plugin runtime. JSON output includes
registry diagnostics and each plugin's `dependencyStatus` (whether declared
`dependencies`/`optionalDependencies` resolve on disk).

`plugins search` queries ClawHub for installable plugin packages and prints
an install hint (`marketingclaw plugins install clawhub:<package>`) per result.

## Enable and disable plugins

```bash
marketingclaw plugins enable <plugin-id>
marketingclaw plugins disable <plugin-id>
```

Toggles a plugin's config entry without touching installed files. Some
bundled plugins (bundled model/speech providers, the bundled browser plugin)
are enabled by default; others require `enable` after install.

## Install plugins

```bash
# Search ClawHub for plugin packages.
marketingclaw plugins search "calendar"

# Install from ClawHub.
marketingclaw plugins install clawhub:<package>
marketingclaw plugins install clawhub:<package>@1.2.3
marketingclaw plugins install clawhub:<package>@beta

# Install from npm.
marketingclaw plugins install npm:<package>
marketingclaw plugins install npm:@scope/marketingclaw-plugin@1.2.3
marketingclaw plugins install npm:@marketingclaw/codex

# Install from a local npm-pack artifact.
marketingclaw plugins install npm-pack:<path.tgz>

# Install from git or a local development checkout.
marketingclaw plugins install git:github.com/acme/marketingclaw-plugin@v1.0.0
marketingclaw plugins install ./my-plugin
marketingclaw plugins install --link ./my-plugin
```

Bare package specs install from npm during the launch cutover, unless the
name matches a bundled or official plugin id, in which case MarketingClaw uses
that local/official copy instead. Use `clawhub:`, `npm:`, `git:`, or
`npm-pack:` for deterministic source selection.

Use `--force` only to overwrite an existing install target from a different
source. For routine upgrades of a tracked npm, ClawHub, or hook-pack install,
use `marketingclaw plugins update` instead; `--force` is not supported with
`--link`.

## Restart and inspect

A running managed Gateway with config reload enabled restarts automatically
after installing, updating, or uninstalling plugin code. If the Gateway is
unmanaged or reload is disabled, restart it yourself before checking live
runtime surfaces:

```bash
marketingclaw gateway restart
marketingclaw plugins inspect <plugin-id> --runtime --json
```

`inspect --runtime` loads the plugin module and proves it registered runtime
surfaces (tools, hooks, services, Gateway methods, HTTP routes, plugin-owned
CLI commands). Plain `inspect` and `list` are cold manifest/config/registry
checks only.

## Update plugins

```bash
marketingclaw plugins update <plugin-id>
marketingclaw plugins update <npm-package-or-spec>
marketingclaw plugins update --all
marketingclaw plugins update <plugin-id> --dry-run
```

Passing a plugin id reuses its tracked install spec: stored dist-tags
(`@beta`) and exact pinned versions carry over to later `update <plugin-id>`
runs.

`marketingclaw plugins update --all` is the bulk maintenance path. It still
respects ordinary tracked install specs, but trusted official MarketingClaw
plugin records sync to the current official catalog target instead of
staying pinned to a stale exact official package; when `update.channel` is
`beta`, that sync prefers the beta release line. Use a targeted
`update <plugin-id>` to keep an exact or tagged official spec untouched.

For npm installs, pass an explicit package spec to switch the tracked
record:

```bash
marketingclaw plugins update @scope/marketingclaw-plugin@beta
marketingclaw plugins update @scope/marketingclaw-plugin
```

The second command moves a plugin back to the registry's default release
line when it was previously pinned to an exact version or tag.

See [`marketingclaw plugins`](/cli/plugins#update) for the exact fallback and
pinning rules.

## Uninstall plugins

```bash
marketingclaw plugins uninstall <plugin-id> --dry-run
marketingclaw plugins uninstall <plugin-id>
marketingclaw plugins uninstall <plugin-id> --keep-files
```

Uninstall removes the plugin's config entry, persisted plugin index record,
allow/deny list entries, and linked `plugins.load.paths` entries when
applicable. The managed install directory is removed unless you pass
`--keep-files`. A running managed Gateway restarts automatically when the
uninstall changes plugin source.

In Nix mode (`MARKETINGCLAW_NIX_MODE=1`), plugin install, update, uninstall,
enable, and disable are all disabled; manage those choices in the Nix source
for the install instead.

## Choose a source

| Source      | Use when                                                                     | Example                                                             |
| ----------- | ---------------------------------------------------------------------------- | ------------------------------------------------------------------- |
| ClawHub     | You want MarketingClaw-native discovery, scan summaries, versions, and hints | `marketingclaw plugins install clawhub:<package>`                   |
| git         | You want a branch, tag, or commit from a repository                          | `marketingclaw plugins install git:github.com/<owner>/<repo>@<ref>` |
| local path  | You are developing or testing a plugin on the same machine                   | `marketingclaw plugins install --link ./my-plugin`                  |
| marketplace | You are installing a Claude-compatible marketplace plugin                    | `marketingclaw plugins install <plugin> --marketplace <source>`     |
| npm pack    | You are proving a local package artifact through npm install semantics       | `marketingclaw plugins install npm-pack:<path.tgz>`                 |
| npmjs.com   | You already ship JavaScript packages or need npm dist-tags/private registry  | `marketingclaw plugins install npm:@acme/marketingclaw-plugin`      |

Managed local path installs must be plugin directories or archives. Put
standalone plugin files in `plugins.load.paths` instead of installing them
with `plugins install`.

## Publish plugins

ClawHub is the primary public discovery surface for MarketingClaw plugins. Publish
there when you want users to find plugin metadata, version history, registry
scan results, and install hints before they install.

```bash
npm i -g clawhub
clawhub login
clawhub package publish your-org/your-plugin --dry-run
clawhub package publish your-org/your-plugin
clawhub package publish your-org/your-plugin@v1.0.0
```

Native npm plugins must ship a plugin manifest (`marketingclaw.plugin.json`) plus
`package.json` metadata before publishing:

```json package.json
{
  "name": "@acme/marketingclaw-plugin",
  "version": "1.0.0",
  "type": "module",
  "marketingclaw": {
    "extensions": ["./dist/index.js"]
  }
}
```

```bash
npm publish --access public
marketingclaw plugins install npm:@acme/marketingclaw-plugin
marketingclaw plugins install npm:@acme/marketingclaw-plugin@beta
marketingclaw plugins install npm:@acme/marketingclaw-plugin@1.0.0
```

Use these pages for the full publishing contract instead of treating this
page as the publishing reference:

- [ClawHub publishing](/clawhub/publishing) explains owners, scopes,
  releases, review, package validation, and package transfer.
- [Building plugins](/plugins/building-plugins) shows the full plugin
  package shape (including `marketingclaw.plugin.json`) and first publish
  workflow.
- [Plugin manifest](/plugins/manifest) defines native plugin manifest
  fields.

If the same package is available on both ClawHub and npm, use the explicit
`clawhub:` or `npm:` prefix to force one source.

## Related

- [Plugins](/tools/plugin) - install, configure, restart, and troubleshoot
- [`marketingclaw plugins`](/cli/plugins) - full CLI reference
- [Community plugins](/plugins/community) - public discovery and ClawHub publishing
- [ClawHub](/clawhub/cli) - registry CLI operations
- [Building plugins](/plugins/building-plugins) - create a plugin package
- [Plugin manifest](/plugins/manifest) - manifest and package metadata
