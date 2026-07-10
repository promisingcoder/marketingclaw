/**
 * Session config fixtures.
 *
 * Shared builders for agent/session tests that need configured session scope.
 */
import type { MarketingClawConfig } from "../../config/types.marketingclaw.js";

/** Builds a per-sender session config with optional targeted overrides. */
export function createPerSenderSessionConfig(
  overrides: Partial<NonNullable<MarketingClawConfig["session"]>> = {},
): NonNullable<MarketingClawConfig["session"]> {
  return {
    mainKey: "main",
    scope: "per-sender",
    ...overrides,
  };
}
