// Tests for setup-marketing: roster mutation, idempotency, cron specs, brand
// rendering, and command orchestration with injected dependencies.
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { MarketingClawConfig } from "../config/types.js";
import type { CronJobCreate } from "../cron/types.js";
import type { RuntimeEnv } from "../runtime.js";
import {
  applyMarketingRoster,
  buildDefaultCronJobCreates,
  buildRoleAgentEntry,
  DEFAULT_CRON_JOBS,
  MARKETING_ROLES,
  renderBrandMarkdown,
  resolveRoleWorkspaceDir,
  resolveSharedMarketingDir,
  setupMarketingCommand,
  type SetupMarketingDeps,
} from "./setup-marketing.js";

function createRuntime(): RuntimeEnv & {
  log: ReturnType<typeof vi.fn>;
  error: ReturnType<typeof vi.fn>;
  exit: ReturnType<typeof vi.fn>;
} {
  return {
    log: vi.fn(),
    error: vi.fn(),
    exit: vi.fn(),
  } as never;
}

describe("buildRoleAgentEntry", () => {
  it("gives the CMO default:true, delegation allowlist, skills, and identity", () => {
    const cmo = MARKETING_ROLES.find((role) => role.id === "cmo");
    if (!cmo) {
      throw new Error("cmo role missing");
    }
    const entry = buildRoleAgentEntry(cmo, "/state");
    expect(entry.id).toBe("cmo");
    expect(entry.default).toBe(true);
    expect(entry.subagents?.allowAgents).toEqual(["content", "social", "email", "seo", "analyst"]);
    expect(entry.identity).toEqual({ name: "Morgan", emoji: "🧭" });
    expect(entry.skills).toContain("postiz");
    expect(entry.workspace).toBe(path.join("/state", "workspace-cmo"));
    expect(entry.agentDir).toBe(path.join("/state", "agents", "cmo", "agent"));
    // Explicit-heartbeat mode is all-or-nothing: the CMO keeps a heartbeat (at
    // its prior implicit 30m cadence) so it stays scheduled and wake-eligible.
    expect(entry.heartbeat).toEqual({ every: "30m" });
  });

  it("gives the social agent an explicit 12h heartbeat for its mentions-check", () => {
    const social = MARKETING_ROLES.find((role) => role.id === "social");
    if (!social) {
      throw new Error("social role missing");
    }
    const entry = buildRoleAgentEntry(social, "/state");
    expect(entry.heartbeat).toEqual({ every: "12h" });
    expect(entry.default).toBeUndefined();
  });

  it("gives specialists no default flag, no delegation allowlist, and no heartbeat", () => {
    const content = MARKETING_ROLES.find((role) => role.id === "content");
    if (!content) {
      throw new Error("content role missing");
    }
    const entry = buildRoleAgentEntry(content, "/state");
    expect(entry.default).toBeUndefined();
    expect(entry.subagents).toBeUndefined();
    expect(entry.heartbeat).toBeUndefined();
    expect(entry.skills).toEqual(["wordpress", "blog-git", "meme-maker", "summarize"]);
  });
});

describe("applyMarketingRoster", () => {
  it("adds all six agents to an empty config", () => {
    const result = applyMarketingRoster({}, { stateDir: "/state" });
    expect(result.created).toEqual(["cmo", "content", "social", "email", "seo", "analyst"]);
    expect(result.skipped).toEqual([]);
    expect(result.config.agents?.list).toHaveLength(6);
    // CMO is first so it resolves as the default agent.
    expect(result.config.agents?.list?.[0]?.id).toBe("cmo");
  });

  it("is idempotent: a second run adds nothing and keeps the config identical", () => {
    const first = applyMarketingRoster({}, { stateDir: "/state" });
    const second = applyMarketingRoster(first.config, { stateDir: "/state" });
    expect(second.created).toEqual([]);
    expect(second.skipped).toEqual(["cmo", "content", "social", "email", "seo", "analyst"]);
    expect(second.config).toBe(first.config); // no mutation when nothing is created
    expect(second.config.agents?.list).toHaveLength(6);
  });

  it("preserves a pre-existing agent and appends the roster after it", () => {
    const existing: MarketingClawConfig = {
      agents: { list: [{ id: "main", name: "Assistant" }] },
    };
    const result = applyMarketingRoster(existing, { stateDir: "/state" });
    expect(result.config.agents?.list).toHaveLength(7);
    expect(result.config.agents?.list?.[0]?.id).toBe("main");
    expect(result.created).toEqual(["cmo", "content", "social", "email", "seo", "analyst"]);
  });

  it("skips a role whose id already exists (case-insensitive)", () => {
    const existing: MarketingClawConfig = {
      agents: { list: [{ id: "CMO", name: "Custom Morgan" }] },
    };
    const result = applyMarketingRoster(existing, { stateDir: "/state" });
    expect(result.skipped).toContain("cmo");
    expect(result.created).toEqual(["content", "social", "email", "seo", "analyst"]);
    // The user's customized CMO entry is untouched.
    expect(result.config.agents?.list?.[0]).toEqual({ id: "CMO", name: "Custom Morgan" });
  });
});

describe("buildDefaultCronJobCreates", () => {
  it("builds five isolated, announce-delivering agent jobs with stable declaration keys", () => {
    const jobs = buildDefaultCronJobCreates();
    expect(jobs).toHaveLength(5);
    for (const job of jobs) {
      expect(job.sessionTarget).toBe("isolated");
      expect(job.payload.kind).toBe("agentTurn");
      expect(job.delivery).toEqual({ mode: "announce", channel: "last" });
      expect(job.declarationKey).toBe(`marketing:${job.name}`);
      expect(job.schedule.kind).toBe("cron");
    }
    const byName = new Map<string, CronJobCreate>(jobs.map((job) => [job.name, job]));
    expect(byName.get("weekly-content-calendar")?.agentId).toBe("cmo");
    expect(byName.get("daily-queue-reconcile")?.agentId).toBe("social");
    expect(byName.get("weekly-analytics-report")?.agentId).toBe("analyst");
    expect(byName.get("monthly-seo-audit")?.agentId).toBe("seo");
    expect(byName.get("weekly-email-health")?.agentId).toBe("email");
  });

  it("mirrors the DEFAULT_CRON_JOBS schedule expressions", () => {
    const jobs = buildDefaultCronJobCreates();
    for (const spec of DEFAULT_CRON_JOBS) {
      const job = jobs.find((candidate) => candidate.name === spec.name);
      expect(job?.schedule).toEqual({ kind: "cron", expr: spec.cron });
    }
  });
});

describe("renderBrandMarkdown", () => {
  it("substitutes company, site, and audience and derives a UTM source", () => {
    const md = renderBrandMarkdown({
      company: "Acme",
      site: "https://www.acme.com/",
      audience: "b2b saas",
    });
    expect(md).toContain("# BRAND.md — Acme");
    expect(md).toContain("https://www.acme.com/");
    expect(md).toContain("**Primary audience:** b2b saas");
    // utm_source example uses the bare host label.
    expect(md).toContain("`acme`");
  });

  it("falls back to a newsletter UTM source when the site is blank", () => {
    const md = renderBrandMarkdown({ company: "Acme", site: "", audience: "devs" });
    expect(md).toContain("(add your site)");
    expect(md).toContain("`newsletter`");
  });
});

describe("setupMarketingCommand", () => {
  let stateDir = "";

  beforeEach(async () => {
    stateDir = await fs.mkdtemp(path.join(os.tmpdir(), "mc-setup-marketing-"));
  });

  afterEach(async () => {
    if (stateDir) {
      await fs.rm(stateDir, { recursive: true, force: true });
    }
  });

  function createDeps(store: {
    config: MarketingClawConfig;
    writes: MarketingClawConfig[];
    cronCalls: CronJobCreate[][];
  }): SetupMarketingDeps {
    return {
      stateDir,
      createConfigIO: () => ({ configPath: path.join(stateDir, "marketingclaw.json") }),
      readConfig: async () => ({ exists: true, config: store.config }),
      replaceConfigFile: async ({ nextConfig }) => {
        store.config = nextConfig;
        store.writes.push(nextConfig);
      },
      ensureAgentWorkspace: vi.fn(async ({ dir }) => ({ dir })),
      resolveTemplatesDir: async () => path.join(stateDir, "templates"),
      installCronJobs: async (jobs) => {
        store.cronCalls.push(jobs);
        return { created: jobs.map((job) => job.name), converged: [] };
      },
      gitInit: async () => true,
    };
  }

  it("requires --company and --audience in non-interactive mode", async () => {
    const runtime = createRuntime();
    const store = { config: {} as MarketingClawConfig, writes: [], cronCalls: [] };
    await setupMarketingCommand(
      { nonInteractive: true, site: "acme.com" },
      runtime,
      createDeps(store),
    );
    expect(runtime.exit).toHaveBeenCalledWith(1);
    expect(store.writes).toHaveLength(0);
  });

  it("scaffolds the shared dir, roster, workspaces, and cron on a fresh install", async () => {
    const runtime = createRuntime();
    const store = {
      config: {} as MarketingClawConfig,
      writes: [] as MarketingClawConfig[],
      cronCalls: [] as CronJobCreate[][],
    };
    const deps = createDeps(store);

    await setupMarketingCommand(
      { nonInteractive: true, company: "Acme", site: "acme.com", audience: "b2b saas" },
      runtime,
      deps,
    );

    // Config written once with the full roster.
    expect(store.writes).toHaveLength(1);
    expect(store.config.agents?.list).toHaveLength(6);

    // Social carries its 12h heartbeat; the CMO keeps a heartbeat too so it
    // stays scheduled (and wake-eligible) under explicit-heartbeat mode.
    const socialEntry = store.config.agents?.list?.find((entry) => entry?.id === "social");
    expect(socialEntry?.heartbeat).toEqual({ every: "12h" });
    const cmoEntry = store.config.agents?.list?.find((entry) => entry?.id === "cmo");
    expect(cmoEntry?.heartbeat).toEqual({ every: "30m" });

    // Shared brand dir + BRAND.md created.
    const sharedDir = resolveSharedMarketingDir(stateDir);
    const brand = await fs.readFile(path.join(sharedDir, "BRAND.md"), "utf-8");
    expect(brand).toContain("# BRAND.md — Acme");
    for (const file of ["CAMPAIGNS.md", "CALENDAR.md", "POSTLOG.md"]) {
      await expect(fs.access(path.join(sharedDir, file))).resolves.toBeUndefined();
    }
    await expect(fs.access(path.join(sharedDir, "content", "replies"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(sharedDir, "REPORTS"))).resolves.toBeUndefined();

    // One workspace ensured per agent.
    expect(deps.ensureAgentWorkspace).toHaveBeenCalledTimes(6);

    // Cron installed once with the five default jobs.
    expect(store.cronCalls).toHaveLength(1);
    expect(store.cronCalls[0]).toHaveLength(5);
  });

  it("is idempotent: re-running does not rewrite config or duplicate agents", async () => {
    const runtime = createRuntime();
    const store = {
      config: {} as MarketingClawConfig,
      writes: [] as MarketingClawConfig[],
      cronCalls: [] as CronJobCreate[][],
    };
    const deps = createDeps(store);
    const opts = {
      nonInteractive: true,
      company: "Acme",
      site: "acme.com",
      audience: "b2b saas",
    };

    await setupMarketingCommand(opts, runtime, deps);
    await setupMarketingCommand(opts, runtime, deps);

    // Config written only on the first run; the second run finds all agents present.
    expect(store.writes).toHaveLength(1);
    expect(store.config.agents?.list).toHaveLength(6);
    // Cron install still runs (declarationKey makes it converge, not duplicate).
    expect(store.cronCalls).toHaveLength(2);
  });

  it("routes the workspace overlay through per-role workspace dirs", async () => {
    const runtime = createRuntime();
    const store = {
      config: {} as MarketingClawConfig,
      writes: [] as MarketingClawConfig[],
      cronCalls: [] as CronJobCreate[][],
    };
    const deps = createDeps(store);
    // Seed a role template so the overlay copies at least one file.
    const cmoTemplateDir = path.join(stateDir, "templates", "marketing", "cmo");
    await fs.mkdir(cmoTemplateDir, { recursive: true });
    await fs.writeFile(path.join(cmoTemplateDir, "SOUL.md"), "# CMO soul\n", "utf-8");

    await setupMarketingCommand(
      { nonInteractive: true, company: "Acme", site: "acme.com", audience: "devs" },
      runtime,
      deps,
    );

    const overlaid = await fs.readFile(
      path.join(resolveRoleWorkspaceDir(stateDir, "cmo"), "SOUL.md"),
      "utf-8",
    );
    expect(overlaid).toBe("# CMO soul\n");
  });

  it("overlays the CMO's BOOTSTRAP.md after ensureAgentWorkspace so it survives completion cleanup", async () => {
    const runtime = createRuntime();
    const store = {
      config: {} as MarketingClawConfig,
      writes: [] as MarketingClawConfig[],
      cronCalls: [] as CronJobCreate[][],
    };
    const deps = createDeps(store);
    // Stand in for the real ensureAgentWorkspace, whose bootstrap-completion
    // reconcile deletes a BOOTSTRAP.md once the persona diverges. If the overlay
    // ran before this, the CMO's bootstrap would be gone; overlaying after keeps
    // it.
    deps.ensureAgentWorkspace = vi.fn(async ({ dir }) => {
      await fs.rm(path.join(dir, "BOOTSTRAP.md"), { force: true });
      return { dir };
    });
    // Only the CMO template ships a BOOTSTRAP.md; the overlay must copy it.
    const cmoTemplateDir = path.join(stateDir, "templates", "marketing", "cmo");
    await fs.mkdir(cmoTemplateDir, { recursive: true });
    await fs.writeFile(path.join(cmoTemplateDir, "BOOTSTRAP.md"), "# CMO bootstrap\n", "utf-8");

    await setupMarketingCommand(
      { nonInteractive: true, company: "Acme", site: "acme.com", audience: "devs" },
      runtime,
      deps,
    );

    const overlaid = await fs.readFile(
      path.join(resolveRoleWorkspaceDir(stateDir, "cmo"), "BOOTSTRAP.md"),
      "utf-8",
    );
    expect(overlaid).toBe("# CMO bootstrap\n");

    // A specialist without a BOOTSTRAP.md source is left untouched by the overlay.
    await expect(
      fs.access(path.join(resolveRoleWorkspaceDir(stateDir, "content"), "BOOTSTRAP.md")),
    ).rejects.toThrow();
  });
});
