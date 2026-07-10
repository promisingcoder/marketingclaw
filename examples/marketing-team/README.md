# Marketing team — example config

This is the **end state** that [`marketingclaw setup-marketing`](../../docs/start/marketing-quickstart.md) produces: a flat marketing team of six agents sharing a git-tracked brand directory, with a default publishing schedule.

You don't need to copy this file. Run the command and it scaffolds everything for you:

```bash
marketingclaw setup-marketing --company Acme --site acme.com --audience "b2b saas" --non-interactive
```

`marketingclaw.json` here is a **heavily commented illustration** of the resulting config so you can see the shape and add your own channel bindings. Paths, tokens, and Slack ids are placeholders.

## The team

| Agent     | Name      | Role                                                                                             |
| --------- | --------- | ------------------------------------------------------------------------------------------------ |
| `cmo`     | Morgan 🧭 | Orchestrator + default agent. Owns `CAMPAIGNS.md`/`CALENDAR.md`, delegates via `sessions_spawn`. |
| `content` | Sasha ✍️  | Writes long-form + copy to files. Never publishes.                                               |
| `social`  | Riley 📣  | Publishes/schedules via Postiz + xurl; triages mentions on a heartbeat.                          |
| `email`   | Jordan 📧 | Listmonk newsletters + deliverability. Approval-gated sends.                                     |
| `seo`     | Quinn 🔍  | GSC, keyword research, audits; blog pipeline into WordPress/git.                                 |
| `analyst` | Alex 📊   | GA4 + GSC + platform metrics into `REPORTS/`; weekly insights.                                   |

## What setup-marketing creates

- **Shared brand state** in `~/.marketingclaw/marketing/` (a git repo): `BRAND.md`, `CAMPAIGNS.md`, `CALENDAR.md`, `POSTLOG.md`, plus `content/` and `REPORTS/`.
- **Six agents** in your config, each with its own workspace (`~/.marketingclaw/workspace-<id>`), a role persona, and a skill allowlist.
- **A default cron schedule** (view with `marketingclaw cron list`):
  - `weekly-content-calendar` — Mon 07:00 — CMO drafts next week's calendar.
  - `daily-queue-reconcile` — daily 08:00 — Social schedules approved items into Postiz.
  - `weekly-analytics-report` — Mon 08:00 — Analyst writes the weekly report.
  - `monthly-seo-audit` — 1st 09:00 — SEO runs the audit checklist.
  - `weekly-email-health` — Fri 16:00 — Email checks list health.
- **A social mention-triage heartbeat** (every 12h) for Riley.

## The one rule everyone follows

**Nothing goes to a live audience without approval.** A post, email, or page publishes only when its row in `CALENDAR.md` is `approved` (or later), or a human says so in chat. Drafting, researching, and reporting are always fine.

## Wiring a channel to the team

`setup-marketing` does not touch channels. Once you connect one (for example Slack), route it to an agent with a binding — see the `bindings` and `channels` sections of `marketingclaw.json`. In the example, the team's `#marketing` channel is routed to the CMO, and Slack DMs use pairing so a teammate pairs once and then talks to Morgan.

See the [marketing quickstart](../../docs/start/marketing-quickstart.md) for the full walkthrough.
