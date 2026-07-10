// Shared registration assertions for optional media-generation MarketingClaw tools.
import { describe, expect, it } from "vitest";
import { collectPresentMarketingClawTools } from "./marketingclaw-tools.registration.js";
import { textResult, type AnyAgentTool } from "./tools/common.js";

function stubAgentTool(name: string): AnyAgentTool {
  // Registration tests only need a structurally valid tool.
  return {
    label: name,
    name,
    description: `${name} stub`,
    parameters: { type: "object", properties: {} },
    async execute() {
      return textResult("ok", {});
    },
  };
}

export function describeMarketingClawGenerationToolRegistration(params: {
  suiteName: string;
  toolName: string;
  toolLabel: string;
}) {
  describe(params.suiteName, () => {
    it(`registers ${params.toolName} when ${params.toolLabel} is present`, () => {
      const tool = stubAgentTool(params.toolName);

      expect(collectPresentMarketingClawTools([tool])).toEqual([tool]);
    });

    it(`omits ${params.toolName} when ${params.toolLabel} is absent`, () => {
      expect(collectPresentMarketingClawTools([null]).map((tool) => tool.name)).not.toContain(
        params.toolName,
      );
    });
  });
}
