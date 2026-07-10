// Memory Core plugin module implements public artifacts behavior.
import {
  listMemoryHostPublicArtifacts,
  type MemoryPluginPublicArtifact,
} from "marketingclaw/plugin-sdk/memory-host-core";
import type { MarketingClawConfig } from "../api.js";

export async function listMemoryCorePublicArtifacts(params: {
  cfg: MarketingClawConfig;
}): Promise<MemoryPluginPublicArtifact[]> {
  return await listMemoryHostPublicArtifacts(params);
}
