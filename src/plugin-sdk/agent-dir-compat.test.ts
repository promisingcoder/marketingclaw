/**
 * Tests agent directory compatibility helpers.
 */
import { describe, expect, it } from "vitest";
import { resolveMarketingClawAgentDir } from "./agent-dir-compat.js";

describe("resolveMarketingClawAgentDir", () => {
  it("keeps the shipped Pi env alias for deprecated plugin SDK callers", () => {
    expect(
      resolveMarketingClawAgentDir({
        PI_CODING_AGENT_DIR: "/tmp/marketingclaw-legacy-agent",
      }),
    ).toBe("/tmp/marketingclaw-legacy-agent");
  });

  it("prefers the MarketingClaw env override over the deprecated Pi alias", () => {
    expect(
      resolveMarketingClawAgentDir({
        MARKETINGCLAW_AGENT_DIR: "/tmp/marketingclaw-agent",
        PI_CODING_AGENT_DIR: "/tmp/marketingclaw-legacy-agent",
      }),
    ).toBe("/tmp/marketingclaw-agent");
  });
});
