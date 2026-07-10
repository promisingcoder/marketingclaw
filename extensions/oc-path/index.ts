// OC Path plugin entrypoint registers its MarketingClaw integration.
import { definePluginEntry } from "marketingclaw/plugin-sdk/plugin-entry";
import { registerOcPathCli } from "./cli-registration.js";

export default definePluginEntry({
  id: "oc-path",
  name: "OC Path",
  description: "Adds the marketingclaw path CLI for oc:// workspace file addressing.",
  register(api) {
    registerOcPathCli(api);
  },
});
