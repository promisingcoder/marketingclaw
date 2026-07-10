---
name: gitcrawl
description: "GitHub archive: issue/PR search, sync freshness, duplicate clusters, gh-shim PR status, and Gitcrawl repo work."
metadata:
  marketingclaw:
    homepage: https://github.com/openclaw/gitcrawl
    requires:
      bins:
        - gitcrawl
    install:
      - kind: go
        module: github.com/openclaw/gitcrawl/cmd/gitcrawl@latest
        bins:
          - gitcrawl
---

# Gitcrawl

Use local GitHub issue/PR archives before live GitHub search. Check freshness first:

```bash
gitcrawl doctor --json
```

Find candidates:

```bash
gitcrawl threads marketingclaw/marketingclaw --numbers <issue-or-pr-number> --include-closed --json
gitcrawl neighbors marketingclaw/marketingclaw --number <issue-or-pr-number> --limit 12 --json
gitcrawl search issues "query" -R marketingclaw/marketingclaw --state open --json number,title,url
gitcrawl clusters marketingclaw/marketingclaw --sort size --min-size 5
gitcrawl cluster-detail marketingclaw/marketingclaw --id <cluster-id>
```

For PR triage, start cached and go live only before mutation/merge decisions:

```bash
gitcrawl gh pr status <number-or-url> -R marketingclaw/marketingclaw --compact
gitcrawl gh pr view <number-or-url> -R marketingclaw/marketingclaw --json number,title,state,url,isDraft,headRef,headSha
gitcrawl gh --live pr status <number-or-url> -R marketingclaw/marketingclaw --compact
```

Use live `gh` plus checkout proof before commenting, labeling, closing, reopening, merging, or filing a PR review:

```bash
gh pr view <number> --json number,title,state,mergedAt,body,files,comments,reviews,statusCheckRollup
gh issue view <number> --json number,title,state,body,comments,closedAt
```

Report absolute dates, repo names, issue/PR numbers, cluster ids, and source gaps. Do not close/label from similarity alone; require matching intent plus live verification.
