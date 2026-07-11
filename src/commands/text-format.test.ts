// Text format tests cover command-facing shortening helpers.
import { describe, expect, it } from "vitest";
import { shortenText } from "./text-format.js";

describe("shortenText", () => {
  it("returns original text when it fits", () => {
    expect(shortenText("marketingclaw", 16)).toBe("marketingclaw");
  });

  it("truncates and appends ellipsis when over limit", () => {
    expect(shortenText("marketingclaw-status-output", 15)).toBe("marketingclaw-…");
  });

  it("returns an empty string for non-positive limits", () => {
    expect(shortenText("marketingclaw", 0)).toBe("");
    expect(shortenText("marketingclaw", -1)).toBe("");
  });

  it("counts multi-byte characters correctly", () => {
    expect(shortenText("hello🙂world", 7)).toBe("hello🙂…");
  });
});
