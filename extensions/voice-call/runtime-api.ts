// Private runtime barrel for the bundled Voice Call extension.
// Keep this barrel thin and aligned with the local extension surface.

export { definePluginEntry } from "marketingclaw/plugin-sdk/plugin-entry";
export type { MarketingClawPluginApi } from "marketingclaw/plugin-sdk/plugin-entry";
export type { GatewayRequestHandlerOptions } from "marketingclaw/plugin-sdk/gateway-runtime";
export {
  isRequestBodyLimitError,
  readRequestBodyWithLimit,
  requestBodyErrorToText,
} from "marketingclaw/plugin-sdk/webhook-request-guards";
export { fetchWithSsrFGuard, isBlockedHostnameOrIp } from "marketingclaw/plugin-sdk/ssrf-runtime";
export type { SessionEntry } from "marketingclaw/plugin-sdk/session-store-runtime";
export {
  TtsAutoSchema,
  TtsConfigSchema,
  TtsModeSchema,
  TtsProviderSchema,
} from "marketingclaw/plugin-sdk/tts-runtime";
export { sleep } from "marketingclaw/plugin-sdk/runtime-env";
