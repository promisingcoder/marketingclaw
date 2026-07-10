// Verifies bundled capability runtime registration from plugin metadata.
import { describe, expect, it } from "vitest";
import { buildVitestCapabilityShimAliasMap } from "./bundled-capability-runtime.js";

describe("buildVitestCapabilityShimAliasMap", () => {
  it("keeps scoped and unscoped capability shim aliases aligned", () => {
    const aliasMap = buildVitestCapabilityShimAliasMap();

    expect(aliasMap["marketingclaw/plugin-sdk/config-runtime"]).toBe(
      aliasMap["@marketingclaw/plugin-sdk/config-runtime"],
    );
    expect(aliasMap["marketingclaw/plugin-sdk/media-runtime"]).toBe(
      aliasMap["@marketingclaw/plugin-sdk/media-runtime"],
    );
    expect(aliasMap["marketingclaw/plugin-sdk/provider-onboard"]).toBe(
      aliasMap["@marketingclaw/plugin-sdk/provider-onboard"],
    );
    expect(aliasMap["marketingclaw/plugin-sdk/speech-core"]).toBe(
      aliasMap["@marketingclaw/plugin-sdk/speech-core"],
    );
  });
});
