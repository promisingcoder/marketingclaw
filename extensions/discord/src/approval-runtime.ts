// Discord plugin module implements approval runtime behavior.
export {
  isChannelExecApprovalClientEnabledFromConfig,
  matchesApprovalRequestFilters,
  getExecApprovalReplyMetadata,
} from "marketingclaw/plugin-sdk/approval-client-runtime";
export { resolveApprovalApprovers } from "marketingclaw/plugin-sdk/approval-auth-runtime";
export {
  createApproverRestrictedNativeApprovalCapability,
  splitChannelApprovalCapability,
} from "marketingclaw/plugin-sdk/approval-delivery-runtime";
export {
  createChannelApproverDmTargetResolver,
  createChannelNativeOriginTargetResolver,
} from "marketingclaw/plugin-sdk/approval-native-runtime";
