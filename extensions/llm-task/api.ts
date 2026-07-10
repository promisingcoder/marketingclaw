// Llm Task API module exposes the plugin public contract.
export { resolvePreferredMarketingClawTmpDir, withTempWorkspace } from "./src/runtime-api.js";
export {
  definePluginEntry,
  type AnyAgentTool,
  type MarketingClawPluginApi,
} from "marketingclaw/plugin-sdk/plugin-entry";
