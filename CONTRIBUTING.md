# Contributing to MarketingClaw

Thanks for helping build MarketingClaw — an open-source, self-hosted AI marketing
team. This guide covers how to propose changes and the local checks we expect
before review.

## Quick links

- **GitHub:** https://github.com/promisingcoder/marketingclaw
- **Vision:** [`VISION.md`](VISION.md)
- **Security:** [`SECURITY.md`](SECURITY.md)

## How to contribute

1. **Bugs and small fixes** — open a PR. Link the issue when one exists.
2. **New features or architecture changes** — open a [GitHub issue](https://github.com/promisingcoder/marketingclaw/issues/new/choose)
   first so we can agree on the approach. Many capabilities are a better fit as a
   third-party plugin or a skill than as core changes.
3. **Refactor-only PRs** — please don't, unless a maintainer asked for the refactor
   as part of a concrete fix.
4. **Test/CI-only PRs chasing known `main` failures** — please don't; those are
   already tracked. New regressions not yet visible in CI should be filed as issues.

For agent-authored or otherwise non-trivial work, create or reuse the issue first,
then open the PR against it. Let issue forms, labels, and `.github/CODEOWNERS` route
the work rather than tagging maintainers by hand.

## Before you PR

- Use **Node 24** for source checkouts when possible. MarketingClaw also supports
  **Node 22.19+**, but older Node 22 minors (for example 22.17) are below the engine
  floor and can fail before `pnpm` runs. See [Node install guidance](docs/install/node.md)
  if your local version is too old.
- Run the full local loop: `pnpm build && pnpm check && pnpm test`.
- For extension or plugin changes, run the fast lane first:
  - `pnpm test:extension <extension-name>` (`pnpm test:extension --list` shows valid ids)
  - `pnpm test:contracts` if you changed shared plugin or channel surfaces
- Keep PRs focused: one topic per PR, no unrelated cleanup.
- Describe **what** changed and **why**. Include before/after screenshots for any UI
  or visual change.
- Use American English spelling and grammar in code, comments, docs, and UI strings.
- Do not edit files covered by `CODEOWNERS` security ownership unless a listed owner
  asked for the change or is already reviewing it with you.
- You do not need to edit `CHANGELOG.md`. Maintainers add the changelog entry for
  user-facing changes when a release is cut.

## Control UI decorators

The Control UI uses Lit with **legacy** decorators (current Rollup parsing does not
support the `accessor` fields required for standard decorators). When adding reactive
fields, keep the legacy style:

```ts
@state() foo = "bar";
@property({ type: Number }) count = 0;
```

The root `tsconfig.json` is configured for legacy decorators (`experimentalDecorators: true`)
with `useDefineForClassFields: false`. Avoid flipping these unless you are also
updating the UI build tooling.

## AI-assisted PRs welcome

Built with an AI coding tool? Great — just mark it. In your PR:

- Note that it is AI-assisted in the title or description.
- Include an **Evidence** section with the most useful validation (focused tests, CI
  results, screenshots, terminal output, or logs).
- Confirm you understand what the code does.

Transparency lets reviewers know what to look for. Reviewers still inspect the code,
tests, and CI rather than relying on the PR body alone.

## Maintainers

MarketingClaw is maintained by a small team. If you are an experienced contributor
who wants to help shape its direction through code, docs, or triage, open a few PRs
first, then reach out at nagyyousef323@gmail.com with links to your work and a short
introduction. We add maintainers slowly and deliberately.

## Report a vulnerability

Do not file public issues for security problems. Follow the private disclosure
process in [`SECURITY.md`](SECURITY.md): submit a GitHub Security Advisory on the
fork, or email nagyyousef323@gmail.com if you are unsure where a report belongs.
