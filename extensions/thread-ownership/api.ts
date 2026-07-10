// Thread Ownership API module exposes the plugin public contract.
export type { MarketingClawConfig } from "marketingclaw/plugin-sdk/config-contracts";
export {
  definePluginEntry,
  type MarketingClawPluginApi,
} from "marketingclaw/plugin-sdk/plugin-entry";
export {
  fetchWithSsrFGuard,
  ssrfPolicyFromDangerouslyAllowPrivateNetwork,
} from "marketingclaw/plugin-sdk/ssrf-runtime";
