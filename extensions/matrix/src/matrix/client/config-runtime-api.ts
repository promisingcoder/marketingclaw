// Matrix API module exposes the plugin public contract.
export {
  DEFAULT_ACCOUNT_ID,
  normalizeAccountId,
  normalizeOptionalAccountId,
} from "marketingclaw/plugin-sdk/account-id";
export {
  isPrivateNetworkOptInEnabled,
  ssrfPolicyFromDangerouslyAllowPrivateNetwork,
} from "marketingclaw/plugin-sdk/ssrf-runtime";
