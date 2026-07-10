---
summary: "CLI reference for `marketingclaw docs` (search the live docs index)"
read_when:
  - You want to search the live MarketingClaw docs from the terminal
  - You need to know which hosted search API the docs CLI calls
title: "Docs"
---

# `marketingclaw docs`

Search the live MarketingClaw docs index from the terminal.

## Usage

```bash
marketingclaw docs                       # print docs entrypoint and example search
marketingclaw docs <query...>            # search the live docs index
```

| Argument     | Description                                                                        |
| ------------ | ---------------------------------------------------------------------------------- |
| `[query...]` | Free-form search query. Multi-word queries are joined with spaces and sent as one. |

With no query, `marketingclaw docs` prints the docs entrypoint URL and a sample search command instead of running a search.

## Examples

```bash
marketingclaw docs browser existing-session
marketingclaw docs sandbox allowHostControl
marketingclaw docs gateway token secretref
```

## How it works

`marketingclaw docs` calls `https://docs.marketingclaw.ai/api/search` and renders the JSON results. The search request uses a fixed 30 second timeout.

## Output

In a rich (TTY) terminal, results render as a heading followed by a bullet list: page title, linked docs URL, and a short snippet on the next line. Empty results print "No results.".

In non-rich output (piped, `--no-color`, scripts), the same data renders as Markdown:

```markdown
# Docs search: <query>

- [Title](https://docs.marketingclaw.ai/...) - snippet
- [Title](https://docs.marketingclaw.ai/...) - snippet
```

## Exit codes

| Code | Meaning                                                                  |
| ---- | ------------------------------------------------------------------------ |
| `0`  | Search succeeded, including zero-result responses.                       |
| `1`  | The hosted docs search API call failed; stderr prints the error message. |

## Related

- [CLI reference](/cli)
- [Live docs](https://docs.marketingclaw.ai)
