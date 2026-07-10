# @marketingclaw/pixverse-provider

Official PixVerse video generation provider plugin for MarketingClaw.

This plugin registers PixVerse as a `video_generate` provider for text-to-video and image-to-video workflows.

## Install

```bash
marketingclaw plugins install @marketingclaw/pixverse-provider
```

Restart the Gateway after installing or updating the plugin.

## Configure

Store your PixVerse API key in MarketingClaw config or expose the supported environment variable to the Gateway. Then select PixVerse as a video generation provider.

Full setup and model/provider examples:

- https://docs.marketingclaw.ai/providers/pixverse

## Package

- Plugin id: `pixverse`
- Package: `@marketingclaw/pixverse-provider`
- Minimum MarketingClaw host: `2026.5.26`
