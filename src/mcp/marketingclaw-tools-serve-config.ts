/**
 * Shared contract between the marketingclaw-tools MCP stdio entry and the callers
 * that inject it into CLI harness runs. Keep this module free of MCP SDK and
 * tool-runtime imports so CLI-runner prepare paths can build server configs
 * without loading the server.
 */
import fs from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";
import type { CrestodianToolOptions } from "../agents/tools/crestodian-tool.js";
import { resolveMarketingClawPackageRootSync } from "../infra/marketingclaw-root.js";
import type { BundleMcpConfig } from "../plugins/bundle-mcp.js";

export const MARKETINGCLAW_TOOLS_MCP_TOOLS_ENV = "MARKETINGCLAW_TOOLS_MCP_TOOLS";
export const MARKETINGCLAW_TOOLS_MCP_CRESTODIAN_SURFACE_ENV =
  "MARKETINGCLAW_TOOLS_MCP_CRESTODIAN_SURFACE";
const MARKETINGCLAW_TOOLS_MCP_CRESTODIAN_APPROVAL_ARMED_ENV =
  "MARKETINGCLAW_TOOLS_MCP_CRESTODIAN_APPROVAL_ARMED";
const MARKETINGCLAW_TOOLS_MCP_CRESTODIAN_PROPOSAL_ENV =
  "MARKETINGCLAW_TOOLS_MCP_CRESTODIAN_PROPOSAL";

export const MARKETINGCLAW_TOOLS_MCP_TOOL_IDS = ["cron", "crestodian"] as const;
export type MarketingClawToolsMcpToolId = (typeof MARKETINGCLAW_TOOLS_MCP_TOOL_IDS)[number];

function isMarketingClawToolsMcpToolId(value: string): value is MarketingClawToolsMcpToolId {
  return (MARKETINGCLAW_TOOLS_MCP_TOOL_IDS as readonly string[]).includes(value);
}

/** Parse the served tool selection; the default stays cron for acpx bridges. */
export function resolveMarketingClawToolsMcpToolSelection(
  env: NodeJS.ProcessEnv = process.env,
): MarketingClawToolsMcpToolId[] {
  const raw = env[MARKETINGCLAW_TOOLS_MCP_TOOLS_ENV]?.trim();
  if (!raw) {
    return ["cron"];
  }
  const entries = raw
    .split(",")
    .map((entry) => entry.trim())
    .filter(Boolean);
  const selection = entries.filter(isMarketingClawToolsMcpToolId);
  if (selection.length === 0 || selection.length !== entries.length) {
    throw new Error(
      `${MARKETINGCLAW_TOOLS_MCP_TOOLS_ENV} must be a comma list of: ${MARKETINGCLAW_TOOLS_MCP_TOOL_IDS.join(", ")}`,
    );
  }
  return selection;
}

/** Parse the Crestodian surface for served crestodian tools; defaults to cli. */
export function resolveMarketingClawToolsMcpCrestodianSurface(
  env: NodeJS.ProcessEnv = process.env,
): CrestodianToolOptions["surface"] {
  const raw = env[MARKETINGCLAW_TOOLS_MCP_CRESTODIAN_SURFACE_ENV]?.trim();
  if (!raw || raw === "cli") {
    return "cli";
  }
  if (raw === "gateway") {
    return "gateway";
  }
  throw new Error(`${MARKETINGCLAW_TOOLS_MCP_CRESTODIAN_SURFACE_ENV} must be "cli" or "gateway"`);
}

/**
 * Reconstruct per-turn approval state for the served crestodian tool. The
 * stdio server runs out of process, so the host passes the armed bit and the
 * pending proposal hash through env; the host mirrors transitions back from
 * tool events (see mirrorCrestodianProposalFromToolEvents in agent-turn.ts).
 */
export function resolveMarketingClawToolsMcpCrestodianApproval(
  env: NodeJS.ProcessEnv = process.env,
): {
  approvalArmed: boolean;
  proposalRef: { current?: string };
} {
  const pendingProposal = env[MARKETINGCLAW_TOOLS_MCP_CRESTODIAN_PROPOSAL_ENV]?.trim();
  return {
    approvalArmed: env[MARKETINGCLAW_TOOLS_MCP_CRESTODIAN_APPROVAL_ARMED_ENV]?.trim() === "1",
    proposalRef: pendingProposal ? { current: pendingProposal } : {},
  };
}

function resolveTsxImportSpecifier(): string {
  try {
    return createRequire(import.meta.url).resolve("tsx");
  } catch {
    return "tsx";
  }
}

function resolveMarketingClawToolsServeCommand(): { command: string; args: string[] } {
  const packageRoot = resolveMarketingClawPackageRootSync({
    argv1: process.argv[1],
    moduleUrl: import.meta.url,
    cwd: process.cwd(),
  });
  if (!packageRoot) {
    throw new Error("marketingclaw-tools MCP: could not resolve the MarketingClaw package root");
  }
  const distEntry = path.join(packageRoot, "dist", "mcp", "marketingclaw-tools-serve.js");
  if (fs.existsSync(distEntry)) {
    return { command: process.execPath, args: [distEntry] };
  }
  const sourceEntry = path.join(packageRoot, "src", "mcp", "marketingclaw-tools-serve.ts");
  if (!fs.existsSync(sourceEntry)) {
    throw new Error(`marketingclaw-tools MCP: no serve entry under ${packageRoot}`);
  }
  // Bun executes TypeScript entries directly; Node source checkouts need tsx.
  if (process.versions.bun) {
    return { command: process.execPath, args: [sourceEntry] };
  }
  return {
    command: process.execPath,
    args: ["--import", resolveTsxImportSpecifier(), sourceEntry],
  };
}

/**
 * Crestodian CLI-harness runs get exactly one MCP server: this stdio entry
 * serving the ring-zero crestodian tool. The server keeps the "marketingclaw" name
 * so backend tool pre-approvals (e.g. Claude's --allowedTools mcp__marketingclaw__*)
 * apply without per-backend argument surgery.
 */
export function buildCrestodianToolsMcpServerConfig(
  options: CrestodianToolOptions,
): BundleMcpConfig {
  const entry = resolveMarketingClawToolsServeCommand();
  const pendingProposal = options.proposalRef?.current;
  return {
    mcpServers: {
      marketingclaw: {
        command: entry.command,
        args: entry.args,
        env: {
          [MARKETINGCLAW_TOOLS_MCP_TOOLS_ENV]: "crestodian" satisfies MarketingClawToolsMcpToolId,
          [MARKETINGCLAW_TOOLS_MCP_CRESTODIAN_SURFACE_ENV]: options.surface,
          // Per-turn approval state travels with the per-run MCP config; the
          // host mirrors proposal transitions back from tool events.
          ...(options.approvalArmed === true
            ? { [MARKETINGCLAW_TOOLS_MCP_CRESTODIAN_APPROVAL_ARMED_ENV]: "1" }
            : {}),
          ...(pendingProposal
            ? { [MARKETINGCLAW_TOOLS_MCP_CRESTODIAN_PROPOSAL_ENV]: pendingProposal }
            : {}),
        },
      },
    },
  };
}
