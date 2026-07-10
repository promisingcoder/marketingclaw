// Matrix plugin module implements monitor route test support behavior.
export {
  registerSessionBindingAdapter,
  testing,
} from "marketingclaw/plugin-sdk/session-binding-runtime";
export { resolveAgentRoute } from "marketingclaw/plugin-sdk/routing";
export {
  createTestRegistry,
  setActivePluginRegistry,
} from "marketingclaw/plugin-sdk/plugin-test-runtime";
export type { MarketingClawConfig } from "marketingclaw/plugin-sdk/config-contracts";
