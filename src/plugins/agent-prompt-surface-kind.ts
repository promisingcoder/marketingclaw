// Normalizes agent prompt surface kinds advertised by plugins.
import type { AgentPromptSurfaceKind } from "./types.js";

/** Normalizes legacy prompt surface names to current MarketingClaw surface names. */
export function normalizeAgentPromptSurfaceKind(
  surface: AgentPromptSurfaceKind,
): AgentPromptSurfaceKind {
  return surface === "pi_main" ? "marketingclaw_main" : surface;
}

/** True when a prompt surface targets the main MarketingClaw prompt. */
export function isMarketingClawMainPromptSurface(surface: AgentPromptSurfaceKind): boolean {
  return normalizeAgentPromptSurfaceKind(surface) === "marketingclaw_main";
}
