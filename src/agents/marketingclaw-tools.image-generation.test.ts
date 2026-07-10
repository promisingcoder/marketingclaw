// Verifies image-generation tool registration through the shared generation harness.
import { describeMarketingClawGenerationToolRegistration } from "./marketingclaw-tools.generation.test-support.js";

describeMarketingClawGenerationToolRegistration({
  suiteName: "marketingclaw tools image generation registration",
  toolName: "image_generate",
  toolLabel: "an image-generation tool",
});
