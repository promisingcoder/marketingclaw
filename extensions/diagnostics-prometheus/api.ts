// Diagnostics Prometheus API module exposes the plugin public contract.
export type {
  DiagnosticEventMetadata,
  DiagnosticEventPayload,
} from "marketingclaw/plugin-sdk/diagnostic-runtime";
export { isInternalDiagnosticEventMetadata } from "marketingclaw/plugin-sdk/diagnostic-runtime";
export {
  emptyPluginConfigSchema,
  type MarketingClawPluginApi,
  type MarketingClawPluginHttpRouteHandler,
  type MarketingClawPluginService,
  type MarketingClawPluginServiceContext,
} from "marketingclaw/plugin-sdk/plugin-entry";
export { redactSensitiveText } from "marketingclaw/plugin-sdk/security-runtime";
