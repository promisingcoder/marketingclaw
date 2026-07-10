/**
 * Browser test-support re-exports from shared plugin-sdk test fixtures.
 */
export {
  createCliRuntimeCapture,
  expectGeneratedTokenPersistedToGatewayAuth,
  type CliMockOutputRuntime,
  type CliRuntimeCapture,
} from "marketingclaw/plugin-sdk/test-fixtures";
export {
  createTempHomeEnv,
  withEnv,
  withEnvAsync,
  withFetchPreconnect,
  isLiveTestEnabled,
} from "marketingclaw/plugin-sdk/test-env";
export type { FetchMock, TempHomeEnv } from "marketingclaw/plugin-sdk/test-env";
export type { MarketingClawConfig } from "marketingclaw/plugin-sdk/config-contracts";
