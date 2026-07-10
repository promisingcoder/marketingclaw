// Slack helper module supports config behavior.
export { getRuntimeConfig } from "marketingclaw/plugin-sdk/runtime-config-snapshot";
export { isDangerousNameMatchingEnabled } from "marketingclaw/plugin-sdk/dangerous-name-runtime";
export {
  readSessionUpdatedAt,
  resolveChannelResetConfig,
  resolveSessionKey,
  resolveStorePath,
  updateLastRoute,
} from "marketingclaw/plugin-sdk/session-store-runtime";
export { resolveChannelContextVisibilityMode } from "marketingclaw/plugin-sdk/context-visibility-runtime";
export {
  resolveDefaultGroupPolicy,
  resolveOpenProviderRuntimeGroupPolicy,
  warnMissingProviderGroupPolicyFallbackOnce,
} from "marketingclaw/plugin-sdk/runtime-group-policy";
