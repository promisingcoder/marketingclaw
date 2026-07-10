/**
 * Standalone MCP server for selected built-in MarketingClaw tools.
 *
 * Run via: node --import tsx src/mcp/marketingclaw-tools-serve.ts
 * Or: bun src/mcp/marketingclaw-tools-serve.ts
 */
import { pathToFileURL } from "node:url";
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import type { AnyAgentTool } from "../agents/tools/common.js";
import { createCrestodianTool } from "../agents/tools/crestodian-tool.js";
import type { CrestodianToolOptions } from "../agents/tools/crestodian-tool.js";
import { createCronTool } from "../agents/tools/cron-tool.js";
import { formatErrorMessage } from "../infra/errors.js";
import {
  resolveMarketingClawToolsMcpCrestodianApproval,
  resolveMarketingClawToolsMcpCrestodianSurface,
  resolveMarketingClawToolsMcpToolSelection,
  type MarketingClawToolsMcpToolId,
} from "./marketingclaw-tools-serve-config.js";
import { connectToolsMcpServerToStdio, createToolsMcpServer } from "./tools-stdio-server.js";

export {
  MARKETINGCLAW_TOOLS_MCP_CRESTODIAN_SURFACE_ENV,
  MARKETINGCLAW_TOOLS_MCP_TOOLS_ENV,
} from "./marketingclaw-tools-serve-config.js";

export const MARKETINGCLAW_TOOLS_MCP_AGENT_SESSION_KEY_ENV =
  "MARKETINGCLAW_TOOLS_MCP_AGENT_SESSION_KEY";

export function resolveMarketingClawToolsMcpAgentSessionKey(
  env: NodeJS.ProcessEnv = process.env,
): string | undefined {
  return env[MARKETINGCLAW_TOOLS_MCP_AGENT_SESSION_KEY_ENV]?.trim() || undefined;
}

export function resolveMarketingClawToolsForMcp(
  params: {
    agentSessionKey?: string;
    tools?: MarketingClawToolsMcpToolId[];
    crestodianSurface?: CrestodianToolOptions["surface"];
  } = {},
): AnyAgentTool[] {
  const selection = params.tools ?? resolveMarketingClawToolsMcpToolSelection();
  return selection.map((tool) => {
    if (tool === "crestodian") {
      return createCrestodianTool({
        surface: params.crestodianSurface ?? resolveMarketingClawToolsMcpCrestodianSurface(),
        ...resolveMarketingClawToolsMcpCrestodianApproval(),
      });
    }
    const agentSessionKey = (
      params.agentSessionKey ?? resolveMarketingClawToolsMcpAgentSessionKey()
    )?.trim();
    if (!agentSessionKey) {
      throw new Error(`${MARKETINGCLAW_TOOLS_MCP_AGENT_SESSION_KEY_ENV} is required`);
    }
    return createCronTool({ agentSessionKey, creatorToolAllowlist: [{ name: "cron" }] });
  });
}

function createMarketingClawToolsMcpServer(
  params: {
    tools?: AnyAgentTool[];
  } = {},
): Server {
  const tools = params.tools ?? resolveMarketingClawToolsForMcp();
  return createToolsMcpServer({ name: "marketingclaw-tools", tools });
}

async function serveMarketingClawToolsMcp(): Promise<void> {
  const server = createMarketingClawToolsMcpServer();
  await connectToolsMcpServerToStdio(server);
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? "").href) {
  serveMarketingClawToolsMcp().catch((err: unknown) => {
    process.stderr.write(`marketingclaw-tools-serve: ${formatErrorMessage(err)}\n`);
    process.exit(1);
  });
}
