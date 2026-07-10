// Failure output tests cover CLI error formatting and failure summaries.
import { describe, expect, it } from "vitest";
import { formatCliFailureLines } from "./failure-output.js";

describe("formatCliFailureLines", () => {
  it("shows a concise reason and recovery commands by default", () => {
    const lines = formatCliFailureLines({
      title: "Could not start the CLI.",
      error: new Error("config file is invalid"),
      argv: ["node", "marketingclaw", "status"],
      env: {},
    });

    expect(lines).toEqual([
      "[marketingclaw] Could not start the CLI.",
      "[marketingclaw] Reason: config file is invalid",
      "[marketingclaw] Debug: set MARKETINGCLAW_DEBUG=1 to include the stack trace.",
      "[marketingclaw] Try: marketingclaw doctor",
      "[marketingclaw] Help: marketingclaw --help",
    ]);
  });

  it("prints stack details when debug output is requested", () => {
    const lines = formatCliFailureLines({
      title: "The CLI command failed.",
      error: new Error("boom"),
      env: { MARKETINGCLAW_DEBUG: "1" },
    });

    expect(lines.slice(0, 4)).toEqual([
      "[marketingclaw] The CLI command failed.",
      "[marketingclaw] Reason: boom",
      "[marketingclaw] Stack:",
      "[marketingclaw] Error: boom",
    ]);
    expect(lines.join("\n")).toContain("Error: boom");
  });
});
