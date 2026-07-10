// MarketingClaw root resolution imports fs through this facade so tests can replace
// filesystem behavior without mocking node:fs globally.
export { default as marketingClawRootFsSync } from "node:fs";
export { default as marketingClawRootFs } from "node:fs/promises";
