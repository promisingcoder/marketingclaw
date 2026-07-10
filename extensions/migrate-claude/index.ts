// Migrate Claude plugin entrypoint registers its MarketingClaw integration.
import { definePluginEntry } from "marketingclaw/plugin-sdk/plugin-entry";
import { buildClaudeMigrationProvider } from "./provider.js";

export default definePluginEntry({
  id: "migrate-claude",
  name: "Claude Migration",
  description: "Imports Claude state into MarketingClaw.",
  register(api) {
    api.registerMigrationProvider(buildClaudeMigrationProvider({ runtime: api.runtime }));
  },
});
