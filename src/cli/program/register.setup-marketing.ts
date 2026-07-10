// Registers `marketingclaw setup-marketing`: provisions the marketing team pack
// (shared brand state, six-agent roster, role workspaces, default cron jobs).
import type { Command } from "commander";
import { formatDocsLink } from "../../../packages/terminal-core/src/links.js";
import { theme } from "../../../packages/terminal-core/src/theme.js";
import { runCommandWithRuntime } from "../cli-utils.js";

/** Register the `setup-marketing` command on the root program. */
export function registerSetupMarketingCommand(program: Command): void {
  program
    .command("setup-marketing")
    .description("Provision the marketing team: shared brand state, agents, workspaces, and cron")
    .addHelpText(
      "after",
      () =>
        `\n${theme.heading("Examples:")}\n` +
        `  ${theme.command("marketingclaw setup-marketing")}\n` +
        `    ${theme.muted("Interactively capture your brand, then scaffold the full team.")}\n` +
        `  ${theme.command(
          'marketingclaw setup-marketing --company Acme --site acme.com --audience "b2b saas" --non-interactive',
        )}\n` +
        `    ${theme.muted("Scaffold without prompts (safe to re-run; skips what exists).")}\n\n` +
        `${theme.muted("Docs:")} ${formatDocsLink(
          "/start/marketing-quickstart",
          "docs.marketingclaw.ai/start/marketing-quickstart",
        )}\n`,
    )
    .option("--company <name>", "Company or brand name")
    .option("--site <url>", "Website (used for UTM defaults)")
    .option("--audience <text>", "Primary audience description")
    .option("--non-interactive", "Run without prompts (requires --company and --audience)", false)
    .option("--json", "Output JSON summary", false)
    .action(async (opts) => {
      const { defaultRuntime } = await import("../../runtime.js");
      await runCommandWithRuntime(defaultRuntime, async () => {
        const { setupMarketingCommand } = await import("../../commands/setup-marketing.js");
        await setupMarketingCommand(
          {
            company: opts.company as string | undefined,
            site: opts.site as string | undefined,
            audience: opts.audience as string | undefined,
            nonInteractive: Boolean(opts.nonInteractive),
            json: Boolean(opts.json),
          },
          defaultRuntime,
        );
      });
    });
}
