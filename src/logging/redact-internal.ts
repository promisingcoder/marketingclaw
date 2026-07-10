import type { MarketingClawConfig } from "../config/types.marketingclaw.js";

type LoggingConfig = MarketingClawConfig["logging"];
type InternalLoggingConfig = NonNullable<LoggingConfig> & {
  [fullContextToolPayloadRedaction]: true;
};

const fullContextToolPayloadRedaction = Symbol("full-context-tool-payload-redaction");

export function withFullContextToolPayloadRedaction(
  loggingConfig: LoggingConfig,
): InternalLoggingConfig {
  return {
    ...loggingConfig,
    [fullContextToolPayloadRedaction]: true,
  };
}

export function isFullContextToolPayloadRedaction(loggingConfig: LoggingConfig): boolean {
  return Boolean(
    (loggingConfig as InternalLoggingConfig | undefined)?.[fullContextToolPayloadRedaction],
  );
}
