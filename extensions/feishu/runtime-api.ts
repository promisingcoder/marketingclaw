// Private runtime barrel for the bundled Feishu extension.
// Keep this barrel thin and generic-only.

export type {
  AllowlistMatch,
  AnyAgentTool,
  BaseProbeResult,
  ChannelGroupContext,
  ChannelMessageActionName,
  ChannelMeta,
  ChannelOutboundAdapter,
  ChannelPlugin,
  HistoryEntry,
  MarketingClawConfig,
  MarketingClawPluginApi,
  OutboundIdentity,
  PluginRuntime,
  ReplyPayload,
} from "marketingclaw/plugin-sdk/core";
export type { MarketingClawConfig as ClawdbotConfig } from "marketingclaw/plugin-sdk/core";
export type RuntimeEnv = {
  log: (...args: unknown[]) => void;
  error: (...args: unknown[]) => void;
  exit: (code: number) => void;
};
export type { GroupToolPolicyConfig } from "marketingclaw/plugin-sdk/config-contracts";
export {
  DEFAULT_ACCOUNT_ID,
  buildChannelConfigSchema,
  createActionGate,
  createDedupeCache,
} from "marketingclaw/plugin-sdk/core";
export {
  PAIRING_APPROVED_MESSAGE,
  buildProbeChannelStatusSummary,
  createDefaultChannelRuntimeState,
} from "marketingclaw/plugin-sdk/channel-status";
export { buildAgentMediaPayload } from "marketingclaw/plugin-sdk/agent-media-payload";
export { createChannelPairingController } from "marketingclaw/plugin-sdk/channel-pairing";
export { createReplyPrefixContext } from "marketingclaw/plugin-sdk/channel-outbound";
export {
  evaluateSupplementalContextVisibility,
  filterSupplementalContextItems,
  resolveChannelContextVisibilityMode,
} from "marketingclaw/plugin-sdk/context-visibility-runtime";
export { getSessionEntry } from "marketingclaw/plugin-sdk/session-store-runtime";
export { readJsonFileWithFallback } from "marketingclaw/plugin-sdk/json-store";
export { normalizeAgentId } from "marketingclaw/plugin-sdk/routing";
export { chunkTextForOutbound } from "marketingclaw/plugin-sdk/text-chunking";
export {
  isRequestBodyLimitError,
  readRequestBodyWithLimit,
  requestBodyErrorToText,
} from "marketingclaw/plugin-sdk/webhook-ingress";
export { setFeishuRuntime } from "./src/runtime.js";
