// Loads dotenv files while blocking unsafe workspace env keys.
import path from "node:path";
import { listKnownProviderAuthEnvVarNames } from "../secrets/provider-env-vars.js";
import { loadGlobalRuntimeDotEnvFiles, readDotEnvFile } from "./dotenv-global.js";
import {
  isDangerousHostEnvOverrideVarName,
  isDangerousHostEnvVarName,
  normalizeEnvVarKey,
} from "./host-env-security.js";
import { tryProcessCwd } from "./safe-cwd.js";

const BLOCKED_PROVIDER_AUTH_WORKSPACE_DOTENV_KEYS = [
  "AI_GATEWAY_API_KEY",
  "ANTHROPIC_API_KEY",
  "ANTHROPIC_OAUTH_TOKEN",
  "ARCEEAI_API_KEY",
  "AZURE_OPENAI_API_KEY",
  "AZURE_SPEECH_API_KEY",
  "AZURE_SPEECH_KEY",
  "AZURE_SPEECH_REGION",
  "BRAVE_API_KEY",
  "BYTEPLUS_API_KEY",
  "BYTEPLUS_SEED_SPEECH_API_KEY",
  "CEREBRAS_API_KEY",
  "CHUTES_API_KEY",
  "CHUTES_OAUTH_TOKEN",
  "CLOUDFLARE_AI_GATEWAY_API_KEY",
  "COMFY_API_KEY",
  "COMFY_CLOUD_API_KEY",
  "COPILOT_GITHUB_TOKEN",
  "DASHSCOPE_API_KEY",
  "DEEPGRAM_API_KEY",
  "DEEPINFRA_API_KEY",
  "DEEPSEEK_API_KEY",
  "ELEVENLABS_API_KEY",
  "EXA_API_KEY",
  "FAL_API_KEY",
  "FAL_KEY",
  "FIRECRAWL_API_KEY",
  "FIREWORKS_API_KEY",
  "GEMINI_API_KEY",
  "GH_TOKEN",
  "GITHUB_TOKEN",
  "GOOGLE_API_KEY",
  "GOOGLE_CLOUD_API_KEY",
  "GRADIUM_API_KEY",
  "GROQ_API_KEY",
  "HF_TOKEN",
  "HUGGINGFACE_HUB_TOKEN",
  "INWORLD_API_KEY",
  "KILOCODE_API_KEY",
  "KIMICODE_API_KEY",
  "KIMI_API_KEY",
  "LITELLM_API_KEY",
  "LM_API_TOKEN",
  "MINIMAX_API_KEY",
  "MINIMAX_CODE_PLAN_KEY",
  "MINIMAX_CODING_API_KEY",
  "MINIMAX_OAUTH_TOKEN",
  "MISTRAL_API_KEY",
  "MODELSTUDIO_API_KEY",
  "MOONSHOT_API_KEY",
  "NVIDIA_API_KEY",
  "OLLAMA_API_KEY",
  "OPENAI_API_KEY",
  "OPENCODE_API_KEY",
  "OPENCODE_ZEN_API_KEY",
  "OPENROUTER_API_KEY",
  "PERPLEXITY_API_KEY",
  "QIANFAN_API_KEY",
  "QWEN_API_KEY",
  "RUNWAY_API_KEY",
  "RUNWAYML_API_SECRET",
  "SENSEAUDIO_API_KEY",
  "SGLANG_API_KEY",
  "SPEECH_KEY",
  "SPEECH_REGION",
  "STEPFUN_API_KEY",
  "SYNTHETIC_API_KEY",
  "TAVILY_API_KEY",
  "TOGETHER_API_KEY",
  "TOKENHUB_API_KEY",
  "TOKENPLAN_API_KEY",
  "VENICE_API_KEY",
  "VLLM_API_KEY",
  "VOLCANO_ENGINE_API_KEY",
  "VOLCENGINE_TTS_API_KEY",
  "VOLCENGINE_TTS_APPID",
  "VOLCENGINE_TTS_TOKEN",
  "VOYAGE_API_KEY",
  "VYDRA_API_KEY",
  "XAI_API_KEY",
  "XIAOMI_API_KEY",
  "XI_API_KEY",
  "ZAI_API_KEY",
  "Z_AI_API_KEY",
] as const;

const BLOCKED_WORKSPACE_DOTENV_KEYS = new Set([
  ...BLOCKED_PROVIDER_AUTH_WORKSPACE_DOTENV_KEYS,
  "ALL_PROXY",
  "BROWSER_EXECUTABLE_PATH",
  "CLAWHUB_AUTH_TOKEN",
  "CLAWHUB_CONFIG_PATH",
  "CLAWHUB_TOKEN",
  "CLAWHUB_URL",
  "CLOUDSDK_PYTHON",
  "COMSPEC",
  "HTTP_PROXY",
  "HTTPS_PROXY",
  "HOMEBREW_BREW_FILE",
  "HOMEBREW_PREFIX",
  "IRC_HOST",
  "LOCALAPPDATA",
  "MATTERMOST_URL",
  "MATRIX_HOMESERVER",
  "MINIMAX_API_HOST",
  "NODE_TLS_REJECT_UNAUTHORIZED",
  "NO_PROXY",
  "NPM_CONFIG_PREFIX",
  "NPM_EXECPATH",
  "PNPM_HOME",
  "OPENAI_API_KEYS",
  "MARKETINGCLAW_AGENT_DIR",
  "MARKETINGCLAW_ALLOW_PLUGIN_INSTALL_OVERRIDES",
  "MARKETINGCLAW_ALLOW_INSECURE_PRIVATE_WS",
  "MARKETINGCLAW_ALLOW_PROJECT_LOCAL_BIN",
  "MARKETINGCLAW_BROWSER_EXECUTABLE_PATH",
  "MARKETINGCLAW_BROWSER_CONTROL_MODULE",
  "MARKETINGCLAW_BUNDLED_HOOKS_DIR",
  "MARKETINGCLAW_BUNDLED_PLUGINS_DIR",
  "MARKETINGCLAW_BUNDLED_SKILLS_DIR",
  "MARKETINGCLAW_CACHE_TRACE",
  "MARKETINGCLAW_CACHE_TRACE_FILE",
  "MARKETINGCLAW_CACHE_TRACE_MESSAGES",
  "MARKETINGCLAW_CACHE_TRACE_PROMPT",
  "MARKETINGCLAW_CACHE_TRACE_SYSTEM",
  "MARKETINGCLAW_CONFIG_PATH",
  "MARKETINGCLAW_GATEWAY_PASSWORD",
  "MARKETINGCLAW_GATEWAY_PORT",
  "MARKETINGCLAW_GATEWAY_SECRET",
  "MARKETINGCLAW_GATEWAY_TOKEN",
  "MARKETINGCLAW_GATEWAY_URL",
  "MARKETINGCLAW_HOME",
  "MARKETINGCLAW_LIVE_ANTHROPIC_KEY",
  "MARKETINGCLAW_LIVE_ANTHROPIC_KEYS",
  "MARKETINGCLAW_LIVE_GEMINI_KEY",
  "MARKETINGCLAW_LIVE_OPENAI_KEY",
  "MARKETINGCLAW_MPM_CATALOG_PATHS",
  "MARKETINGCLAW_NODE_EXEC_FALLBACK",
  "MARKETINGCLAW_NODE_EXEC_HOST",
  "MARKETINGCLAW_OAUTH_DIR",
  "MARKETINGCLAW_PINNED_PYTHON",
  "MARKETINGCLAW_PINNED_WRITE_PYTHON",
  "MARKETINGCLAW_PLUGIN_INSTALL_OVERRIDES",
  "MARKETINGCLAW_PLUGIN_CATALOG_PATHS",
  "MARKETINGCLAW_PROFILE",
  "MARKETINGCLAW_RAW_STREAM",
  "MARKETINGCLAW_RAW_STREAM_PATH",
  "MARKETINGCLAW_SHOW_SECRETS",
  "MARKETINGCLAW_SKIP_BROWSER_CONTROL_SERVER",
  "MARKETINGCLAW_STATE_DIR",
  "MARKETINGCLAW_TEST_TAILSCALE_BINARY",
  "PATH",
  "PI_CODING_AGENT_DIR",
  "PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH",
  "PROGRAMFILES",
  "PROGRAMFILES(X86)",
  "PROGRAMW6432",
  "STATE_DIRECTORY",
  "SLACK_API_URL",
  "SYNOLOGY_CHAT_INCOMING_URL",
  "SYNOLOGY_NAS_HOST",
  "UV_PYTHON",
  "ZALO_API_URL",
]);

// Block endpoint redirection for any service without overfitting per-provider names.
// `_HOMESERVER` covers Matrix's per-account scoped keys (MATRIX_<ACCOUNT>_HOMESERVER)
// in addition to the bare MATRIX_HOMESERVER listed above.
const BLOCKED_WORKSPACE_DOTENV_SUFFIXES = ["_API_HOST", "_BASE_URL", "_HOMESERVER"];
const BLOCKED_WORKSPACE_DOTENV_PREFIXES = [
  "ANTHROPIC_API_KEY_",
  "CLAWHUB_",
  "OPENAI_API_KEY_",
  // Workspace .env is untrusted; reserve the full MarketingClaw runtime namespace
  // for shell/global config so new MARKETINGCLAW_* controls are fail-closed by default.
  "MARKETINGCLAW_",
  "MARKETINGCLAW_CLAWHUB_",
  "MARKETINGCLAW_DISABLE_",
  "MARKETINGCLAW_SKIP_",
  "MARKETINGCLAW_UPDATE_",
];

function shouldBlockWorkspaceRuntimeDotEnvKey(key: string): boolean {
  return isDangerousHostEnvVarName(key) || isDangerousHostEnvOverrideVarName(key);
}

function buildProviderAuthWorkspaceDotEnvBlocklist(): ReadonlySet<string> {
  const keys = new Set<string>(BLOCKED_PROVIDER_AUTH_WORKSPACE_DOTENV_KEYS);
  for (const rawKey of listKnownProviderAuthEnvVarNames({
    includeUntrustedWorkspacePlugins: false,
  })) {
    const key = normalizeEnvVarKey(rawKey, { portable: true });
    if (key) {
      keys.add(key.toUpperCase());
    }
  }
  return keys;
}

function shouldBlockWorkspaceDotEnvKey(
  key: string,
  getProviderAuthBlockedKeys: () => ReadonlySet<string>,
): boolean {
  const upper = key.toUpperCase();
  return (
    shouldBlockWorkspaceRuntimeDotEnvKey(upper) ||
    BLOCKED_WORKSPACE_DOTENV_KEYS.has(upper) ||
    BLOCKED_WORKSPACE_DOTENV_PREFIXES.some((prefix) => upper.startsWith(prefix)) ||
    BLOCKED_WORKSPACE_DOTENV_SUFFIXES.some((suffix) => upper.endsWith(suffix)) ||
    getProviderAuthBlockedKeys().has(upper)
  );
}

export function loadWorkspaceDotEnvFile(filePath: string, opts?: { quiet?: boolean }) {
  let providerAuthBlockedKeys: ReadonlySet<string> | undefined;
  const getProviderAuthBlockedKeys = () => {
    providerAuthBlockedKeys ??= buildProviderAuthWorkspaceDotEnvBlocklist();
    return providerAuthBlockedKeys;
  };
  const parsed = readDotEnvFile({
    filePath,
    entryFilter: (key) => !shouldBlockWorkspaceDotEnvKey(key, getProviderAuthBlockedKeys),
    quiet: opts?.quiet ?? true,
  });
  if (!parsed) {
    return;
  }
  for (const { key, value } of parsed.entries) {
    if (process.env[key] !== undefined) {
      continue;
    }
    process.env[key] = value;
  }
}

export { loadGlobalRuntimeDotEnvFiles };

export function loadDotEnv(opts?: { quiet?: boolean }) {
  const quiet = opts?.quiet ?? true;
  const cwd = tryProcessCwd();
  if (cwd) {
    loadWorkspaceDotEnvFile(path.join(cwd, ".env"), { quiet });
  }

  // Then load global fallback: ~/.marketingclaw/.env (or MARKETINGCLAW_STATE_DIR/.env),
  // without overriding any env vars already present.
  loadGlobalRuntimeDotEnvFiles({ quiet });
}
