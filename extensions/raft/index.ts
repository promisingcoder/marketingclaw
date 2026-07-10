// Raft plugin entrypoint registers its MarketingClaw integration.
import { defineBundledChannelEntry } from "marketingclaw/plugin-sdk/channel-entry-contract";

export default defineBundledChannelEntry({
  id: "raft",
  name: "Raft",
  description: "Raft CLI wake bridge channel plugin",
  importMetaUrl: import.meta.url,
  plugin: {
    specifier: "./channel-plugin-api.js",
    exportName: "raftPlugin",
  },
});
