// Diagnostics Otel API module exposes the plugin public contract.
export {
  createChildDiagnosticTraceContext,
  createDiagnosticTraceContext,
  emitDiagnosticEvent,
  formatDiagnosticTraceparent,
  isValidDiagnosticSpanId,
  isValidDiagnosticTraceFlags,
  isValidDiagnosticTraceId,
  onDiagnosticEvent,
  parseDiagnosticTraceparent,
  type DiagnosticEventMetadata,
  type DiagnosticEventPayload,
  type DiagnosticEventPrivateData,
  type DiagnosticTraceContext,
} from "marketingclaw/plugin-sdk/diagnostic-runtime";
export {
  emptyPluginConfigSchema,
  type MarketingClawPluginApi,
} from "marketingclaw/plugin-sdk/plugin-entry";
export type {
  MarketingClawPluginService,
  MarketingClawPluginServiceContext,
} from "marketingclaw/plugin-sdk/plugin-entry";
export { redactSensitiveText } from "marketingclaw/plugin-sdk/security-runtime";
