/** ACP protocol helpers and MarketingClaw agent identity metadata. */
export { normalizeAcpProvenanceMode } from "@marketingclaw/acp-core/types";
import { VERSION } from "../version.js";

/** ACP agent identity advertised during protocol initialization. */
export const ACP_AGENT_INFO = {
  name: "marketingclaw-acp",
  title: "MarketingClaw ACP Gateway",
  version: VERSION,
};
