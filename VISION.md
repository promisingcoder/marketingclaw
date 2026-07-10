# MarketingClaw Vision

MarketingClaw replaces the marketing department, not the marketer's judgment.

It gives a small company an always-on marketing team that runs on its own hardware:
a CMO agent that owns strategy and delegates, and specialists that execute across
content, social, email, SEO, and analytics. You still decide what the brand stands
for and what is worth doing — the team does the work and shows you every step.

Project overview and setup: [`README.md`](README.md).
Contribution guide: [`CONTRIBUTING.md`](CONTRIBUTING.md).

## What we are building

- **Strategy lives with the CMO.** One orchestrator agent (Morgan) holds the
  campaign plan and the calendar, breaks work down, and delegates to specialists.
- **Execution lives with the specialists.** Content, social, email, SEO, and
  analytics are separate agents with their own workspaces and their own skills.
- **Memory is a file.** `BRAND.md` — voice, audience, products, competitors, UTM
  conventions — is the shared source of truth every agent reads before it acts.
- **Accountability is a diff.** The plan, the calendar, the post log, and the
  reports are plain files. Nothing about what the team decided is hidden in a
  database; you can read it, edit it, and put it under version control.

## Approval-first by default

Nothing goes public without approval. Specialists draft, schedule, and prepare, but
publishing a post, sending a newsletter, or shipping a page waits for an `approved`
status in the calendar or an explicit yes in chat. Security decisions are surfaced,
never hidden behind convenience wrappers.

## Non-goals

- **No spam or automation abuse.** MarketingClaw is a force multiplier for a real
  brand, not a tool for mass unsolicited outreach or platform-rule evasion.
- **No hidden security decisions.** We expose risky settings and defaults; we do not
  paper over them to make onboarding look smoother.
- **No forking the engine.** MarketingClaw is a thin marketing layer on top of the
  upstream gateway and agent runtime. Engine-level fixes go upstream, not into a
  divergent core we have to carry forever.

## Credit

MarketingClaw is a fork of
[github.com/openclaw/openclaw](https://github.com/openclaw/openclaw) (MIT). The
gateway, channels, agent runtime, and companion apps are the upstream project's
work; MarketingClaw adds the marketing team and its onboarding. See
[`THIRD_PARTY_NOTICES.md`](THIRD_PARTY_NOTICES.md) and
[`SECURITY.md`](SECURITY.md).
