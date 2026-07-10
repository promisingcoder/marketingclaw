// MarketingClaw MCP tools tests cover core tool server startup and registration.
import { describe, expect, it } from "vitest";
import {
  buildCrestodianToolsMcpServerConfig,
  MARKETINGCLAW_TOOLS_MCP_CRESTODIAN_SURFACE_ENV,
  MARKETINGCLAW_TOOLS_MCP_TOOLS_ENV,
  resolveMarketingClawToolsMcpCrestodianSurface,
  resolveMarketingClawToolsMcpToolSelection,
} from "./marketingclaw-tools-serve-config.js";
import {
  MARKETINGCLAW_TOOLS_MCP_AGENT_SESSION_KEY_ENV,
  resolveMarketingClawToolsForMcp,
  resolveMarketingClawToolsMcpAgentSessionKey,
} from "./marketingclaw-tools-serve.js";
import { createPluginToolsMcpHandlers } from "./plugin-tools-handlers.js";

describe("MarketingClaw tools MCP server", () => {
  it("exposes cron", async () => {
    const handlers = createPluginToolsMcpHandlers(
      resolveMarketingClawToolsForMcp({ agentSessionKey: "agent:worker:main" }),
    );

    const listed = await handlers.listTools();
    expect(listed.tools.map((tool) => tool.name)).toContain("cron");
  });

  it("requires the managed bridge to pass a real agent session key", () => {
    expect(() => resolveMarketingClawToolsForMcp({ agentSessionKey: "" })).toThrow(
      MARKETINGCLAW_TOOLS_MCP_AGENT_SESSION_KEY_ENV,
    );
  });

  it("reads the managed bridge agent session key from env", () => {
    expect(
      resolveMarketingClawToolsMcpAgentSessionKey({
        [MARKETINGCLAW_TOOLS_MCP_AGENT_SESSION_KEY_ENV]: " agent:worker:main ",
      }),
    ).toBe("agent:worker:main");
  });

  it("serves the ring-zero crestodian tool without an agent session key", async () => {
    const handlers = createPluginToolsMcpHandlers(
      resolveMarketingClawToolsForMcp({ tools: ["crestodian"], crestodianSurface: "cli" }),
    );

    const listed = await handlers.listTools();
    expect(listed.tools.map((tool) => tool.name)).toEqual(["crestodian"]);
  });

  it("parses the served tool selection from env and defaults to cron", () => {
    expect(resolveMarketingClawToolsMcpToolSelection({})).toEqual(["cron"]);
    expect(
      resolveMarketingClawToolsMcpToolSelection({
        [MARKETINGCLAW_TOOLS_MCP_TOOLS_ENV]: " crestodian , cron ",
      }),
    ).toEqual(["crestodian", "cron"]);
    expect(() =>
      resolveMarketingClawToolsMcpToolSelection({ [MARKETINGCLAW_TOOLS_MCP_TOOLS_ENV]: "exec" }),
    ).toThrow(MARKETINGCLAW_TOOLS_MCP_TOOLS_ENV);
  });

  it("parses the crestodian surface from env and defaults to cli", () => {
    expect(resolveMarketingClawToolsMcpCrestodianSurface({})).toBe("cli");
    expect(
      resolveMarketingClawToolsMcpCrestodianSurface({
        [MARKETINGCLAW_TOOLS_MCP_CRESTODIAN_SURFACE_ENV]: "gateway",
      }),
    ).toBe("gateway");
    expect(() =>
      resolveMarketingClawToolsMcpCrestodianSurface({
        [MARKETINGCLAW_TOOLS_MCP_CRESTODIAN_SURFACE_ENV]: "remote",
      }),
    ).toThrow(MARKETINGCLAW_TOOLS_MCP_CRESTODIAN_SURFACE_ENV);
  });

  it("builds a crestodian-only stdio server config under the marketingclaw name", () => {
    const config = buildCrestodianToolsMcpServerConfig({ surface: "gateway" });

    expect(Object.keys(config.mcpServers)).toEqual(["marketingclaw"]);
    const server = config.mcpServers.marketingclaw as {
      command?: string;
      args?: string[];
      env?: Record<string, string>;
    };
    expect(server.command).toBe(process.execPath);
    expect(server.args?.at(-1)).toMatch(/marketingclaw-tools-serve\.(js|ts)$/);
    expect(server.env).toEqual({
      [MARKETINGCLAW_TOOLS_MCP_TOOLS_ENV]: "crestodian",
      [MARKETINGCLAW_TOOLS_MCP_CRESTODIAN_SURFACE_ENV]: "gateway",
    });
  });
});
