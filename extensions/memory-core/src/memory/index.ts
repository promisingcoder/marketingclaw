// Memory Core plugin entrypoint registers its MarketingClaw integration.
export { MemoryIndexManager } from "./manager.js";
export type {
  MemoryEmbeddingProbeResult,
  MemorySearchManager,
  MemorySearchResult,
} from "marketingclaw/plugin-sdk/memory-core-host-engine-storage";
export {
  closeAllMemorySearchManagers,
  closeMemorySearchManager,
  getMemorySearchManager,
  type MemorySearchManagerPurpose,
  type MemorySearchManagerResult,
} from "./search-manager.js";
