// Skill tool dispatch tests cover policy-filtered tool surfaces.
import { describe, expect, it, vi } from "vitest";
import type { MarketingClawConfig } from "../../config/types.marketingclaw.js";

type CreateMarketingClawToolsArg = {
  beforeToolCallHookContext?: {
    skillCommand?: { skillFile?: string };
  };
  cronCreatorToolAllowlist?: Array<string | { name: string; pluginId?: string }>;
};

const hoisted = vi.hoisted(() => {
  function makeTool(name: string) {
    return {
      name,
      description: `${name} tool`,
      parameters: { type: "object", properties: {} },
      execute: vi.fn(),
    };
  }
  return {
    createMarketingClawToolsMock: vi.fn((_args: CreateMarketingClawToolsArg) => [
      makeTool("read"),
      makeTool("cron"),
      makeTool("exec"),
    ]),
  };
});

vi.mock("../../agents/marketingclaw-tools.runtime.js", () => ({
  createMarketingClawTools: (args: CreateMarketingClawToolsArg) =>
    hoisted.createMarketingClawToolsMock(args),
}));

import { resolveSkillDispatchTools } from "./tool-dispatch.js";

describe("resolveSkillDispatchTools", () => {
  it("passes final filtered tool surface to cron jobs", () => {
    const tools = resolveSkillDispatchTools({
      message: { surface: "telegram", senderId: "user-1" },
      cfg: {
        tools: { allow: ["read", "cron"] },
      } as MarketingClawConfig,
      agentId: "main",
      sessionKey: "agent:main:telegram:group:restricted-room",
      workspaceDir: "/tmp/marketingclaw-skill-tool-dispatch-test",
      provider: "openai",
      model: "gpt-5.5",
    });

    const args = hoisted.createMarketingClawToolsMock.mock.calls[0]?.[0];
    expect(tools.map((tool) => tool.name)).toEqual(["read", "cron"]);
    expect(args?.cronCreatorToolAllowlist).toEqual([{ name: "read" }, { name: "cron" }]);
  });

  it("carries command skill file identity into tool diagnostics", () => {
    resolveSkillDispatchTools({
      message: { surface: "telegram", senderId: "user-1" },
      cfg: {} as MarketingClawConfig,
      agentId: "main",
      sessionKey: "agent:main:telegram:direct:user-1",
      workspaceDir: "/tmp/marketingclaw-skill-tool-dispatch-test",
      provider: "openai",
      model: "gpt-5.5",
      skillCommand: {
        name: "daily-brief",
        skillFile: "/workspace/skills/daily-brief/SKILL.md",
        skillName: "Daily Brief",
        skillSource: "workspace",
        toolName: "read",
      },
    });

    const args = hoisted.createMarketingClawToolsMock.mock.calls.at(-1)?.[0];
    expect(args?.beforeToolCallHookContext?.skillCommand?.skillFile).toBe(
      "/workspace/skills/daily-brief/SKILL.md",
    );
  });
});
