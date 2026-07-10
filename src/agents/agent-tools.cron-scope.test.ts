/**
 * Tests cron-triggered tool assembly.
 * Ensures cron runs scope cron tool behavior to self-removal of the current
 * job only.
 */
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { AnyAgentTool } from "./tools/common.js";

const mocks = vi.hoisted(() => {
  const stubTool = (name: string) =>
    ({
      name,
      label: name,
      displaySummary: name,
      description: name,
      parameters: { type: "object", properties: {} },
      execute: vi.fn(),
    }) satisfies AnyAgentTool;

  return {
    createMarketingClawToolsOptions: vi.fn(),
    stubTool,
  };
});

vi.mock("./marketingclaw-tools.js", async (importOriginal) => {
  const actual = await importOriginal<typeof import("./marketingclaw-tools.js")>();
  return {
    createMarketingClawTools: (options: unknown) => {
      mocks.createMarketingClawToolsOptions(options);
      return [mocks.stubTool("cron")];
    },
    filterToolsByClientCaps: actual.filterToolsByClientCaps,
  };
});

import "./test-helpers/fast-bash-tools.js";
import "./test-helpers/fast-coding-tools.js";
import { createMarketingClawCodingTools } from "./agent-tools.js";

function firstMarketingClawToolsOptions(): { cronSelfRemoveOnlyJobId?: string } | undefined {
  return mocks.createMarketingClawToolsOptions.mock.calls[0]?.[0] as
    | { cronSelfRemoveOnlyJobId?: string }
    | undefined;
}

describe("createMarketingClawCodingTools cron scope", () => {
  beforeEach(() => {
    mocks.createMarketingClawToolsOptions.mockClear();
  });

  it("scopes cron-triggered jobs to self-removal", () => {
    const tools = createMarketingClawCodingTools({
      trigger: "cron",
      jobId: "job-current",
    });

    expect(tools.map((tool) => tool.name)).toContain("cron");
    expect(firstMarketingClawToolsOptions()?.cronSelfRemoveOnlyJobId).toBe("job-current");
  });

  it("does not scope non-cron sessions", () => {
    createMarketingClawCodingTools({
      trigger: "user",
      jobId: "job-current",
    });

    expect(firstMarketingClawToolsOptions()?.cronSelfRemoveOnlyJobId).toBeUndefined();
  });
});
