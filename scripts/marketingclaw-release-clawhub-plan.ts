#!/usr/bin/env -S node --import tsx
// MarketingClaw release ClawHub plan CLI emits release workflow routing as JSON.

import { pathToFileURL } from "node:url";
import {
  buildMarketingClawReleaseClawHubPlan,
  parseMarketingClawReleaseClawHubPlanArgs,
} from "./lib/marketingclaw-release-clawhub-plan.ts";

if (import.meta.url === pathToFileURL(process.argv[1] ?? "").href) {
  const args = parseMarketingClawReleaseClawHubPlanArgs(process.argv.slice(2));
  const plan = await buildMarketingClawReleaseClawHubPlan(args);
  console.log(JSON.stringify(plan, null, 2));
}
