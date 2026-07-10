// Device Pair API module exposes the plugin public contract.
export {
  approveDevicePairing,
  clearDeviceBootstrapTokens,
  issueDeviceBootstrapToken,
  PAIRING_SETUP_BOOTSTRAP_PROFILE,
  listDevicePairing,
  revokeDeviceBootstrapToken,
  type DeviceBootstrapProfile,
} from "marketingclaw/plugin-sdk/device-bootstrap";
export {
  definePluginEntry,
  type MarketingClawPluginApi,
} from "marketingclaw/plugin-sdk/plugin-entry";
export {
  resolveGatewayBindUrl,
  resolveGatewayPort,
  resolveTailnetHostWithRunner,
  resolveTailscaleServeGatewayUrlsWithRunner,
} from "marketingclaw/plugin-sdk/core";
export { resolveAdvertisedLanHost } from "marketingclaw/plugin-sdk/gateway-runtime";
export {
  resolvePreferredMarketingClawTmpDir,
  runPluginCommandWithTimeout,
} from "marketingclaw/plugin-sdk/sandbox";
export { renderQrPngBase64, renderQrPngDataUrl, writeQrPngTempFile } from "./qr-image.js";
