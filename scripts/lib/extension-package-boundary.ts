// Extension Package Boundary script supports MarketingClaw repository automation.
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join, posix, resolve } from "node:path";
import { privateLocalOnlyPluginSdkEntrypoints } from "./plugin-sdk-entries.mjs";

export const EXTENSION_PACKAGE_BOUNDARY_INCLUDE = ["./*.ts", "./src/**/*.ts"] as const;
export const EXTENSION_PACKAGE_BOUNDARY_EXCLUDE = [
  "./**/*.test.ts",
  "./dist/**",
  "./node_modules/**",
  "./src/test-support/**",
  "./src/**/*test-helpers.ts",
  "./src/**/*test-harness.ts",
  "./src/**/*test-support.ts",
] as const;

const privateLocalOnlyPluginSdkPackageDtsPaths = Object.fromEntries(
  privateLocalOnlyPluginSdkEntrypoints.map((entrypoint) => [
    `marketingclaw/plugin-sdk/${entrypoint}`,
    [`../packages/plugin-sdk/dist/src/plugin-sdk/${entrypoint}.d.ts`],
  ]),
) as Record<string, readonly string[]>;

function buildPackageBoundaryDtsPaths(params: {
  packageName: string;
  packageDir: string;
}): Record<string, readonly string[]> {
  const packageJson = JSON.parse(
    readFileSync(join("packages", params.packageDir, "package.json"), "utf8"),
  ) as { exports?: Record<string, unknown> };
  return Object.fromEntries(
    Object.entries(packageJson.exports ?? {}).flatMap(([exportKey, value]) => {
      const subpath =
        exportKey === "." ? "" : exportKey.startsWith("./") ? exportKey.slice(2) : null;
      const importPath =
        value && typeof value === "object" && !Array.isArray(value)
          ? (value as Record<string, unknown>).import
          : value;
      if (subpath === null || subpath.includes("..") || typeof importPath !== "string") {
        return [];
      }
      if (!importPath.startsWith("./dist/") || !importPath.endsWith(".mjs")) {
        return [];
      }
      const specifier = subpath ? `${params.packageName}/${subpath}` : params.packageName;
      return [
        [
          specifier,
          [`../dist/plugin-sdk/packages/${params.packageDir}/src/${subpath || "index"}.d.ts`],
        ],
      ];
    }),
  );
}

export const EXTENSION_PACKAGE_BOUNDARY_BASE_PATHS = {
  "marketingclaw/extension-api": ["../src/extensionAPI.ts"],
  "marketingclaw/plugin-sdk": ["../dist/plugin-sdk/index.d.ts"],
  "marketingclaw/plugin-sdk/*": ["../dist/plugin-sdk/*.d.ts"],
  ...privateLocalOnlyPluginSdkPackageDtsPaths,
  "marketingclaw/plugin-sdk/account-id": ["../dist/plugin-sdk/account-id.d.ts"],
  "marketingclaw/plugin-sdk/channel-entry-contract": [
    "../dist/plugin-sdk/channel-entry-contract.d.ts",
  ],
  "marketingclaw/plugin-sdk/browser-maintenance": [
    "../packages/plugin-sdk/dist/extensions/browser/browser-maintenance.d.ts",
  ],
  "marketingclaw/plugin-sdk/channel-secret-basic-runtime": [
    "../dist/plugin-sdk/channel-secret-basic-runtime.d.ts",
  ],
  "marketingclaw/plugin-sdk/channel-secret-runtime": [
    "../dist/plugin-sdk/channel-secret-runtime.d.ts",
  ],
  "marketingclaw/plugin-sdk/channel-secret-tts-runtime": [
    "../dist/plugin-sdk/channel-secret-tts-runtime.d.ts",
  ],
  "marketingclaw/plugin-sdk/channel-streaming": ["../dist/plugin-sdk/channel-streaming.d.ts"],
  "marketingclaw/plugin-sdk/error-runtime": ["../dist/plugin-sdk/error-runtime.d.ts"],
  "marketingclaw/plugin-sdk/provider-catalog-live-runtime": [
    "../dist/plugin-sdk/provider-catalog-live-runtime.d.ts",
  ],
  "marketingclaw/plugin-sdk/provider-catalog-shared": [
    "../dist/plugin-sdk/provider-catalog-shared.d.ts",
  ],
  "marketingclaw/plugin-sdk/provider-entry": ["../dist/plugin-sdk/provider-entry.d.ts"],
  "marketingclaw/plugin-sdk/secret-ref-runtime": ["../dist/plugin-sdk/secret-ref-runtime.d.ts"],
  "marketingclaw/plugin-sdk/ssrf-runtime": ["../dist/plugin-sdk/ssrf-runtime.d.ts"],
  "@marketingclaw/qa-channel/api.js": ["../dist/plugin-sdk/extensions/qa-channel/api.d.ts"],
  "@marketingclaw/discord/api.js": ["../dist/plugin-sdk/extensions/discord/api.d.ts"],
  "@marketingclaw/slack/api.js": ["../dist/plugin-sdk/extensions/slack/api.d.ts"],
  "@marketingclaw/telegram/api.js": ["../dist/plugin-sdk/extensions/telegram/api.d.ts"],
  "@marketingclaw/whatsapp/api.js": ["../dist/plugin-sdk/extensions/whatsapp/api.d.ts"],
  "@marketingclaw/ai": ["../dist/plugin-sdk/packages/ai/src/index.d.ts"],
  "@marketingclaw/ai/diagnostics": ["../dist/plugin-sdk/packages/ai/src/utils/diagnostics.d.ts"],
  "@marketingclaw/ai/event-stream": ["../dist/plugin-sdk/packages/ai/src/utils/event-stream.d.ts"],
  "@marketingclaw/ai/providers": ["../dist/plugin-sdk/packages/ai/src/providers.d.ts"],
  "@marketingclaw/ai/types": ["../dist/plugin-sdk/packages/ai/src/types.d.ts"],
  "@marketingclaw/ai/validation": ["../dist/plugin-sdk/packages/ai/src/validation.d.ts"],
  "@marketingclaw/ai/internal/*": ["../dist/plugin-sdk/packages/ai/src/internal/*.d.ts"],
  "@marketingclaw/llm-core": ["../dist/plugin-sdk/packages/llm-core/src/index.d.ts"],
  "@marketingclaw/llm-core/diagnostics": [
    "../dist/plugin-sdk/packages/llm-core/src/utils/diagnostics.d.ts",
  ],
  "@marketingclaw/llm-core/event-stream": [
    "../dist/plugin-sdk/packages/llm-core/src/utils/event-stream.d.ts",
  ],
  "@marketingclaw/llm-core/types": ["../dist/plugin-sdk/packages/llm-core/src/types.d.ts"],
  "@marketingclaw/llm-core/validation": [
    "../dist/plugin-sdk/packages/llm-core/src/validation.d.ts",
  ],
  "@marketingclaw/llm-core/*": ["../dist/plugin-sdk/packages/llm-core/src/*.d.ts"],
  "@marketingclaw/model-catalog-core": [
    "../dist/plugin-sdk/packages/model-catalog-core/src/index.d.ts",
  ],
  "@marketingclaw/model-catalog-core/configured-model-refs": [
    "../dist/plugin-sdk/packages/model-catalog-core/src/configured-model-refs.d.ts",
  ],
  "@marketingclaw/model-catalog-core/model-catalog-refs": [
    "../dist/plugin-sdk/packages/model-catalog-core/src/model-catalog-refs.d.ts",
  ],
  "@marketingclaw/model-catalog-core/model-catalog-normalize": [
    "../dist/plugin-sdk/packages/model-catalog-core/src/model-catalog-normalize.d.ts",
  ],
  "@marketingclaw/model-catalog-core/model-catalog-types": [
    "../dist/plugin-sdk/packages/model-catalog-core/src/model-catalog-types.d.ts",
  ],
  "@marketingclaw/model-catalog-core/provider-id": [
    "../dist/plugin-sdk/packages/model-catalog-core/src/provider-id.d.ts",
  ],
  "@marketingclaw/model-catalog-core/provider-model-id-normalization": [
    "../dist/plugin-sdk/packages/model-catalog-core/src/provider-model-id-normalization.d.ts",
  ],
  "@marketingclaw/model-catalog-core/provider-model-id-normalize": [
    "../dist/plugin-sdk/packages/model-catalog-core/src/provider-model-id-normalize.d.ts",
  ],
  "@marketingclaw/model-catalog-core/*": [
    "../dist/plugin-sdk/packages/model-catalog-core/src/*.d.ts",
  ],
  "@marketingclaw/markdown-core": ["../dist/plugin-sdk/packages/markdown-core/src/index.d.ts"],
  "@marketingclaw/markdown-core/code-spans": [
    "../dist/plugin-sdk/packages/markdown-core/src/code-spans.d.ts",
  ],
  "@marketingclaw/markdown-core/fences": [
    "../dist/plugin-sdk/packages/markdown-core/src/fences.d.ts",
  ],
  "@marketingclaw/markdown-core/frontmatter": [
    "../dist/plugin-sdk/packages/markdown-core/src/frontmatter.d.ts",
  ],
  "@marketingclaw/markdown-core/ir": ["../dist/plugin-sdk/packages/markdown-core/src/ir.d.ts"],
  "@marketingclaw/markdown-core/render": [
    "../dist/plugin-sdk/packages/markdown-core/src/render.d.ts",
  ],
  "@marketingclaw/markdown-core/render-aware-chunking": [
    "../dist/plugin-sdk/packages/markdown-core/src/render-aware-chunking.d.ts",
  ],
  "@marketingclaw/markdown-core/tables": [
    "../dist/plugin-sdk/packages/markdown-core/src/tables.d.ts",
  ],
  "@marketingclaw/markdown-core/types": [
    "../dist/plugin-sdk/packages/markdown-core/src/types.d.ts",
  ],
  "@marketingclaw/markdown-core/*": ["../dist/plugin-sdk/packages/markdown-core/src/*.d.ts"],
  "@marketingclaw/media-generation-core": [
    "../dist/plugin-sdk/packages/media-generation-core/src/index.d.ts",
  ],
  "@marketingclaw/media-generation-core/capability-model-ref": [
    "../dist/plugin-sdk/packages/media-generation-core/src/capability-model-ref.d.ts",
  ],
  "@marketingclaw/media-generation-core/catalog": [
    "../dist/plugin-sdk/packages/media-generation-core/src/catalog.d.ts",
  ],
  "@marketingclaw/media-generation-core/model-ref": [
    "../dist/plugin-sdk/packages/media-generation-core/src/model-ref.d.ts",
  ],
  "@marketingclaw/media-generation-core/normalization": [
    "../dist/plugin-sdk/packages/media-generation-core/src/normalization.d.ts",
  ],
  "@marketingclaw/media-generation-core/*": [
    "../dist/plugin-sdk/packages/media-generation-core/src/*.d.ts",
  ],
  "@marketingclaw/media-core": ["../dist/plugin-sdk/packages/media-core/src/index.d.ts"],
  "@marketingclaw/media-core/base64": ["../dist/plugin-sdk/packages/media-core/src/base64.d.ts"],
  "@marketingclaw/media-core/constants": [
    "../dist/plugin-sdk/packages/media-core/src/constants.d.ts",
  ],
  "@marketingclaw/media-core/content-length": [
    "../dist/plugin-sdk/packages/media-core/src/content-length.d.ts",
  ],
  "@marketingclaw/media-core/file-name": [
    "../dist/plugin-sdk/packages/media-core/src/file-name.d.ts",
  ],
  "@marketingclaw/media-core/inbound-path-policy": [
    "../dist/plugin-sdk/packages/media-core/src/inbound-path-policy.d.ts",
  ],
  "@marketingclaw/media-core/inline-image-data-url": [
    "../dist/plugin-sdk/packages/media-core/src/inline-image-data-url.d.ts",
  ],
  "@marketingclaw/media-core/media-source-url": [
    "../dist/plugin-sdk/packages/media-core/src/media-source-url.d.ts",
  ],
  "@marketingclaw/media-core/mime": ["../dist/plugin-sdk/packages/media-core/src/mime.d.ts"],
  "@marketingclaw/media-core/read-byte-stream-with-limit": [
    "../dist/plugin-sdk/packages/media-core/src/read-byte-stream-with-limit.d.ts",
  ],
  "@marketingclaw/media-core/*": ["../dist/plugin-sdk/packages/media-core/src/*.d.ts"],
  "@marketingclaw/normalization-core/record-coerce": [
    "../dist/plugin-sdk/packages/normalization-core/src/record-coerce.d.ts",
  ],
  "@marketingclaw/normalization-core/string-coerce": [
    "../dist/plugin-sdk/packages/normalization-core/src/string-coerce.d.ts",
  ],
  "@marketingclaw/normalization-core/*": [
    "../dist/plugin-sdk/packages/normalization-core/src/*.d.ts",
  ],
  ...buildPackageBoundaryDtsPaths({
    packageName: "@marketingclaw/acp-core",
    packageDir: "acp-core",
  }),
  "@marketingclaw/acp-core/*": ["../dist/plugin-sdk/packages/acp-core/src/*.d.ts"],
  "@marketingclaw/terminal-core": ["../dist/plugin-sdk/packages/terminal-core/src/index.d.ts"],
  "@marketingclaw/terminal-core/ansi": ["../dist/plugin-sdk/packages/terminal-core/src/ansi.d.ts"],
  "@marketingclaw/terminal-core/decorative-emoji": [
    "../dist/plugin-sdk/packages/terminal-core/src/decorative-emoji.d.ts",
  ],
  "@marketingclaw/terminal-core/health-style": [
    "../dist/plugin-sdk/packages/terminal-core/src/health-style.d.ts",
  ],
  "@marketingclaw/terminal-core/links": [
    "../dist/plugin-sdk/packages/terminal-core/src/links.d.ts",
  ],
  "@marketingclaw/terminal-core/note": ["../dist/plugin-sdk/packages/terminal-core/src/note.d.ts"],
  "@marketingclaw/terminal-core/osc-progress": [
    "../dist/plugin-sdk/packages/terminal-core/src/osc-progress.d.ts",
  ],
  "@marketingclaw/terminal-core/palette": [
    "../dist/plugin-sdk/packages/terminal-core/src/palette.d.ts",
  ],
  "@marketingclaw/terminal-core/progress-line": [
    "../dist/plugin-sdk/packages/terminal-core/src/progress-line.d.ts",
  ],
  "@marketingclaw/terminal-core/prompt-select-styled": [
    "../dist/plugin-sdk/packages/terminal-core/src/prompt-select-styled.d.ts",
  ],
  "@marketingclaw/terminal-core/prompt-select-styled-params": [
    "../dist/plugin-sdk/packages/terminal-core/src/prompt-select-styled-params.d.ts",
  ],
  "@marketingclaw/terminal-core/prompt-style": [
    "../dist/plugin-sdk/packages/terminal-core/src/prompt-style.d.ts",
  ],
  "@marketingclaw/terminal-core/restore": [
    "../dist/plugin-sdk/packages/terminal-core/src/restore.d.ts",
  ],
  "@marketingclaw/terminal-core/safe-text": [
    "../dist/plugin-sdk/packages/terminal-core/src/safe-text.d.ts",
  ],
  "@marketingclaw/terminal-core/stream-writer": [
    "../dist/plugin-sdk/packages/terminal-core/src/stream-writer.d.ts",
  ],
  "@marketingclaw/terminal-core/table": [
    "../dist/plugin-sdk/packages/terminal-core/src/table.d.ts",
  ],
  "@marketingclaw/terminal-core/terminal-link": [
    "../dist/plugin-sdk/packages/terminal-core/src/terminal-link.d.ts",
  ],
  "@marketingclaw/terminal-core/theme": [
    "../dist/plugin-sdk/packages/terminal-core/src/theme.d.ts",
  ],
  "@marketingclaw/terminal-core/*": ["../dist/plugin-sdk/packages/terminal-core/src/*.d.ts"],
  "@marketingclaw/*.js": ["../packages/plugin-sdk/dist/extensions/*.d.ts", "../extensions/*"],
  "@marketingclaw/*": ["../packages/plugin-sdk/dist/extensions/*", "../extensions/*"],
  "marketingclaw/plugin-sdk/qa-channel": ["../dist/plugin-sdk/src/plugin-sdk/qa-channel.d.ts"],
  "marketingclaw/plugin-sdk/qa-channel-protocol": [
    "../dist/plugin-sdk/src/plugin-sdk/qa-channel-protocol.d.ts",
  ],
  "marketingclaw/plugin-sdk/qa-runtime": ["../dist/plugin-sdk/src/plugin-sdk/qa-runtime.d.ts"],
  "@marketingclaw/plugin-sdk/*": ["../dist/plugin-sdk/*.d.ts"],
} as const;

function prefixExtensionPackageBoundaryPaths(
  paths: Record<string, readonly string[]>,
  prefix: string,
): Record<string, readonly string[]> {
  return Object.fromEntries(
    Object.entries(paths).map(([key, values]) => [
      key,
      values.map((value) => posix.join(prefix, value)),
    ]),
  );
}

export const EXTENSION_PACKAGE_BOUNDARY_XAI_PATHS = {
  ...prefixExtensionPackageBoundaryPaths(
    (({
      "marketingclaw/plugin-sdk/channel-secret-basic-runtime": _omitBasic,
      "marketingclaw/plugin-sdk/channel-secret-tts-runtime": _omitTts,
      "@marketingclaw/discord/api.js": _omitDiscord,
      "@marketingclaw/slack/api.js": _omitSlack,
      "@marketingclaw/telegram/api.js": _omitTelegram,
      "@marketingclaw/whatsapp/api.js": _omitWhatsApp,
      ...rest
    }) => rest)(EXTENSION_PACKAGE_BOUNDARY_BASE_PATHS),
    "../",
  ),
  "marketingclaw/plugin-sdk/channel-entry-contract": [
    "../../dist/plugin-sdk/channel-entry-contract.d.ts",
  ],
  "marketingclaw/plugin-sdk/browser-maintenance": [
    "../../dist/plugin-sdk/src/plugin-sdk/browser-maintenance.d.ts",
  ],
  "marketingclaw/plugin-sdk/cli-runtime": ["../../dist/plugin-sdk/cli-runtime.d.ts"],
  "marketingclaw/plugin-sdk/provider-catalog-live-runtime": [
    "../../dist/plugin-sdk/provider-catalog-live-runtime.d.ts",
  ],
  "marketingclaw/plugin-sdk/provider-catalog-shared": [
    "../../dist/plugin-sdk/provider-catalog-shared.d.ts",
  ],
  "marketingclaw/plugin-sdk/provider-env-vars": ["../../dist/plugin-sdk/provider-env-vars.d.ts"],
  "marketingclaw/plugin-sdk/provider-entry": ["../../dist/plugin-sdk/provider-entry.d.ts"],
  "marketingclaw/plugin-sdk/provider-web-search-contract": [
    "../../dist/plugin-sdk/provider-web-search-contract.d.ts",
  ],
  "@marketingclaw/qa-channel/api.js": ["../../dist/plugin-sdk/extensions/qa-channel/api.d.ts"],
  "@marketingclaw/*.js": ["../../packages/plugin-sdk/dist/extensions/*.d.ts", "../*"],
  "@marketingclaw/*": ["../*"],
  "@marketingclaw/plugin-sdk/*": ["../../dist/plugin-sdk/*.d.ts"],
  "@openclaw/anthropic-vertex/api.js": ["./.boundary-stubs/anthropic-vertex-api.d.ts"],
  "@openclaw/ollama/api.js": ["./.boundary-stubs/ollama-api.d.ts"],
  "@openclaw/ollama/runtime-api.js": ["./.boundary-stubs/ollama-runtime-api.d.ts"],
  "@marketingclaw/speech-core/runtime-api.js": ["./.boundary-stubs/speech-core-runtime-api.d.ts"],
} as const;

type ExtensionPackageBoundaryTsConfigJson = {
  extends?: unknown;
  compilerOptions?: {
    rootDir?: unknown;
    paths?: unknown;
  };
  include?: unknown;
  exclude?: unknown;
};

type ExtensionPackageBoundaryPackageJson = {
  devDependencies?: Record<string, string>;
};

function readJsonFile(filePath: string): unknown {
  return JSON.parse(readFileSync(filePath, "utf8"));
}

function collectBundledExtensionIds(rootDir = resolve(".")): string[] {
  return readdirSync(join(rootDir, "extensions"), { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .toSorted();
}

function resolveExtensionTsconfigPath(extensionId: string, rootDir = resolve(".")): string {
  return join(rootDir, "extensions", extensionId, "tsconfig.json");
}

function resolveExtensionPackageJsonPath(extensionId: string, rootDir = resolve(".")): string {
  return join(rootDir, "extensions", extensionId, "package.json");
}

export function readExtensionPackageBoundaryTsconfig(
  extensionId: string,
  rootDir = resolve("."),
): ExtensionPackageBoundaryTsConfigJson {
  return readJsonFile(
    resolveExtensionTsconfigPath(extensionId, rootDir),
  ) as ExtensionPackageBoundaryTsConfigJson;
}

export function readExtensionPackageBoundaryPackageJson(
  extensionId: string,
  rootDir = resolve("."),
): ExtensionPackageBoundaryPackageJson {
  return readJsonFile(
    resolveExtensionPackageJsonPath(extensionId, rootDir),
  ) as ExtensionPackageBoundaryPackageJson;
}

export function isOptInExtensionPackageBoundaryTsconfig(
  tsconfig: ExtensionPackageBoundaryTsConfigJson,
): boolean {
  return tsconfig.extends === "../tsconfig.package-boundary.base.json";
}

export function collectExtensionsWithTsconfig(rootDir = resolve(".")): string[] {
  return collectBundledExtensionIds(rootDir).filter((extensionId) =>
    existsSync(resolveExtensionTsconfigPath(extensionId, rootDir)),
  );
}

export function collectOptInExtensionPackageBoundaries(rootDir = resolve(".")): string[] {
  return collectExtensionsWithTsconfig(rootDir).filter((extensionId) =>
    isOptInExtensionPackageBoundaryTsconfig(
      readExtensionPackageBoundaryTsconfig(extensionId, rootDir),
    ),
  );
}
