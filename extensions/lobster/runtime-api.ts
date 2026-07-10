// Lobster API module exposes the plugin public contract.
export { definePluginEntry } from "marketingclaw/plugin-sdk/core";
export type {
  AnyAgentTool,
  MarketingClawPluginApi,
  MarketingClawPluginToolContext,
  MarketingClawPluginToolFactory,
} from "marketingclaw/plugin-sdk/core";
export {
  applyWindowsSpawnProgramPolicy,
  materializeWindowsSpawnProgram,
  resolveWindowsSpawnProgramCandidate,
} from "marketingclaw/plugin-sdk/windows-spawn";
