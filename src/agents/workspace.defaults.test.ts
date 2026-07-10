// Workspace default tests cover environment-variable precedence for the
// built-in agent workspace location.
import path from "node:path";
import { describe, expect, it } from "vitest";
import { withEnv } from "../test-utils/env.js";
import { resolveDefaultAgentWorkspaceDir } from "./workspace.js";

describe("DEFAULT_AGENT_WORKSPACE_DIR", () => {
  it("uses MARKETINGCLAW_HOME when resolving the default workspace dir", () => {
    const home = path.join(path.sep, "srv", "marketingclaw-home");

    const resolved = withEnv(
      {
        MARKETINGCLAW_WORKSPACE_DIR: undefined,
        MARKETINGCLAW_PROFILE: undefined,
        MARKETINGCLAW_HOME: home,
        HOME: path.join(path.sep, "home", "other"),
      },
      () => resolveDefaultAgentWorkspaceDir(),
    );

    expect(resolved).toBe(path.join(path.resolve(home), ".marketingclaw", "workspace"));
  });

  it("uses MARKETINGCLAW_WORKSPACE_DIR before MARKETINGCLAW_HOME", () => {
    const workspaceDir = path.join(path.sep, "srv", "marketingclaw-workspace");

    const resolved = withEnv(
      {
        MARKETINGCLAW_WORKSPACE_DIR: workspaceDir,
        MARKETINGCLAW_HOME: path.join(path.sep, "srv", "marketingclaw-home"),
      },
      () => resolveDefaultAgentWorkspaceDir(),
    );

    expect(resolved).toBe(path.resolve(workspaceDir));
  });
});
