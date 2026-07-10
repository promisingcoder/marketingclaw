// Hook frontmatter tests cover hook metadata parsing from hook files.
import { describe, expect, it } from "vitest";
import {
  parseFrontmatter,
  resolveMarketingClawMetadata,
  resolveHookInvocationPolicy,
} from "./frontmatter.js";
import type { MarketingClawHookMetadata } from "./types.js";

function requireString(value: string | undefined, label: string): string {
  if (typeof value !== "string") {
    throw new Error(`expected ${label}`);
  }
  return value;
}

function requireMarketingClawMetadata(
  metadata: MarketingClawHookMetadata | undefined,
): MarketingClawHookMetadata {
  if (!metadata) {
    throw new Error("expected marketingclaw metadata");
  }
  return metadata;
}

describe("parseFrontmatter", () => {
  it("parses single-line key-value pairs", () => {
    const content = `---
name: test-hook
description: "A test hook"
homepage: https://example.com
---

# Test Hook
`;
    const result = parseFrontmatter(content);
    expect(result.name).toBe("test-hook");
    expect(result.description).toBe("A test hook");
    expect(result.homepage).toBe("https://example.com");
  });

  it("handles missing frontmatter", () => {
    const content = "# Just a markdown file";
    const result = parseFrontmatter(content);
    expect(result).toStrictEqual({});
  });

  it("handles unclosed frontmatter", () => {
    const content = `---
name: broken
    `;
    const result = parseFrontmatter(content);
    expect(result).toStrictEqual({});
  });

  it("parses multi-line metadata block with indented JSON", () => {
    const content = `---
name: session-memory
description: "Save session context"
metadata:
  {
    "marketingclaw": {
      "emoji": "💾",
      "events": ["command:new"]
    }
  }
---

# Session Memory Hook
`;
    const result = parseFrontmatter(content);
    expect(result.name).toBe("session-memory");
    expect(result.description).toBe("Save session context");
    const metadata = requireString(result.metadata, "session-memory metadata");

    // Verify the metadata is valid JSON
    const parsed = JSON.parse(metadata);
    expect(parsed.marketingclaw.emoji).toBe("💾");
    expect(parsed.marketingclaw.events).toEqual(["command:new"]);
  });

  it("parses multi-line metadata with complex nested structure", () => {
    const content = `---
name: command-logger
description: "Log all command events"
metadata:
  {
    "marketingclaw":
      {
        "emoji": "📝",
        "events": ["command"],
        "requires": { "config": ["workspace.dir"] },
        "install": [{ "id": "bundled", "kind": "bundled", "label": "Bundled" }]
      }
  }
---
`;
    const result = parseFrontmatter(content);
    expect(result.name).toBe("command-logger");

    const parsed = JSON.parse(requireString(result.metadata, "command-logger metadata"));
    expect(parsed.marketingclaw.emoji).toBe("📝");
    expect(parsed.marketingclaw.events).toEqual(["command"]);
    expect(parsed.marketingclaw.requires.config).toEqual(["workspace.dir"]);
    expect(parsed.marketingclaw.install[0].kind).toBe("bundled");
  });

  it("handles single-line metadata (inline JSON)", () => {
    const content = `---
name: simple-hook
metadata: {"marketingclaw": {"events": ["test"]}}
---
`;
    const result = parseFrontmatter(content);
    expect(result.name).toBe("simple-hook");
    expect(result.metadata).toBe('{"marketingclaw": {"events": ["test"]}}');
  });

  it("handles mixed single-line and multi-line values", () => {
    const content = `---
name: mixed-hook
description: "A hook with mixed values"
homepage: https://example.com
metadata:
  {
    "marketingclaw": {
      "events": ["command:new"]
    }
  }
enabled: true
---
`;
    const result = parseFrontmatter(content);
    expect(result.name).toBe("mixed-hook");
    expect(result.description).toBe("A hook with mixed values");
    expect(result.homepage).toBe("https://example.com");
    expect(requireString(result.metadata, "mixed-hook metadata")).toContain('"command:new"');
    expect(result.enabled).toBe("true");
  });

  it("strips surrounding quotes from values", () => {
    const content = `---
name: "quoted-name"
description: 'single-quoted'
---
`;
    const result = parseFrontmatter(content);
    expect(result.name).toBe("quoted-name");
    expect(result.description).toBe("single-quoted");
  });

  it("handles CRLF line endings", () => {
    const content = "---\r\nname: test\r\ndescription: crlf\r\n---\r\n";
    const result = parseFrontmatter(content);
    expect(result.name).toBe("test");
    expect(result.description).toBe("crlf");
  });

  it("handles CR line endings", () => {
    const content = "---\rname: test\rdescription: cr\r---\r";
    const result = parseFrontmatter(content);
    expect(result.name).toBe("test");
    expect(result.description).toBe("cr");
  });
});

describe("resolveMarketingClawMetadata", () => {
  it("extracts marketingclaw metadata from parsed frontmatter", () => {
    const frontmatter = {
      name: "test-hook",
      metadata: JSON.stringify({
        marketingclaw: {
          emoji: "🔥",
          events: ["command:new", "command:reset"],
          requires: {
            config: ["workspace.dir"],
            bins: ["git"],
          },
        },
      }),
    };

    const result = resolveMarketingClawMetadata(frontmatter);
    const marketingclaw = requireMarketingClawMetadata(result);
    expect(marketingclaw.emoji).toBe("🔥");
    expect(marketingclaw.events).toEqual(["command:new", "command:reset"]);
    expect(marketingclaw.requires?.config).toEqual(["workspace.dir"]);
    expect(marketingclaw.requires?.bins).toEqual(["git"]);
  });

  it("returns undefined when metadata is missing", () => {
    const frontmatter = { name: "no-metadata" };
    const result = resolveMarketingClawMetadata(frontmatter);
    expect(result).toBeUndefined();
  });

  it("returns undefined when marketingclaw key is missing", () => {
    const frontmatter = {
      metadata: JSON.stringify({ other: "data" }),
    };
    const result = resolveMarketingClawMetadata(frontmatter);
    expect(result).toBeUndefined();
  });

  it("returns undefined for invalid JSON", () => {
    const frontmatter = {
      metadata: "not valid json {",
    };
    const result = resolveMarketingClawMetadata(frontmatter);
    expect(result).toBeUndefined();
  });

  it("handles install specs", () => {
    const frontmatter = {
      metadata: JSON.stringify({
        marketingclaw: {
          events: ["command"],
          install: [
            { id: "bundled", kind: "bundled", label: "Bundled with MarketingClaw" },
            { id: "npm", kind: "npm", package: "@openclaw/hook" },
          ],
        },
      }),
    };

    const result = resolveMarketingClawMetadata(frontmatter);
    expect(result?.install).toHaveLength(2);
    expect(result?.install?.[0].kind).toBe("bundled");
    expect(result?.install?.[1].kind).toBe("npm");
    expect(result?.install?.[1].package).toBe("@openclaw/hook");
  });

  it("handles os restrictions", () => {
    const frontmatter = {
      metadata: JSON.stringify({
        marketingclaw: {
          events: ["command"],
          os: ["darwin", "linux"],
        },
      }),
    };

    const result = resolveMarketingClawMetadata(frontmatter);
    expect(result?.os).toEqual(["darwin", "linux"]);
  });

  it("parses real session-memory HOOK.md format", () => {
    // This is the actual format used in the bundled hooks
    const content = `---
name: session-memory
description: "Save session context to memory when /new or /reset command is issued"
homepage: https://docs.marketingclaw.ai/automation/hooks#session-memory
metadata:
  {
    "marketingclaw":
      {
        "emoji": "💾",
        "events": ["command:new", "command:reset"],
        "requires": { "config": ["workspace.dir"] },
        "install": [{ "id": "bundled", "kind": "bundled", "label": "Bundled with MarketingClaw" }],
      },
  }
---

# Session Memory Hook
`;

    const frontmatter = parseFrontmatter(content);
    expect(frontmatter.name).toBe("session-memory");
    expect(requireString(frontmatter.metadata, "session-memory metadata")).toContain(
      '"command:reset"',
    );

    const marketingclaw = requireMarketingClawMetadata(resolveMarketingClawMetadata(frontmatter));
    expect(marketingclaw.emoji).toBe("💾");
    expect(marketingclaw.events).toEqual(["command:new", "command:reset"]);
    expect(marketingclaw.requires?.config).toEqual(["workspace.dir"]);
    expect(marketingclaw.install?.[0].kind).toBe("bundled");
  });

  it("parses YAML metadata map", () => {
    const content = `---
name: yaml-metadata
metadata:
  marketingclaw:
    emoji: disk
    events:
      - command:new
---
`;
    const frontmatter = parseFrontmatter(content);
    const marketingclaw = resolveMarketingClawMetadata(frontmatter);
    expect(marketingclaw?.emoji).toBe("disk");
    expect(marketingclaw?.events).toEqual(["command:new"]);
  });
});

describe("resolveHookInvocationPolicy", () => {
  it("defaults to enabled when missing", () => {
    expect(resolveHookInvocationPolicy({}).enabled).toBe(true);
  });

  it("parses enabled flag", () => {
    expect(resolveHookInvocationPolicy({ enabled: "no" }).enabled).toBe(false);
    expect(resolveHookInvocationPolicy({ enabled: "on" }).enabled).toBe(true);
  });
});
