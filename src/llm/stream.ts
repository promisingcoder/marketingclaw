// Streams LLM responses through registered providers and normalizes events.
// This facade owns the process-default AI runtime wiring: it installs the
// MarketingClaw host policy ports and registers built-in providers exactly once,
// before any caller imports the stream API.
import { defaultApiRegistry } from "@marketingclaw/ai/internal/runtime";
import { registerBuiltInApiProviders } from "@marketingclaw/ai/providers";
import "./ai-transport-host.js";

registerBuiltInApiProviders(defaultApiRegistry);

export {
  complete,
  completeSimple,
  getEnvApiKey,
  stream,
  streamSimple,
} from "@marketingclaw/ai/internal/runtime";
