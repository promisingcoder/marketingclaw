// Discord type declarations define plugin contracts.
import type { MarketingClawConfig } from "marketingclaw/plugin-sdk/config-contracts";
import type { CommandArgValues } from "marketingclaw/plugin-sdk/native-command-registry";

export type DiscordConfig = NonNullable<MarketingClawConfig["channels"]>["discord"];

export type DiscordCommandArgs = {
  raw?: string;
  values?: CommandArgValues;
};
