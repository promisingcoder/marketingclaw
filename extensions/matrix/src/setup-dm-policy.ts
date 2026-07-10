// Matrix plugin module implements setup dm policy behavior.
import type { DmPolicy } from "marketingclaw/plugin-sdk/config-contracts";
import { addWildcardAllowFrom, normalizeAllowFromEntries } from "marketingclaw/plugin-sdk/setup";
import type { MatrixConfig } from "./types.js";

type MatrixDmAllowFrom = NonNullable<MatrixConfig["dm"]>["allowFrom"];

export function resolveMatrixSetupDmAllowFrom(
  policy: DmPolicy,
  allowFrom: MatrixDmAllowFrom,
): string[] {
  if (policy === "open") {
    return addWildcardAllowFrom(allowFrom);
  }
  return normalizeAllowFromEntries(allowFrom ?? []).filter((entry) => entry !== "*");
}
