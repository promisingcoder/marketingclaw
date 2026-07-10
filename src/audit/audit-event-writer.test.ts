import { afterAll, afterEach, describe, expect, it } from "vitest";
import { cleanupTempDirs, makeTempDir } from "../../test/helpers/temp-dir.js";
import {
  closeMarketingClawStateDatabaseForTest,
  MARKETINGCLAW_SQLITE_BUSY_TIMEOUT_MS,
  openMarketingClawStateDatabase,
} from "../state/marketingclaw-state-db.js";
import { listAuditEvents } from "./audit-event-store.js";
import type { AuditEventInput } from "./audit-event-types.js";
import { createAuditEventWriter, testApi } from "./audit-event-writer.js";

const tempDirs: string[] = [];

function input(): AuditEventInput {
  return {
    sourceSequence: 1,
    occurredAt: Date.now(),
    kind: "agent_run",
    action: "agent.run.started",
    status: "started",
    actorType: "agent",
    actorId: "main",
    agentId: "main",
    runId: "run-1",
  };
}

afterEach(() => {
  closeMarketingClawStateDatabaseForTest();
});

afterAll(() => {
  cleanupTempDirs(tempDirs);
});

describe("audit event worker", () => {
  it("keeps shutdown beyond the supported SQLite contention window", () => {
    expect(testApi.auditWriterShutdownTimeoutMs).toBeGreaterThan(
      MARKETINGCLAW_SQLITE_BUSY_TIMEOUT_MS,
    );
  });

  it("returns immediately under SQLite contention and flushes before stop", async () => {
    const stateDir = makeTempDir(tempDirs, "marketingclaw-audit-writer-");
    const database = { env: { MARKETINGCLAW_STATE_DIR: stateDir } };
    const errors: string[] = [];
    const writer = createAuditEventWriter({ stateDir, onError: (error) => errors.push(error) });
    await writer.ready;
    const { db } = openMarketingClawStateDatabase(database);
    db.exec("BEGIN IMMEDIATE");
    const startedAt = performance.now();
    expect(writer.record(input())).toBe(true);
    expect(performance.now() - startedAt).toBeLessThan(250);
    db.exec("ROLLBACK");

    await writer.stop();
    expect(errors).toEqual([]);
    expect(listAuditEvents({ database, limit: 10 }).events).toHaveLength(1);
  });
});
