# @marketingclaw/tokenjuice

Official Tokenjuice output compaction plugin for MarketingClaw.

Tokenjuice compacts noisy `exec` and `bash` tool results after commands run, before the result is fed back into the active agent session. It does not rewrite commands, rerun commands, or change exit codes.

## Install

```bash
marketingclaw plugins install @marketingclaw/tokenjuice
```

Restart the Gateway after installing or updating the plugin.

## Enable

```bash
marketingclaw config set plugins.entries.tokenjuice.enabled true
```

Equivalent:

```bash
marketingclaw plugins enable tokenjuice
```

## Docs

- https://docs.marketingclaw.ai/tools/tokenjuice

## Package

- Plugin id: `tokenjuice`
- Package: `@marketingclaw/tokenjuice`
- Minimum MarketingClaw host: `2026.5.28`
