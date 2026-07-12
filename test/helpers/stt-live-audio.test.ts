// STT live audio tests validate live speech-to-text audio fixtures.
import {
  expectMarketingClawLiveTranscriptMarker,
  normalizeTranscriptForMatch,
  MARKETINGCLAW_LIVE_TRANSCRIPT_MARKER_RE,
} from "marketingclaw/plugin-sdk/provider-test-contracts";
import { describe, expect, it } from "vitest";

describe("normalizeTranscriptForMatch", () => {
  it("normalizes punctuation and common MarketingClaw live transcription variants", () => {
    expect(normalizeTranscriptForMatch("Marketing-Claw integration OK")).toBe(
      "marketingclawintegrationok",
    );
    expect(normalizeTranscriptForMatch("Testing OpenFlaw realtime transcription")).toMatch(
      /open(?:claw|flaw)/,
    );
    expect(normalizeTranscriptForMatch("OpenCore xAI realtime transcription")).toMatch(
      MARKETINGCLAW_LIVE_TRANSCRIPT_MARKER_RE,
    );
    expect(normalizeTranscriptForMatch("OpenCL xAI realtime transcription")).toMatch(
      MARKETINGCLAW_LIVE_TRANSCRIPT_MARKER_RE,
    );
    expectMarketingClawLiveTranscriptMarker("OpenClar integration OK");
  });
});
