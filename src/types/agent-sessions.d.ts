// Declares extension points for agent session type augmentation.
export type MarketingClawAgentSessionSkillSourceAugmentation = never;

declare module "marketingclaw/plugin-sdk/agent-sessions" {
  interface Skill {
    // MarketingClaw relies on the source identifier returned by skill loaders.
    source: string;
  }
}
