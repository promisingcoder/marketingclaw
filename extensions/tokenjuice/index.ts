// Tokenjuice plugin entrypoint registers its MarketingClaw integration.
import { definePluginEntry } from "marketingclaw/plugin-sdk/plugin-entry";
import { createTokenjuiceAgentToolResultMiddleware } from "./tool-result-middleware.js";

export default definePluginEntry({
  id: "tokenjuice",
  name: "tokenjuice",
  description: "Compacts exec and bash tool results with tokenjuice reducers.",
  register(api) {
    api.registerAgentToolResultMiddleware(createTokenjuiceAgentToolResultMiddleware(), {
      runtimes: ["marketingclaw", "codex"],
    });
  },
});
