// Private runtime barrel for the bundled Twitch extension.
// Keep this barrel thin and aligned with the local extension surface.

export type {
  ChannelAccountSnapshot,
  ChannelCapabilities,
  ChannelGatewayContext,
  ChannelLogSink,
  ChannelMessageActionAdapter,
  ChannelMessageActionContext,
  ChannelMeta,
  ChannelOutboundAdapter,
  ChannelOutboundContext,
  ChannelResolveKind,
  ChannelResolveResult,
  ChannelStatusAdapter,
} from "marketingclaw/plugin-sdk/channel-contract";
export type { ChannelPlugin } from "marketingclaw/plugin-sdk/channel-core";
export type { OutboundDeliveryResult } from "marketingclaw/plugin-sdk/channel-send-result";
export type { MarketingClawConfig } from "marketingclaw/plugin-sdk/config-contracts";
export type { RuntimeEnv } from "marketingclaw/plugin-sdk/runtime";
export type { WizardPrompter } from "marketingclaw/plugin-sdk/setup";
