# @marketingclaw/openshell-sandbox

Official NVIDIA OpenShell sandbox backend for MarketingClaw.

This plugin lets MarketingClaw use OpenShell-managed sandboxes with mirrored local workspaces and SSH command execution.

## Install

```bash
marketingclaw plugins install @marketingclaw/openshell-sandbox
```

Restart the Gateway after installing or updating the plugin.

## Configure

Use the OpenShell docs for credentials, workspace mirroring, runtime selection, and troubleshooting:

- https://docs.marketingclaw.ai/gateway/openshell

## Package

- Plugin id: `openshell`
- Package: `@marketingclaw/openshell-sandbox`
- Minimum MarketingClaw host: `2026.5.12-beta.1`
