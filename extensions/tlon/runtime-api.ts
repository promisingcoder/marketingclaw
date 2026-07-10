// Private runtime barrel for the bundled Tlon extension.
// Keep this barrel thin and aligned with the local extension surface.

export type { ReplyPayload } from "marketingclaw/plugin-sdk/reply-runtime";
export type { MarketingClawConfig } from "marketingclaw/plugin-sdk/config-contracts";
export type { RuntimeEnv } from "marketingclaw/plugin-sdk/runtime";
export { createDedupeCache } from "marketingclaw/plugin-sdk/core";
export { createLoggerBackedRuntime } from "./src/logger-runtime.js";
export {
  fetchWithSsrFGuard,
  isBlockedHostnameOrIp,
  ssrfPolicyFromAllowPrivateNetwork,
  ssrfPolicyFromDangerouslyAllowPrivateNetwork,
  type LookupFn,
  type SsrFPolicy,
} from "marketingclaw/plugin-sdk/ssrf-runtime";
export { SsrFBlockedError } from "marketingclaw/plugin-sdk/ssrf-runtime";
