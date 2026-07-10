---
summary: "Get MarketingClaw installed and run your first chat in minutes."
read_when:
  - First time setup from zero
  - You want the fastest path to a working chat
title: "Getting started"
---

Install MarketingClaw, run onboarding, and chat with your AI assistant in about 5
minutes. By the end you will have a running Gateway, configured auth, and a
working chat session.

## What you need

- **Node.js 22.19+, 23.11+, or 24+** (24 is the recommended default)
- **An API key** from a model provider (Anthropic, OpenAI, Google, etc.) — onboarding will prompt you

<Tip>
Check your Node version with `node --version`. Need to install Node? See [Node setup](/install/node).
**Windows users:** see [Windows](/platforms/windows) for the native Windows Hub companion app.
</Tip>

<Note>
Setting up the full marketing team (the CMO plus specialists)? Follow the
[Marketing quick start](/start/marketing-quickstart) — it covers install, onboarding,
and provisioning the team in one place.
</Note>

## Quick setup

<Steps>
  <Step title="Install from source">
    MarketingClaw runs from a source checkout (a pnpm workspace). Clone it, then
    build:

    ```bash
    git clone https://github.com/promisingcoder/marketingclaw.git
    cd marketingclaw

    pnpm install
    pnpm build && pnpm ui:build
    ```

    From a source checkout, run the CLI with `pnpm marketingclaw <command>`.

    <Note>
    Other runtimes (Docker, Nix) are covered under [Install](/install).
    </Note>

  </Step>
  <Step title="Run onboarding">
    ```bash
    pnpm marketingclaw onboard
    ```

    The wizard walks you through choosing a model provider, setting an API key,
    and configuring the Gateway. QuickStart is usually only a few minutes, but
    provider sign-in, channel pairing, network downloads, skills, or optional
    plugins can make full onboarding take longer. Skip optional steps and return
    later with `pnpm marketingclaw configure`.

    See [Onboarding (CLI)](/start/wizard) for the full reference.

  </Step>
  <Step title="Verify the Gateway is running">
    ```bash
    pnpm marketingclaw gateway status
    ```

    You should see the Gateway listening on port 18789.

  </Step>
  <Step title="Open the dashboard">
    ```bash
    pnpm marketingclaw dashboard
    ```

    This opens the Control UI in your browser. If it loads, everything is working.

  </Step>
  <Step title="Send your first message">
    Type a message in the Control UI chat and you should get an AI reply.

    Want to chat from your phone instead? The fastest channel to set up is
    [Telegram](/channels/telegram) (just a bot token). See [Channels](/channels)
    for all options.

  </Step>
</Steps>

<Accordion title="Advanced: mount a custom Control UI build">
  If you maintain a localized or customized dashboard build, point
  `gateway.controlUi.root` to a directory that contains your built static
  assets and `index.html`.

```bash
mkdir -p "$HOME/.marketingclaw/control-ui-custom"
# Copy your built static files into that directory.
```

Then set:

```json
{
  "gateway": {
    "controlUi": {
      "enabled": true,
      "root": "$HOME/.marketingclaw/control-ui-custom"
    }
  }
}
```

Restart the gateway and reopen the dashboard:

```bash
marketingclaw gateway restart
marketingclaw dashboard
```

</Accordion>

## What to do next

<Columns>
  <Card title="Connect a channel" href="/channels" icon="message-square">
    Discord, Feishu, iMessage, Matrix, Microsoft Teams, Signal, Slack, Telegram, WhatsApp, Zalo, and more.
  </Card>
  <Card title="Pairing and safety" href="/channels/pairing" icon="shield">
    Control who can message your agent.
  </Card>
  <Card title="Configure the Gateway" href="/gateway/configuration" icon="settings">
    Models, tools, sandbox, and advanced settings.
  </Card>
  <Card title="Browse tools" href="/tools" icon="wrench">
    Browser, exec, web search, skills, and plugins.
  </Card>
</Columns>

<Accordion title="Advanced: environment variables">
  If you run MarketingClaw as a service account or want custom paths:

- `MARKETINGCLAW_HOME` — home directory for internal path resolution
- `MARKETINGCLAW_STATE_DIR` — override the state directory
- `MARKETINGCLAW_CONFIG_PATH` — override the config file path

Full reference: [Environment variables](/help/environment).
</Accordion>

## Related

- [Install overview](/install)
- [Channels overview](/channels)
- [Setup](/start/setup)
