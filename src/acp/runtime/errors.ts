/** ACP runtime error exports wired to MarketingClaw secret redaction. */
import { configureAcpErrorRedactor } from "@marketingclaw/acp-core";
import { redactSensitiveText } from "../../logging/redact.js";

// Ensure ACP-core runtime errors use MarketingClaw's secret redaction before re-export.
configureAcpErrorRedactor(redactSensitiveText);

export * from "@marketingclaw/acp-core/runtime/errors";
