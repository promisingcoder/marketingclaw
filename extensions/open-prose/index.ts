// Open Prose plugin entrypoint registers its MarketingClaw integration.
import { definePluginEntry, type MarketingClawPluginApi } from "./runtime-api.js";

export default definePluginEntry({
  id: "open-prose",
  name: "OpenProse",
  description: "Plugin-shipped prose skills bundle",
  register(_api: MarketingClawPluginApi) {
    // OpenProse is delivered via plugin-shipped skills.
  },
});
