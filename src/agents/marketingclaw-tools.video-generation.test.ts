// Verifies video-generation tool registration through the shared generation harness.
import { describeMarketingClawGenerationToolRegistration } from "./marketingclaw-tools.generation.test-support.js";

describeMarketingClawGenerationToolRegistration({
  suiteName: "marketingclaw tools video generation registration",
  toolName: "video_generate",
  toolLabel: "a video-generation tool",
});
