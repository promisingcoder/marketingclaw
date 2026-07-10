/** Shared registration types that make up the in-memory plugin registry. */
import type { AgentHarness } from "../agents/harness/types.js";
import type { GatewayMethodDescriptor } from "../gateway/methods/descriptor.js";
import type { GatewayRequestHandlers } from "../gateway/server-methods/types.js";
import type { HookEntry } from "../hooks/types.js";
import type { JsonSchemaObject } from "../shared/json-schema.types.js";
import type {
  AgentToolResultMiddleware,
  AgentToolResultMiddlewareRuntime,
} from "./agent-tool-result-middleware-types.js";
import type { CodexAppServerExtensionFactory } from "./codex-app-server-extension-types.js";
import type { PluginCompatCode } from "./compat/registry.js";
import type { PluginActivationSource } from "./config-state.js";
import type { EmbeddingProviderAdapter } from "./embedding-providers.js";
import type {
  PluginAgentEventSubscriptionRegistration,
  PluginControlUiDescriptor,
  PluginRuntimeLifecycleRegistration,
  PluginSessionActionRegistration,
  PluginSessionSchedulerJobRegistration,
  PluginSessionExtensionRegistration,
  PluginToolMetadataRegistration,
  PluginTrustedToolPolicyRegistration,
} from "./host-hooks.js";
import type {
  PluginBundleFormat,
  PluginConfigUiHint,
  PluginDiagnostic,
  PluginFormat,
} from "./manifest-types.js";
import type { PluginManifestContracts } from "./manifest.js";
import type { MemoryEmbeddingProviderAdapter } from "./memory-embedding-providers.js";
import type { PluginKind } from "./plugin-kind.types.js";
import type { PluginRuntime } from "./runtime/types.js";
import type { PluginDependencyStatus } from "./status-dependencies-core.js";
type ChannelPlugin = import("../channels/plugins/types.plugin.js").ChannelPlugin;
type CliBackendPlugin = import("./types.js").CliBackendPlugin;
type ImageGenerationProviderPlugin = import("./types.js").ImageGenerationProviderPlugin;
type MediaUnderstandingProviderPlugin = import("./types.js").MediaUnderstandingProviderPlugin;
type TranscriptSourceProvider = import("./types.js").TranscriptSourceProvider;
type MusicGenerationProviderPlugin = import("./types.js").MusicGenerationProviderPlugin;
type MarketingClawPluginCliCommandDescriptor =
  import("./types.js").MarketingClawPluginCliCommandDescriptor;
type MarketingClawPluginCliRegistrar = import("./types.js").MarketingClawPluginCliRegistrar;
type MarketingClawPluginCommandDefinition =
  import("./types.js").MarketingClawPluginCommandDefinition;
type PluginInteractiveHandlerRegistration =
  import("./types.js").PluginInteractiveHandlerRegistration;
type MarketingClawPluginGatewayRuntimeScopeSurface =
  import("./types.js").MarketingClawPluginGatewayRuntimeScopeSurface;
type MarketingClawGatewayDiscoveryService =
  import("./types.js").MarketingClawGatewayDiscoveryService;
type MarketingClawPluginHttpRouteAuth = import("./types.js").MarketingClawPluginHttpRouteAuth;
type MarketingClawPluginHttpRouteHandler = import("./types.js").MarketingClawPluginHttpRouteHandler;
type MarketingClawPluginHttpRouteUpgradeHandler =
  import("./types.js").MarketingClawPluginHttpRouteUpgradeHandler;
type MarketingClawPluginHttpRouteMatch = import("./types.js").MarketingClawPluginHttpRouteMatch;
type MarketingClawPluginHostedMediaResolver =
  import("./types.js").MarketingClawPluginHostedMediaResolver;
type MarketingClawPluginReloadRegistration =
  import("./types.js").MarketingClawPluginReloadRegistration;
type MarketingClawPluginSecurityAuditCollector =
  import("./types.js").MarketingClawPluginSecurityAuditCollector;
type MarketingClawPluginService = import("./types.js").MarketingClawPluginService;
type MarketingClawPluginToolFactory = import("./types.js").MarketingClawPluginToolFactory;
type PluginConversationBindingResolvedEvent =
  import("./types.js").PluginConversationBindingResolvedEvent;
type TypedPluginHookRegistration = import("./types.js").PluginHookRegistration;
type PluginLogger = import("./types.js").PluginLogger;
type PluginOrigin = import("./types.js").PluginOrigin;
type PluginTextTransformRegistration = import("./types.js").PluginTextTransformRegistration;
type MigrationProviderPlugin = import("./types.js").MigrationProviderPlugin;
type ProviderPlugin = import("./types.js").ProviderPlugin;
type RealtimeTranscriptionProviderPlugin = import("./types.js").RealtimeTranscriptionProviderPlugin;
type RealtimeVoiceProviderPlugin = import("./types.js").RealtimeVoiceProviderPlugin;
type SpeechProviderPlugin = import("./types.js").SpeechProviderPlugin;
type VideoGenerationProviderPlugin = import("./types.js").VideoGenerationProviderPlugin;
type WebFetchProviderPlugin = import("./types.js").WebFetchProviderPlugin;
type WebSearchProviderPlugin = import("./types.js").WebSearchProviderPlugin;
type UnifiedModelCatalogProviderPlugin = import("./types.js").UnifiedModelCatalogProviderPlugin;

/** Agent tool factory registered by one plugin runtime. */
export type PluginToolRegistration = {
  pluginId: string;
  pluginName?: string;
  factory: MarketingClawPluginToolFactory;
  names: string[];
  declaredNames?: string[];
  optional: boolean;
  source: string;
  rootDir?: string;
};

export type PluginCliRegistration = {
  pluginId: string;
  pluginName?: string;
  register: MarketingClawPluginCliRegistrar;
  parentPath: string[];
  commands: string[];
  descriptors: MarketingClawPluginCliCommandDescriptor[];
  source: string;
  rootDir?: string;
};

/** Gateway HTTP route registered by a plugin runtime. */
export type PluginHttpRouteRegistration = {
  pluginId?: string;
  path: string;
  handler: MarketingClawPluginHttpRouteHandler;
  handleUpgrade?: MarketingClawPluginHttpRouteUpgradeHandler;
  auth: MarketingClawPluginHttpRouteAuth;
  match: MarketingClawPluginHttpRouteMatch;
  gatewayRuntimeScopeSurface?: MarketingClawPluginGatewayRuntimeScopeSurface;
  gatewayMethodDispatchAllowed?: boolean;
  nodeCapability?: {
    surface: string;
    ttlMs?: number;
  };
  source?: string;
};

export type PluginHostedMediaResolverRegistration = {
  pluginId: string;
  pluginName?: string;
  resolver: MarketingClawPluginHostedMediaResolver;
  source: string;
  rootDir?: string;
};

export type PluginChannelRegistration = {
  pluginId: string;
  pluginName?: string;
  plugin: ChannelPlugin;
  source: string;
  rootDir?: string;
};

export type PluginChannelSetupRegistration = {
  pluginId: string;
  pluginName?: string;
  plugin: ChannelPlugin;
  source: string;
  enabled: boolean;
  rootDir?: string;
};

export type PluginProviderRegistration = {
  pluginId: string;
  pluginName?: string;
  provider: ProviderPlugin;
  source: string;
  rootDir?: string;
};

export type PluginModelCatalogProviderRegistration = {
  pluginId: string;
  pluginName?: string;
  provider: UnifiedModelCatalogProviderPlugin;
  source: string;
  rootDir?: string;
};

export type PluginCliBackendRegistration = {
  pluginId: string;
  pluginName?: string;
  backend: CliBackendPlugin;
  source: string;
  rootDir?: string;
};

export type PluginTextTransformsRegistration = {
  pluginId: string;
  pluginName?: string;
  transforms: PluginTextTransformRegistration;
  source: string;
  rootDir?: string;
};

type PluginOwnedProviderRegistration<T extends { id: string }> = {
  pluginId: string;
  pluginName?: string;
  provider: T;
  source: string;
  rootDir?: string;
};

export type PluginSpeechProviderRegistration =
  PluginOwnedProviderRegistration<SpeechProviderPlugin>;
export type PluginEmbeddingProviderRegistration =
  PluginOwnedProviderRegistration<EmbeddingProviderAdapter>;
export type PluginRealtimeTranscriptionProviderRegistration =
  PluginOwnedProviderRegistration<RealtimeTranscriptionProviderPlugin>;
export type PluginRealtimeVoiceProviderRegistration =
  PluginOwnedProviderRegistration<RealtimeVoiceProviderPlugin>;
export type PluginMediaUnderstandingProviderRegistration =
  PluginOwnedProviderRegistration<MediaUnderstandingProviderPlugin>;
export type PluginTranscriptsSourceProviderRegistration =
  PluginOwnedProviderRegistration<TranscriptSourceProvider>;
export type PluginImageGenerationProviderRegistration =
  PluginOwnedProviderRegistration<ImageGenerationProviderPlugin>;
export type PluginVideoGenerationProviderRegistration =
  PluginOwnedProviderRegistration<VideoGenerationProviderPlugin>;
export type PluginMusicGenerationProviderRegistration =
  PluginOwnedProviderRegistration<MusicGenerationProviderPlugin>;
export type PluginWebFetchProviderRegistration =
  PluginOwnedProviderRegistration<WebFetchProviderPlugin>;
export type PluginWebSearchProviderRegistration =
  PluginOwnedProviderRegistration<WebSearchProviderPlugin>;
export type PluginMigrationProviderRegistration =
  PluginOwnedProviderRegistration<MigrationProviderPlugin>;
export type PluginMemoryEmbeddingProviderRegistration =
  PluginOwnedProviderRegistration<MemoryEmbeddingProviderAdapter>;
export type PluginCodexAppServerExtensionFactoryRegistration = {
  pluginId: string;
  pluginName?: string;
  rawFactory: CodexAppServerExtensionFactory;
  factory: CodexAppServerExtensionFactory;
  source: string;
  rootDir?: string;
};
export type PluginAgentToolResultMiddlewareRegistration = {
  pluginId: string;
  pluginName?: string;
  rawHandler: AgentToolResultMiddleware;
  handler: AgentToolResultMiddleware;
  runtimes: AgentToolResultMiddlewareRuntime[];
  source: string;
  rootDir?: string;
};
export type PluginAgentHarnessRegistration = {
  pluginId: string;
  pluginName?: string;
  harness: AgentHarness;
  source: string;
  rootDir?: string;
};

export type PluginHookRegistration = {
  pluginId: string;
  entry: HookEntry;
  events: string[];
  source: string;
  rootDir?: string;
};

export type PluginServiceRegistration = {
  pluginId: string;
  pluginName?: string;
  service: MarketingClawPluginService;
  source: string;
  origin: PluginOrigin;
  trustedOfficialInstall?: boolean;
  rootDir?: string;
};

export type PluginGatewayDiscoveryServiceRegistration = {
  pluginId: string;
  pluginName?: string;
  service: MarketingClawGatewayDiscoveryService;
  source: string;
  rootDir?: string;
};

export type PluginReloadRegistration = {
  pluginId: string;
  pluginName?: string;
  registration: MarketingClawPluginReloadRegistration;
  source: string;
  rootDir?: string;
};

export type PluginNodeHostCommandRegistration = {
  pluginId: string;
  pluginName?: string;
  command: import("./types.js").MarketingClawPluginNodeHostCommand;
  source: string;
  rootDir?: string;
};

export type PluginNodeInvokePolicyRegistration = {
  pluginId: string;
  pluginName?: string;
  policy: import("./types.js").MarketingClawPluginNodeInvokePolicy;
  pluginConfig?: Record<string, unknown>;
  source: string;
  rootDir?: string;
};

export type PluginSecurityAuditCollectorRegistration = {
  pluginId: string;
  pluginName?: string;
  collector: MarketingClawPluginSecurityAuditCollector;
  source: string;
  rootDir?: string;
};

export type PluginCommandRegistration = {
  pluginId: string;
  pluginName?: string;
  command: MarketingClawPluginCommandDefinition;
  source: string;
  rootDir?: string;
};

export type PluginInteractiveHandlerRegistryRegistration = PluginInteractiveHandlerRegistration & {
  pluginId: string;
  pluginName?: string;
  pluginRoot?: string;
};

export type PluginSessionExtensionRegistryRegistration = {
  pluginId: string;
  pluginName?: string;
  extension: PluginSessionExtensionRegistration;
  source: string;
  rootDir?: string;
};

export type PluginTrustedToolPolicyRegistryRegistration = {
  pluginId: string;
  pluginName?: string;
  policy: PluginTrustedToolPolicyRegistration;
  origin?: PluginRecord["origin"];
  source: string;
  rootDir?: string;
};

export type PluginToolMetadataRegistryRegistration = {
  pluginId: string;
  pluginName?: string;
  metadata: PluginToolMetadataRegistration;
  source: string;
  rootDir?: string;
};

export type PluginControlUiDescriptorRegistryRegistration = {
  pluginId: string;
  pluginName?: string;
  descriptor: PluginControlUiDescriptor;
  source: string;
  rootDir?: string;
};

export type PluginRuntimeLifecycleRegistryRegistration = {
  pluginId: string;
  pluginName?: string;
  lifecycle: PluginRuntimeLifecycleRegistration;
  source: string;
  rootDir?: string;
};

export type PluginAgentEventSubscriptionRegistryRegistration = {
  pluginId: string;
  pluginName?: string;
  subscription: PluginAgentEventSubscriptionRegistration;
  source: string;
  rootDir?: string;
};

export type PluginSessionSchedulerJobRegistryRegistration = {
  pluginId: string;
  pluginName?: string;
  job: PluginSessionSchedulerJobRegistration;
  generation?: number;
  source: string;
  rootDir?: string;
};

export type PluginSessionActionRegistryRegistration = {
  pluginId: string;
  pluginName?: string;
  action: PluginSessionActionRegistration;
  source: string;
  rootDir?: string;
};

export type PluginConversationBindingResolvedHandlerRegistration = {
  pluginId: string;
  pluginName?: string;
  pluginRoot?: string;
  handler: (event: PluginConversationBindingResolvedEvent) => void | Promise<void>;
  source: string;
  rootDir?: string;
};

export type PluginRecord = {
  id: string;
  name: string;
  version?: string;
  packageName?: string;
  description?: string;
  format?: PluginFormat;
  bundleFormat?: PluginBundleFormat;
  bundleCapabilities?: string[];
  kind?: PluginKind | PluginKind[];
  source: string;
  rootDir?: string;
  origin: PluginOrigin;
  workspaceDir?: string;
  trustedOfficialInstall?: boolean;
  enabled: boolean;
  explicitlyEnabled?: boolean;
  activated?: boolean;
  imported?: boolean;
  compat?: readonly PluginCompatCode[];
  activationSource?: PluginActivationSource;
  activationReason?: string;
  status: "loaded" | "disabled" | "error";
  error?: string;
  failedAt?: Date;
  failurePhase?: "validation" | "load" | "register";
  toolNames: string[];
  hookNames: string[];
  channelIds: string[];
  cliBackendIds: string[];
  providerIds: string[];
  syntheticAuthRefs?: string[];
  embeddingProviderIds: string[];
  speechProviderIds: string[];
  realtimeTranscriptionProviderIds: string[];
  realtimeVoiceProviderIds: string[];
  mediaUnderstandingProviderIds: string[];
  transcriptSourceProviderIds: string[];
  imageGenerationProviderIds: string[];
  videoGenerationProviderIds: string[];
  musicGenerationProviderIds: string[];
  webFetchProviderIds: string[];
  webSearchProviderIds: string[];
  migrationProviderIds: string[];
  contextEngineIds?: string[];
  memoryEmbeddingProviderIds: string[];
  agentHarnessIds: string[];
  cliCommands: string[];
  services: string[];
  gatewayDiscoveryServiceIds: string[];
  commands: string[];
  httpRoutes: number;
  hookCount: number;
  configSchema: boolean;
  configUiHints?: Record<string, PluginConfigUiHint>;
  configJsonSchema?: JsonSchemaObject;
  contracts?: PluginManifestContracts;
  memorySlotSelected?: boolean;
  dependencyStatus?: PluginDependencyStatus;
};

export type PluginRegistry = {
  plugins: PluginRecord[];
  tools: PluginToolRegistration[];
  hooks: PluginHookRegistration[];
  typedHooks: TypedPluginHookRegistration[];
  channels: PluginChannelRegistration[];
  channelSetups: PluginChannelSetupRegistration[];
  providers: PluginProviderRegistration[];
  modelCatalogProviders: PluginModelCatalogProviderRegistration[];
  cliBackends: PluginCliBackendRegistration[];
  textTransforms: PluginTextTransformsRegistration[];
  embeddingProviders: PluginEmbeddingProviderRegistration[];
  speechProviders: PluginSpeechProviderRegistration[];
  realtimeTranscriptionProviders: PluginRealtimeTranscriptionProviderRegistration[];
  realtimeVoiceProviders: PluginRealtimeVoiceProviderRegistration[];
  mediaUnderstandingProviders: PluginMediaUnderstandingProviderRegistration[];
  transcriptSourceProviders: PluginTranscriptsSourceProviderRegistration[];
  imageGenerationProviders: PluginImageGenerationProviderRegistration[];
  videoGenerationProviders: PluginVideoGenerationProviderRegistration[];
  musicGenerationProviders: PluginMusicGenerationProviderRegistration[];
  webFetchProviders: PluginWebFetchProviderRegistration[];
  webSearchProviders: PluginWebSearchProviderRegistration[];
  migrationProviders: PluginMigrationProviderRegistration[];
  codexAppServerExtensionFactories: PluginCodexAppServerExtensionFactoryRegistration[];
  agentToolResultMiddlewares: PluginAgentToolResultMiddlewareRegistration[];
  memoryEmbeddingProviders: PluginMemoryEmbeddingProviderRegistration[];
  agentHarnesses: PluginAgentHarnessRegistration[];
  gatewayHandlers: GatewayRequestHandlers;
  gatewayMethodDescriptors: GatewayMethodDescriptor[];
  coreGatewayMethodNames: string[];
  httpRoutes: PluginHttpRouteRegistration[];
  hostedMediaResolvers: PluginHostedMediaResolverRegistration[];
  cliRegistrars: PluginCliRegistration[];
  reloads: PluginReloadRegistration[];
  nodeHostCommands: PluginNodeHostCommandRegistration[];
  nodeInvokePolicies: PluginNodeInvokePolicyRegistration[];
  securityAuditCollectors: PluginSecurityAuditCollectorRegistration[];
  services: PluginServiceRegistration[];
  gatewayDiscoveryServices: PluginGatewayDiscoveryServiceRegistration[];
  commands: PluginCommandRegistration[];
  interactiveHandlers: PluginInteractiveHandlerRegistryRegistration[];
  sessionExtensions: PluginSessionExtensionRegistryRegistration[];
  trustedToolPolicies: PluginTrustedToolPolicyRegistryRegistration[];
  toolMetadata: PluginToolMetadataRegistryRegistration[];
  controlUiDescriptors: PluginControlUiDescriptorRegistryRegistration[];
  runtimeLifecycles: PluginRuntimeLifecycleRegistryRegistration[];
  agentEventSubscriptions: PluginAgentEventSubscriptionRegistryRegistration[];
  sessionSchedulerJobs: PluginSessionSchedulerJobRegistryRegistration[];
  sessionActions: PluginSessionActionRegistryRegistration[];
  conversationBindingResolvedHandlers: PluginConversationBindingResolvedHandlerRegistration[];
  diagnostics: PluginDiagnostic[];
};

export type PluginRegistryParams = {
  logger: PluginLogger;
  coreGatewayHandlers?: GatewayRequestHandlers;
  coreGatewayMethodNames?: readonly string[];
  runtime: PluginRuntime;
  hostServices?: {
    /** May be a live accessor; plugin APIs must read it at call time. */
    cron?: import("../cron/service-contract.js").CronServiceContract;
  };
  activateGlobalSideEffects?: boolean;
};

export type PluginRegistrationMode = import("./types.js").PluginRegistrationMode;
export type MarketingClawPluginNodeHostCommand =
  import("./types.js").MarketingClawPluginNodeHostCommand;
export type MarketingClawPluginToolContext = import("./types.js").MarketingClawPluginToolContext;
export type MarketingClawPluginHttpRouteParams =
  import("./types.js").MarketingClawPluginHttpRouteParams;
export type MarketingClawPluginHookOptions = import("./types.js").MarketingClawPluginHookOptions;
export type PluginHookHandlerMap = import("./types.js").PluginHookHandlerMap;
export type MarketingClawPluginApi = import("./types.js").MarketingClawPluginApi;
