// Migrate Hermes plugin entrypoint registers its MarketingClaw integration.
import { definePluginEntry } from "marketingclaw/plugin-sdk/plugin-entry";
import { buildHermesMigrationProvider } from "./provider.js";

export default definePluginEntry({
  id: "migrate-hermes",
  name: "Hermes Migration",
  description: "Imports Hermes state into MarketingClaw.",
  register(api) {
    api.registerMigrationProvider(buildHermesMigrationProvider({ runtime: api.runtime }));
  },
});
