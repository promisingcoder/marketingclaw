# @marketingclaw/diagnostics-prometheus

Official Prometheus diagnostics exporter for MarketingClaw.

This plugin exposes MarketingClaw Gateway runtime metrics in Prometheus text format for Prometheus, Grafana, VictoriaMetrics, and compatible scrapers.

## Install

```bash
marketingclaw plugins install @marketingclaw/diagnostics-prometheus
```

Restart the Gateway after installing or updating the plugin.

## Configure

Enable the plugin and set the scrape endpoint options in `plugins.entries.diagnostics-prometheus.config`.

The full config surface, metric names, and scrape examples live in the docs:

- https://docs.marketingclaw.ai/gateway/prometheus

## Package

- Plugin id: `diagnostics-prometheus`
- Package: `@marketingclaw/diagnostics-prometheus`
- Minimum MarketingClaw host: `2026.4.25`
