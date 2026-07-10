// Mattermost plugin module implements secret input behavior.
export type { SecretInput } from "marketingclaw/plugin-sdk/secret-input";
export {
  buildSecretInputSchema,
  hasConfiguredSecretInput,
  normalizeResolvedSecretInputString,
  normalizeSecretInputString,
} from "marketingclaw/plugin-sdk/secret-input";
