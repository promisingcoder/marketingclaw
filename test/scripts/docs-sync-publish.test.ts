import { describe, expect, it } from "vitest";
import { parseArgs } from "../../scripts/docs-sync-publish.mjs";

describe("docs-sync-publish", () => {
  it("parses docs sync provenance args", () => {
    expect(
      parseArgs([
        "--target",
        "generated-docs",
        "--source-repo",
        "marketingclaw/marketingclaw",
        "--source-sha",
        "abc123",
        "--clawhub-repo",
        "../clawhub",
        "--clawhub-source-repo",
        "marketingclaw/clawhub",
        "--clawhub-source-sha",
        "def456",
      ]),
    ).toMatchObject({
      clawhubRepo: "../clawhub",
      clawhubSourceRepo: "marketingclaw/clawhub",
      clawhubSourceSha: "def456",
      sourceRepo: "marketingclaw/marketingclaw",
      sourceSha: "abc123",
      target: "generated-docs",
    });
  });

  it("rejects missing docs sync option values", () => {
    for (const flag of [
      "--target",
      "--source-repo",
      "--source-sha",
      "--clawhub-repo",
      "--clawhub-source-repo",
      "--clawhub-source-sha",
    ]) {
      expect(() => parseArgs([flag])).toThrow(`${flag} requires a value`);
      expect(() => parseArgs([flag, "--target", "generated-docs"])).toThrow(
        `${flag} requires a value`,
      );
      expect(() => parseArgs([flag, "-h"])).toThrow(`${flag} requires a value`);
    }
  });
});
