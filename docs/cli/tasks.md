---
summary: "CLI reference for `marketingclaw tasks` (background task ledger and Task Flow state)"
read_when:
  - You want to inspect, audit, or cancel background task records
  - You are documenting Task Flow commands under `marketingclaw tasks flow`
title: "`marketingclaw tasks`"
---

Inspect durable background tasks and Task Flow state. With no subcommand,
`marketingclaw tasks` is equivalent to `marketingclaw tasks list`.

See [Background Tasks](/automation/tasks) for the lifecycle and delivery
model, and its `tasks audit` section for full finding descriptions.

## Usage

```bash
marketingclaw tasks
marketingclaw tasks list
marketingclaw tasks list --runtime acp
marketingclaw tasks list --status running
marketingclaw tasks show <lookup>
marketingclaw tasks notify <lookup> state_changes
marketingclaw tasks cancel <lookup>
marketingclaw tasks audit
marketingclaw tasks maintenance
marketingclaw tasks maintenance --apply
marketingclaw tasks flow list
marketingclaw tasks flow show <lookup>
marketingclaw tasks flow cancel <lookup>
```

## Root Options

| Flag               | Description                                                                                        |
| ------------------ | -------------------------------------------------------------------------------------------------- |
| `--json`           | Output JSON.                                                                                       |
| `--runtime <name>` | Filter by kind: `subagent`, `acp`, `cron`, or `cli`.                                               |
| `--status <name>`  | Filter by status: `queued`, `running`, `succeeded`, `failed`, `timed_out`, `cancelled`, or `lost`. |

## Subcommands

### `list`

```bash
marketingclaw tasks list [--runtime <name>] [--status <name>] [--json]
```

Lists tracked background tasks newest first.

### `show`

```bash
marketingclaw tasks show <lookup> [--json]
```

Shows one task by task ID, run ID, or session key.

### `notify`

```bash
marketingclaw tasks notify <lookup> <done_only|state_changes|silent>
```

Changes the notification policy for a running task.

### `cancel`

```bash
marketingclaw tasks cancel <lookup>
```

Cancels a running background task.

### `audit`

```bash
marketingclaw tasks audit [--severity <warn|error>] [--code <name>] [--limit <n>] [--json]
```

Surfaces stale, lost, delivery-failed, or otherwise inconsistent task and
Task Flow records. Lost tasks retained until `cleanupAfter` are warnings;
expired or unstamped lost tasks are errors.

`--code` accepts task codes (`stale_queued`, `stale_running`, `lost`,
`delivery_failed`, `missing_cleanup`, `inconsistent_timestamps`) and Task
Flow codes (`restore_failed`, `stale_waiting`, `stale_blocked`,
`cancel_stuck`, `missing_linked_tasks`, `blocked_task_missing`). See
[Background Tasks](/automation/tasks) for severity and trigger detail per
code.

### `maintenance`

```bash
marketingclaw tasks maintenance [--apply] [--json]
```

Previews or applies task and Task Flow reconciliation, cleanup stamping,
pruning, and stale cron run session registry cleanup.

For cron tasks, reconciliation uses persisted run logs/job state before
marking an old active task `lost`, so completed cron runs do not become
false audit errors just because the in-memory Gateway runtime state is gone.
Offline CLI audit is not authoritative for the Gateway's process-local cron
active-job set. CLI tasks with a run id/source id are marked `lost` when
their live Gateway run context is gone, even if an old child-session row
remains.

When applied, maintenance also prunes `cron:<jobId>:run:<uuid>` session
registry rows older than 7 days while preserving currently running cron
jobs and leaving non-cron session rows untouched.

### `flow`

```bash
marketingclaw tasks flow list [--status <name>] [--json]
marketingclaw tasks flow show <lookup> [--json]
marketingclaw tasks flow cancel <lookup>
```

Inspects or cancels durable Task Flow state under the task ledger.
`flow list --status` accepts `queued`, `running`, `waiting`, `blocked`,
`succeeded`, `failed`, `cancelled`, or `lost`.

## Related

- [CLI reference](/cli)
- [Background tasks](/automation/tasks)
