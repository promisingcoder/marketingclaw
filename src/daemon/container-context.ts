/** Detects whether a daemon was launched by MarketingClaw's container-aware service wrapper. */
import { normalizeOptionalString } from "@marketingclaw/normalization-core/string-coerce";

/** Resolves the daemon container hint exposed by managed service environments. */
export function resolveDaemonContainerContext(
  env: Record<string, string | undefined> = process.env,
): string | null {
  return (
    normalizeOptionalString(env.MARKETINGCLAW_CONTAINER_HINT) ||
    normalizeOptionalString(env.MARKETINGCLAW_CONTAINER) ||
    null
  );
}
