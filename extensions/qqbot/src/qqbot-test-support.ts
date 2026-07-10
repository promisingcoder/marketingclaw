// Qqbot plugin module implements qqbot test support behavior.
import type { MarketingClawConfig } from "marketingclaw/plugin-sdk/config-contracts";

export function makeQqbotSecretRefConfig(): MarketingClawConfig {
  return {
    channels: {
      qqbot: {
        appId: "123456",
        clientSecret: {
          source: "env",
          provider: "default",
          id: "QQBOT_CLIENT_SECRET",
        },
      },
    },
  } as MarketingClawConfig;
}

export function makeQqbotDefaultAccountConfig(): MarketingClawConfig {
  return {
    channels: {
      qqbot: {
        defaultAccount: "bot2",
        accounts: {
          bot2: { appId: "123456" },
        },
      },
    },
  } as MarketingClawConfig;
}
