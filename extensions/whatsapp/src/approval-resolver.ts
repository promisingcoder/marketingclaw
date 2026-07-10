// Whatsapp plugin module implements approval resolver behavior.
import { resolveApprovalOverGateway } from "marketingclaw/plugin-sdk/approval-gateway-runtime";
import type { ExecApprovalReplyDecision } from "marketingclaw/plugin-sdk/approval-reply-runtime";
import type { MarketingClawConfig } from "marketingclaw/plugin-sdk/config-contracts";
import { isApprovalNotFoundError } from "marketingclaw/plugin-sdk/error-runtime";

export { isApprovalNotFoundError };

export async function resolveWhatsAppApproval(params: {
  cfg: MarketingClawConfig;
  approvalId: string;
  decision: ExecApprovalReplyDecision;
  senderId?: string | null;
  gatewayUrl?: string;
}): Promise<void> {
  await resolveApprovalOverGateway({
    cfg: params.cfg,
    approvalId: params.approvalId,
    decision: params.decision,
    senderId: params.senderId,
    gatewayUrl: params.gatewayUrl,
    clientDisplayName: `WhatsApp approval (${params.senderId?.trim() || "unknown"})`,
  });
}
