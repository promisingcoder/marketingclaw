// Error output tests cover program-level error display and exit messaging.
import { describe, expect, it } from "vitest";
import { formatCliParseErrorOutput } from "./error-output.js";

describe("formatCliParseErrorOutput", () => {
  it("explains unknown commands with root help and plugin hints", () => {
    const output = formatCliParseErrorOutput("error: unknown command 'wat'\n", {
      argv: ["node", "marketingclaw", "wat"],
    });

    expect(output).toBe(
      'MarketingClaw does not know the command "wat".\nTry: marketingclaw --help\nPlugin command? marketingclaw plugins list\nDocs: https://docs.marketingclaw.ai/cli\n',
    );
  });

  it("suggests close known commands for unknown commands", () => {
    const output = formatCliParseErrorOutput("error: unknown command 'upate'\n", {
      argv: ["node", "marketingclaw", "upate"],
    });

    expect(output).toBe(
      'MarketingClaw does not know the command "upate".\nDid you mean this?\n  marketingclaw update\nTry: marketingclaw --help\nPlugin command? marketingclaw plugins list\nDocs: https://docs.marketingclaw.ai/cli\n',
    );
  });

  it("suggests explicit aliases for common adjacent terminology", () => {
    const output = formatCliParseErrorOutput("error: unknown command 'upgrade'\n", {
      argv: ["node", "marketingclaw", "upgrade"],
    });

    expect(output).toContain("Did you mean this?\n  marketingclaw update\n");
  });

  it("preserves active profile context in command suggestions", () => {
    const originalProfile = process.env.MARKETINGCLAW_PROFILE;
    process.env.MARKETINGCLAW_PROFILE = "work";
    try {
      const output = formatCliParseErrorOutput("error: unknown command 'doctr'\n", {
        argv: ["node", "marketingclaw", "doctr"],
      });

      expect(output).toContain("Did you mean this?\n  marketingclaw --profile work doctor\n");
    } finally {
      if (originalProfile === undefined) {
        delete process.env.MARKETINGCLAW_PROFILE;
      } else {
        process.env.MARKETINGCLAW_PROFILE = originalProfile;
      }
    }
  });

  it("points unknown options at the active command help", () => {
    const output = formatCliParseErrorOutput("error: unknown option '--wat'\n", {
      argv: ["node", "marketingclaw", "channels", "status", "--wat"],
    });

    expect(output).toBe(
      'MarketingClaw does not recognize option "--wat".\nTry: marketingclaw channels status --help\n',
    );
  });

  it("points missing required arguments at command help", () => {
    const output = formatCliParseErrorOutput("error: missing required argument 'name'\n", {
      argv: ["node", "marketingclaw", "plugins", "install"],
    });

    expect(output).toBe(
      'Missing required argument "name".\nTry: marketingclaw plugins install --help\n',
    );
  });
});
