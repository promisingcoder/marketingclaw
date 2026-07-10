// Verifies PDF tool factory output is included in MarketingClaw tool registration.
import { describe, expect, it } from "vitest";
import { collectPresentMarketingClawTools } from "./marketingclaw-tools.registration.js";
import { createPdfTool } from "./tools/pdf-tool.js";

describe("createMarketingClawTools PDF registration", () => {
  it("includes the pdf tool when the pdf factory returns a tool", () => {
    const pdfTool = createPdfTool({
      agentDir: "/tmp/marketingclaw-agent-main",
      config: {
        agents: {
          defaults: {
            pdfModel: { primary: "openai/gpt-5.4-mini" },
          },
        },
      },
    });

    expect(pdfTool?.name).toBe("pdf");
    expect(collectPresentMarketingClawTools([pdfTool]).map((tool) => tool.name)).toEqual(["pdf"]);
  });
});
