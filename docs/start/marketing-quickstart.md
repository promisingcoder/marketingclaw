---
summary: "Install MarketingClaw from source, onboard, provision the marketing team, and run your first tasks."
read_when:
  - First time setting up the MarketingClaw marketing team
  - You want the fastest path from clone to a working CMO agent
title: "Marketing quick start"
---

Bring up your self-hosted marketing team in a few minutes: install from source,
onboard the Gateway, provision the CMO plus specialists, connect a channel, and hand
the team its first tasks.

## Prerequisites

- **Node.js 22.19+ or 24** (24 is the recommended default). Check with `node --version`.
- **A model API key** from your chosen provider (Anthropic, OpenAI, Google, and
  others). Prefer a current flagship model for the CMO and copywriting work.
- **pnpm** (via `corepack`). MarketingClaw is a pnpm workspace; install from source
  with `pnpm`, not `npm`.

## Set up the team

<Steps>
  <Step title="Clone and build">
    ```bash
    git clone https://github.com/promisingcoder/marketingclaw.git
    cd marketingclaw

    pnpm install
    pnpm build && pnpm ui:build
    ```

  </Step>
  <Step title="Onboard the Gateway">
    ```bash
    pnpm marketingclaw onboard
    ```

    Onboarding walks you through choosing a model provider, setting an API key, and
    configuring the Gateway. It also seeds a marketing-flavored workspace, so a fresh
    install boots with the team's defaults even before the next step.

  </Step>
  <Step title="Provision the marketing team">
    ```bash
    pnpm marketingclaw setup-marketing
    ```

    `setup-marketing` runs a short brand interview — company, site, audience — and
    writes it to `BRAND.md`. It then creates the six-agent roster (Morgan the CMO
    plus Sasha, Riley, Jordan, Quinn, and Alex), each with its own workspace, and
    scaffolds the shared marketing directory. Re-running it is safe: it fills in
    what's missing and leaves your edits alone.

    <Note>
      If you skip `setup-marketing`, `onboard` alone still seeds a marketing-flavored
      workspace with the CMO. You can provision the full team later by running
      `marketingclaw setup-marketing` at any time — it's idempotent — or add
      specialists by hand with `marketingclaw agents add`.
    </Note>

  </Step>
  <Step title="Connect a channel">
    The team is reachable in the built-in WebChat by default. To reach it from a
    messaging app, connect a channel and bind it to the CMO:

    ```bash
    pnpm marketingclaw agents bind --agent cmo --bind <channel[:accountId]>
    ```

    Slack and Telegram are the fastest to set up. See [Channels](/channels) for
    per-channel instructions and [Pairing and safety](/channels/pairing) to control
    who can message the team.

  </Step>
  <Step title="Open the dashboard">
    ```bash
    pnpm marketingclaw gateway
    pnpm marketingclaw dashboard
    ```

    The dashboard opens the Control UI in your browser. Message Morgan (the CMO) and
    the team is ready.

  </Step>
</Steps>

## Run the team on Codex (no API key)

Prefer not to manage a model API key? Point an agent at the Codex CLI instead by
adding a `runtime` block to its entry in `agents.list`:

```json
"runtime": { "type": "acp", "acp": { "agent": "codex" } }
```

This works for the CMO and any specialist, and `sessions_spawn` delegation between
them is fully bridged, so a Codex-backed CMO can still hand off to the rest of the
team. Requires the Codex CLI installed and logged in.

<Note>
  Windows: if the gateway reports `codex app-server exited: Missing optional
  dependency`, point MarketingClaw at your globally-installed Codex binary with the
  `MARKETINGCLAW_CODEX_APP_SERVER_BIN` environment variable.
</Note>

## First tasks to try

Ask Morgan in chat, and she delegates to the right specialist:

- "Draft this week's newsletter."
- "Audit our landing page SEO."
- "Plan next week's content calendar."

The CMO breaks the work down, hands drafts to Sasha, Quinn, or Jordan, and brings
the result back for your approval. Nothing is published or sent without an `approved`
status or an explicit yes from you.

## Where files live

MarketingClaw keeps its state under `~/.marketingclaw/`:

- `~/.marketingclaw/workspace-<id>` — one isolated workspace per agent, where each
  specialist keeps its own prompt files and drafts.
- `~/.marketingclaw/marketing/` — the shared, git-tracked team directory: `BRAND.md`,
  the campaign plan, the content calendar, the post log, and the report archive.

Everything the team decides is a plain file you can open, edit, and put under version
control.

## Next steps

<Columns>
  <Card title="Configuration" href="/gateway/configuration" icon="settings">
    Models, agents, tools, and sandbox settings.
  </Card>
  <Card title="Multi-agent routing" href="/concepts/multi-agent" icon="route">
    How the CMO delegates work to the specialists.
  </Card>
  <Card title="Security" href="/gateway/security" icon="shield">
    Pairing, allowlists, sandboxing, and safe defaults.
  </Card>
  <Card title="Skills" href="/tools/skills" icon="wrench">
    The capabilities the specialists use to publish and report.
  </Card>
</Columns>
