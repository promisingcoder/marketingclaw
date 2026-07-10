---
summary: "Generated inventory of MarketingClaw plugins shipped in core, published externally, or kept source-only"
read_when:
  - You are deciding whether a plugin ships in the core npm package or installs separately
  - You are updating bundled plugin package metadata or release automation
  - You need the canonical internal vs external plugin list
title: "Plugin inventory"
---

# Plugin inventory

This page is generated from `extensions/*/package.json`, `marketingclaw.plugin.json`,
and the root npm package `files` exclusions. Regenerate it with:

```bash
pnpm plugins:inventory:gen
```

## Definitions

- **Core npm package:** built into the `marketingclaw` npm package and available without a separate plugin install.
- **Official external package:** MarketingClaw-maintained plugin omitted from the core npm package, kept in this official inventory, and installed on demand through ClawHub and/or npm.
- **Source checkout only:** repo-local plugin omitted from published npm artifacts and not advertised as an installable package.

Source checkouts are different from npm installs: after `pnpm install`, bundled
plugins load from `extensions/<id>` so local edits and package-local workspace
dependencies are available.

## Install a plugin

Use the install route in each entry to decide whether install is needed. Plugins
that say `included in MarketingClaw` are already present in the core package.
Official external packages need one install, then a Gateway restart.

For example, Discord is an official external package:

```bash
marketingclaw plugins install @marketingclaw/discord
marketingclaw gateway restart
marketingclaw plugins inspect discord --runtime --json
```

During the launch cutover, ordinary bare package specs still install from npm.
Use `clawhub:@marketingclaw/discord` or `npm:@marketingclaw/discord` when you need an
explicit source. After install, follow the plugin's setup doc, such as
[Discord](/channels/discord), to add credentials and channel config. See
[Manage plugins](/plugins/manage-plugins) for update, uninstall, and publishing
commands.

Each entry lists the package, distribution route, and description.

## Core npm package

62 plugins

- **[admin-http-rpc](/plugins/reference/admin-http-rpc)** (`@marketingclaw/admin-http-rpc`) - included in MarketingClaw. MarketingClaw admin HTTP RPC endpoint.

- **[alibaba](/plugins/reference/alibaba)** (`@marketingclaw/alibaba-provider`) - included in MarketingClaw. Adds video generation provider support.

- **[anthropic](/plugins/reference/anthropic)** (`@marketingclaw/anthropic-provider`) - included in MarketingClaw. Adds Anthropic model provider support to MarketingClaw.

- **[azure-speech](/plugins/reference/azure-speech)** (`@marketingclaw/azure-speech`) - included in MarketingClaw. Azure AI Speech text-to-speech (MP3, native Ogg/Opus voice notes, PCM telephony).

- **[bonjour](/plugins/reference/bonjour)** (`@marketingclaw/bonjour`) - included in MarketingClaw. Advertise the local MarketingClaw gateway over Bonjour/mDNS.

- **[browser](/plugins/reference/browser)** (`@marketingclaw/browser-plugin`) - included in MarketingClaw. Adds agent-callable tools.

- **[byteplus](/plugins/reference/byteplus)** (`@marketingclaw/byteplus-provider`) - included in MarketingClaw. Adds BytePlus, BytePlus Plan model provider support to MarketingClaw.

- **[canvas](/plugins/reference/canvas)** (`@marketingclaw/canvas-plugin`) - included in MarketingClaw. Experimental Canvas control and A2UI rendering surfaces for paired nodes.

- **[clawrouter](/plugins/reference/clawrouter)** (`@marketingclaw/clawrouter`) - included in MarketingClaw. Adds ClawRouter model provider support to MarketingClaw.

- **[codex-supervisor](/plugins/reference/codex-supervisor)** (`@marketingclaw/codex-supervisor`) - included in MarketingClaw. Supervise Codex app-server sessions from MarketingClaw.

- **[cohere](/plugins/reference/cohere)** (`@marketingclaw/cohere-provider`) - included in MarketingClaw; npm; ClawHub: `clawhub:@marketingclaw/cohere-provider`. MarketingClaw Cohere provider plugin.

- **[comfy](/plugins/reference/comfy)** (`@marketingclaw/comfy-provider`) - included in MarketingClaw. Adds ComfyUI model provider support to MarketingClaw.

- **[copilot-proxy](/plugins/reference/copilot-proxy)** (`@marketingclaw/copilot-proxy`) - included in MarketingClaw. Adds Copilot Proxy model provider support to MarketingClaw.

- **[deepgram](/plugins/reference/deepgram)** (`@marketingclaw/deepgram-provider`) - included in MarketingClaw. Adds media understanding provider support. Adds realtime transcription provider support.

- **[document-extract](/plugins/reference/document-extract)** (`@marketingclaw/document-extract-plugin`) - included in MarketingClaw. Extract text and fallback page images from local document attachments.

- **[duckduckgo](/plugins/reference/duckduckgo)** (`@marketingclaw/duckduckgo-plugin`) - included in MarketingClaw. Adds web search provider support.

- **[elevenlabs](/plugins/reference/elevenlabs)** (`@marketingclaw/elevenlabs-speech`) - included in MarketingClaw. Adds media understanding provider support. Adds realtime transcription provider support. Adds text-to-speech provider support.

- **[fal](/plugins/reference/fal)** (`@marketingclaw/fal-provider`) - included in MarketingClaw. Adds fal model provider support to MarketingClaw.

- **[file-transfer](/plugins/reference/file-transfer)** (`@marketingclaw/file-transfer`) - included in MarketingClaw. Fetch, list, and write files on paired nodes via dedicated node commands. Bypasses bash stdout truncation by using base64 over node.invoke for binaries up to 16 MB.

- **[github-copilot](/plugins/reference/github-copilot)** (`@marketingclaw/github-copilot-provider`) - included in MarketingClaw. Adds GitHub Copilot model provider support to MarketingClaw.

- **[google](/plugins/reference/google)** (`@marketingclaw/google-plugin`) - included in MarketingClaw. Adds Google, Google Gemini CLI, Google Vertex model provider support to MarketingClaw.

- **[huggingface](/plugins/reference/huggingface)** (`@marketingclaw/huggingface-provider`) - included in MarketingClaw. Adds Hugging Face model provider support to MarketingClaw.

- **[imessage](/plugins/reference/imessage)** (`@marketingclaw/imessage`) - included in MarketingClaw. Adds the iMessage channel surface for sending and receiving MarketingClaw messages.

- **[litellm](/plugins/reference/litellm)** (`@marketingclaw/litellm-provider`) - included in MarketingClaw. Adds LiteLLM model provider support to MarketingClaw.

- **[llm-task](/plugins/reference/llm-task)** (`@marketingclaw/llm-task`) - included in MarketingClaw. Generic JSON-only LLM tool for structured tasks callable from workflows.

- **[lmstudio](/plugins/reference/lmstudio)** (`@marketingclaw/lmstudio-provider`) - included in MarketingClaw. Adds LM Studio model provider support to MarketingClaw.

- **[logbook](/plugins/reference/logbook)** (`@marketingclaw/logbook`) - included in MarketingClaw. Automatic work journal: captures periodic screen snapshots from a paired node and turns them into a reviewable timeline of your day.

- **[memory-core](/plugins/reference/memory-core)** (`@marketingclaw/memory-core`) - included in MarketingClaw. Adds agent-callable tools.

- **[memory-wiki](/plugins/reference/memory-wiki)** (`@marketingclaw/memory-wiki`) - included in MarketingClaw. Persistent wiki compiler and Obsidian-friendly knowledge vault for MarketingClaw.

- **[microsoft](/plugins/reference/microsoft)** (`@marketingclaw/microsoft-speech`) - included in MarketingClaw. Adds text-to-speech provider support.

- **[microsoft-foundry](/plugins/reference/microsoft-foundry)** (`@marketingclaw/microsoft-foundry`) - included in MarketingClaw. Adds Microsoft Foundry model provider support to MarketingClaw.

- **[migrate-claude](/plugins/reference/migrate-claude)** (`@marketingclaw/migrate-claude`) - included in MarketingClaw. Imports Claude Code and Claude Desktop instructions, MCP servers, skills, and safe configuration into MarketingClaw.

- **[migrate-hermes](/plugins/reference/migrate-hermes)** (`@marketingclaw/migrate-hermes`) - included in MarketingClaw. Imports Hermes configuration, memories, skills, and supported credentials into MarketingClaw.

- **[minimax](/plugins/reference/minimax)** (`@marketingclaw/minimax-provider`) - included in MarketingClaw. Adds MiniMax, MiniMax Portal model provider support to MarketingClaw.

- **[mistral](/plugins/reference/mistral)** (`@marketingclaw/mistral-provider`) - included in MarketingClaw. Adds Mistral model provider support to MarketingClaw.

- **[novita](/plugins/reference/novita)** (`@marketingclaw/novita-provider`) - included in MarketingClaw. Adds Novita, Novita AI, Novitaai model provider support to MarketingClaw.

- **[nvidia](/plugins/reference/nvidia)** (`@marketingclaw/nvidia-provider`) - included in MarketingClaw. Adds NVIDIA model provider support to MarketingClaw.

- **[oc-path](/plugins/reference/oc-path)** (`@marketingclaw/oc-path`) - included in MarketingClaw. Adds the marketingclaw path CLI for oc:// workspace file addressing.

- **[ollama](/plugins/reference/ollama)** (`@marketingclaw/ollama-provider`) - included in MarketingClaw. Adds Ollama, Ollama Cloud model provider support to MarketingClaw.

- **[open-prose](/plugins/reference/open-prose)** (`@marketingclaw/open-prose`) - included in MarketingClaw. OpenProse VM skill pack with a /prose slash command.

- **[openai](/plugins/reference/openai)** (`@marketingclaw/openai-provider`) - included in MarketingClaw. Adds OpenAI model provider support to MarketingClaw.

- **[opencode](/plugins/reference/opencode)** (`@marketingclaw/opencode-provider`) - included in MarketingClaw. Adds OpenCode model provider support to MarketingClaw.

- **[opencode-go](/plugins/reference/opencode-go)** (`@marketingclaw/opencode-go-provider`) - included in MarketingClaw. Adds OpenCode Go model provider support to MarketingClaw.

- **[openrouter](/plugins/reference/openrouter)** (`@marketingclaw/openrouter-provider`) - included in MarketingClaw. Adds OpenRouter model provider support to MarketingClaw.

- **[policy](/plugins/reference/policy)** (`@marketingclaw/policy`) - included in MarketingClaw. Adds policy-backed doctor checks for workspace conformance.

- **[runway](/plugins/reference/runway)** (`@marketingclaw/runway-provider`) - included in MarketingClaw. Adds video generation provider support.

- **[senseaudio](/plugins/reference/senseaudio)** (`@marketingclaw/senseaudio-provider`) - included in MarketingClaw. Adds media understanding provider support.

- **[sglang](/plugins/reference/sglang)** (`@marketingclaw/sglang-provider`) - included in MarketingClaw. Adds SGLang model provider support to MarketingClaw.

- **[synthetic](/plugins/reference/synthetic)** (`@marketingclaw/synthetic-provider`) - included in MarketingClaw. Adds Synthetic model provider support to MarketingClaw.

- **[telegram](/plugins/reference/telegram)** (`@marketingclaw/telegram`) - included in MarketingClaw. Adds the Telegram channel surface for sending and receiving MarketingClaw messages.

- **[together](/plugins/reference/together)** (`@marketingclaw/together-provider`) - included in MarketingClaw. Adds Together model provider support to MarketingClaw.

- **[tts-local-cli](/plugins/reference/tts-local-cli)** (`@marketingclaw/tts-local-cli`) - included in MarketingClaw. Adds text-to-speech provider support.

- **[vault](/plugins/reference/vault)** (`@marketingclaw/vault`) - included in MarketingClaw. HashiCorp Vault SecretRef provider integration.

- **[vllm](/plugins/reference/vllm)** (`@marketingclaw/vllm-provider`) - included in MarketingClaw. Adds vLLM model provider support to MarketingClaw.

- **[volcengine](/plugins/reference/volcengine)** (`@marketingclaw/volcengine-provider`) - included in MarketingClaw. Adds Volcengine, Volcengine Plan model provider support to MarketingClaw.

- **[voyage](/plugins/reference/voyage)** (`@marketingclaw/voyage-provider`) - included in MarketingClaw. Adds memory embedding provider support.

- **[vydra](/plugins/reference/vydra)** (`@marketingclaw/vydra-provider`) - included in MarketingClaw. Adds Vydra model provider support to MarketingClaw.

- **[web-readability](/plugins/reference/web-readability)** (`@marketingclaw/web-readability-plugin`) - included in MarketingClaw. Extract readable article content from local HTML web fetch responses.

- **[webhooks](/plugins/reference/webhooks)** (`@marketingclaw/webhooks`) - included in MarketingClaw. Authenticated inbound webhooks that bind external automation to MarketingClaw TaskFlows.

- **[workboard](/plugins/reference/workboard)** (`@marketingclaw/workboard`) - included in MarketingClaw. Dashboard workboard for agent-owned issues and sessions.

- **[xai](/plugins/reference/xai)** (`@marketingclaw/xai-plugin`) - included in MarketingClaw. Adds xAI model provider support to MarketingClaw.

- **[xiaomi](/plugins/reference/xiaomi)** (`@marketingclaw/xiaomi-provider`) - included in MarketingClaw. Adds Xiaomi, Xiaomi Token Plan model provider support to MarketingClaw.

## Official external packages

70 plugins

- **[acpx](/plugins/reference/acpx)** (`@marketingclaw/acpx`) - npm; ClawHub. MarketingClaw ACP runtime backend with plugin-owned session and transport management.

- **[amazon-bedrock](/plugins/reference/amazon-bedrock)** (`@marketingclaw/amazon-bedrock-provider`) - npm; ClawHub. MarketingClaw Amazon Bedrock provider plugin with model discovery, embeddings, and guardrail support.

- **[amazon-bedrock-mantle](/plugins/reference/amazon-bedrock-mantle)** (`@marketingclaw/amazon-bedrock-mantle-provider`) - npm; ClawHub. MarketingClaw Amazon Bedrock Mantle provider plugin for OpenAI-compatible model routing.

- **[anthropic-vertex](/plugins/reference/anthropic-vertex)** (`@marketingclaw/anthropic-vertex-provider`) - npm; ClawHub. MarketingClaw Anthropic Vertex provider plugin for Claude models on Google Vertex AI.

- **[arcee](/plugins/reference/arcee)** (`@marketingclaw/arcee-provider`) - npm; ClawHub: `clawhub:@marketingclaw/arcee-provider`. Adds Arcee model provider support to MarketingClaw.

- **[brave](/plugins/reference/brave)** (`@marketingclaw/brave-plugin`) - npm; ClawHub. MarketingClaw Brave Search provider plugin for web search.

- **[cerebras](/plugins/reference/cerebras)** (`@marketingclaw/cerebras-provider`) - npm; ClawHub: `clawhub:@marketingclaw/cerebras-provider`. Adds Cerebras model provider support to MarketingClaw.

- **[chutes](/plugins/reference/chutes)** (`@marketingclaw/chutes-provider`) - npm; ClawHub: `clawhub:@marketingclaw/chutes-provider`. Adds Chutes model provider support to MarketingClaw.

- **[clickclack](/plugins/reference/clickclack)** (`@marketingclaw/clickclack`) - npm; ClawHub: `clawhub:@marketingclaw/clickclack`. Adds the Clickclack channel surface for sending and receiving MarketingClaw messages.

- **[cloudflare-ai-gateway](/plugins/reference/cloudflare-ai-gateway)** (`@marketingclaw/cloudflare-ai-gateway-provider`) - npm; ClawHub: `clawhub:@marketingclaw/cloudflare-ai-gateway-provider`. Adds Cloudflare AI Gateway model provider support to MarketingClaw.

- **[codex](/plugins/reference/codex)** (`@marketingclaw/codex`) - npm; ClawHub. MarketingClaw Codex app-server harness and model provider plugin with a Codex-managed GPT catalog.

- **[copilot](/plugins/reference/copilot)** (`@marketingclaw/copilot`) - npm; ClawHub: `clawhub:@marketingclaw/copilot`. Registers the GitHub Copilot agent runtime.

- **[deepinfra](/plugins/reference/deepinfra)** (`@marketingclaw/deepinfra-provider`) - npm; ClawHub: `clawhub:@marketingclaw/deepinfra-provider`. Adds DeepInfra model provider support to MarketingClaw.

- **[deepseek](/plugins/reference/deepseek)** (`@marketingclaw/deepseek-provider`) - npm; ClawHub: `clawhub:@marketingclaw/deepseek-provider`. Adds DeepSeek model provider support to MarketingClaw.

- **[diagnostics-otel](/plugins/reference/diagnostics-otel)** (`@marketingclaw/diagnostics-otel`) - npm; ClawHub: `clawhub:@marketingclaw/diagnostics-otel`. MarketingClaw diagnostics OpenTelemetry exporter for metrics, traces, and logs.

- **[diagnostics-prometheus](/plugins/reference/diagnostics-prometheus)** (`@marketingclaw/diagnostics-prometheus`) - npm; ClawHub: `clawhub:@marketingclaw/diagnostics-prometheus`. MarketingClaw diagnostics Prometheus exporter for runtime metrics.

- **[diffs](/plugins/reference/diffs)** (`@marketingclaw/diffs`) - npm; ClawHub. MarketingClaw read-only diff viewer plugin and file renderer for agents.

- **[diffs-language-pack](/plugins/reference/diffs-language-pack)** (`@marketingclaw/diffs-language-pack`) - npm; ClawHub: `clawhub:@marketingclaw/diffs-language-pack`. Adds syntax highlighting for languages outside the default diffs viewer set.

- **[discord](/plugins/reference/discord)** (`@marketingclaw/discord`) - npm; ClawHub. MarketingClaw Discord channel plugin for channels, DMs, commands, and app events.

- **[exa](/plugins/reference/exa)** (`@marketingclaw/exa-plugin`) - npm; ClawHub: `clawhub:@marketingclaw/exa-plugin`. Adds web search provider support.

- **[featherless](/plugins/reference/featherless)** (`@marketingclaw/featherless-provider`) - npm; ClawHub: `clawhub:@marketingclaw/featherless-provider`. MarketingClaw Featherless AI provider plugin.

- **[feishu](/plugins/reference/feishu)** (`@marketingclaw/feishu`) - npm; ClawHub. MarketingClaw Feishu/Lark channel plugin for chats and workplace tools (community maintained by @m1heng).

- **[firecrawl](/plugins/reference/firecrawl)** (`@marketingclaw/firecrawl-plugin`) - npm; ClawHub: `clawhub:@marketingclaw/firecrawl-plugin`. Adds agent-callable tools. Adds web fetch provider support. Adds web search provider support.

- **[fireworks](/plugins/reference/fireworks)** (`@marketingclaw/fireworks-provider`) - npm; ClawHub: `clawhub:@marketingclaw/fireworks-provider`. Adds Fireworks model provider support to MarketingClaw.

- **[gmi](/plugins/reference/gmi)** (`@marketingclaw/gmi-provider`) - npm; ClawHub: `clawhub:@marketingclaw/gmi-provider`. MarketingClaw GMI Cloud provider plugin.

- **[google-meet](/plugins/reference/google-meet)** (`@marketingclaw/google-meet`) - npm; ClawHub. MarketingClaw Google Meet participant plugin for joining calls through Chrome or Twilio transports.

- **[googlechat](/plugins/reference/googlechat)** (`@marketingclaw/googlechat`) - npm; ClawHub. MarketingClaw Google Chat channel plugin for spaces and direct messages.

- **[gradium](/plugins/reference/gradium)** (`@marketingclaw/gradium-speech`) - npm; ClawHub: `clawhub:@marketingclaw/gradium-speech`. Adds text-to-speech provider support.

- **[groq](/plugins/reference/groq)** (`@marketingclaw/groq-provider`) - npm; ClawHub: `clawhub:@marketingclaw/groq-provider`. Adds Groq model provider support to MarketingClaw.

- **[inworld](/plugins/reference/inworld)** (`@marketingclaw/inworld-speech`) - npm; ClawHub: `clawhub:@marketingclaw/inworld-speech`. Inworld streaming text-to-speech (MP3, OGG_OPUS, PCM telephony).

- **[irc](/plugins/reference/irc)** (`@marketingclaw/irc`) - npm; ClawHub: `clawhub:@marketingclaw/irc`. Adds the IRC channel surface for sending and receiving MarketingClaw messages.

- **[kilocode](/plugins/reference/kilocode)** (`@marketingclaw/kilocode-provider`) - npm; ClawHub: `clawhub:@marketingclaw/kilocode-provider`. Adds Kilocode model provider support to MarketingClaw.

- **[kimi](/plugins/reference/kimi)** (`@marketingclaw/kimi-provider`) - npm; ClawHub: `clawhub:@marketingclaw/kimi-provider`. Adds Kimi, Kimi Coding model provider support to MarketingClaw.

- **[line](/plugins/reference/line)** (`@marketingclaw/line`) - npm; ClawHub. MarketingClaw LINE channel plugin for LINE Bot API chats.

- **[llama-cpp](/plugins/reference/llama-cpp)** (`@marketingclaw/llama-cpp-provider`) - npm; ClawHub. Local GGUF embeddings through node-llama-cpp.

- **[lobster](/plugins/reference/lobster)** (`@marketingclaw/lobster`) - npm; ClawHub. Lobster workflow tool plugin for typed pipelines and resumable approvals.

- **[longcat](/plugins/reference/longcat)** (`@marketingclaw/longcat-provider`) - npm; ClawHub: `clawhub:@marketingclaw/longcat-provider`. MarketingClaw LongCat provider plugin.

- **[matrix](/plugins/reference/matrix)** (`@marketingclaw/matrix`) - ClawHub: `clawhub:@marketingclaw/matrix`; npm. MarketingClaw Matrix channel plugin for rooms and direct messages.

- **[mattermost](/plugins/reference/mattermost)** (`@marketingclaw/mattermost`) - npm; ClawHub: `clawhub:@marketingclaw/mattermost`. Adds the Mattermost channel surface for sending and receiving MarketingClaw messages.

- **[memory-lancedb](/plugins/reference/memory-lancedb)** (`@marketingclaw/memory-lancedb`) - npm; ClawHub. MarketingClaw LanceDB-backed long-term memory plugin with auto-recall, auto-capture, and vector search.

- **[moonshot](/plugins/reference/moonshot)** (`@marketingclaw/moonshot-provider`) - npm; ClawHub: `clawhub:@marketingclaw/moonshot-provider`. Adds Moonshot model provider support to MarketingClaw.

- **[msteams](/plugins/reference/msteams)** (`@marketingclaw/msteams`) - npm; ClawHub. MarketingClaw Microsoft Teams channel plugin for bot conversations.

- **[nextcloud-talk](/plugins/reference/nextcloud-talk)** (`@marketingclaw/nextcloud-talk`) - npm; ClawHub. MarketingClaw Nextcloud Talk channel plugin for conversations.

- **[nostr](/plugins/reference/nostr)** (`@marketingclaw/nostr`) - npm; ClawHub. MarketingClaw Nostr channel plugin for NIP-04 encrypted direct messages.

- **[openshell](/plugins/reference/openshell)** (`@marketingclaw/openshell-sandbox`) - npm; ClawHub. MarketingClaw sandbox backend for the NVIDIA OpenShell CLI with mirrored local workspaces and SSH command execution.

- **[parallel](/tools/parallel-search)** (`@marketingclaw/parallel-plugin`) - npm; ClawHub: `clawhub:@marketingclaw/parallel-plugin`. Adds web search provider support.

- **[perplexity](/plugins/reference/perplexity)** (`@marketingclaw/perplexity-plugin`) - npm; ClawHub: `clawhub:@marketingclaw/perplexity-plugin`. Adds web search provider support.

- **[pixverse](/plugins/reference/pixverse)** (`@marketingclaw/pixverse-provider`) - npm; ClawHub: `clawhub:@marketingclaw/pixverse-provider`. MarketingClaw PixVerse video generation provider plugin.

- **[qianfan](/plugins/reference/qianfan)** (`@marketingclaw/qianfan-provider`) - npm; ClawHub: `clawhub:@marketingclaw/qianfan-provider`. Adds Qianfan model provider support to MarketingClaw.

- **[qqbot](/plugins/reference/qqbot)** (`@marketingclaw/qqbot`) - npm; ClawHub. MarketingClaw QQ Bot channel plugin for group and direct-message workflows.

- **[qwen](/plugins/reference/qwen)** (`@marketingclaw/qwen-provider`) - npm; ClawHub: `clawhub:@marketingclaw/qwen-provider`. Adds Qwen, Qwen Cloud, Model Studio, DashScope, Qwen Oauth, Qwen Portal, Qwen CLI model provider support to MarketingClaw.

- **[raft](/plugins/reference/raft)** (`@marketingclaw/raft`) - npm; ClawHub. MarketingClaw Raft channel plugin for secure CLI wake bridges.

- **[searxng](/plugins/reference/searxng)** (`@marketingclaw/searxng-plugin`) - npm; ClawHub: `clawhub:@marketingclaw/searxng-plugin`. Adds web search provider support.

- **[signal](/plugins/reference/signal)** (`@marketingclaw/signal`) - npm; ClawHub: `clawhub:@marketingclaw/signal`. Adds the Signal channel surface for sending and receiving MarketingClaw messages.

- **[slack](/plugins/reference/slack)** (`@marketingclaw/slack`) - npm; ClawHub. MarketingClaw Slack channel plugin for channels, DMs, commands, and app events.

- **[sms](/plugins/reference/sms)** (`@marketingclaw/sms`) - npm; ClawHub: `clawhub:@marketingclaw/sms`. Twilio SMS channel plugin for MarketingClaw text messages.

- **[stepfun](/plugins/reference/stepfun)** (`@marketingclaw/stepfun-provider`) - npm; ClawHub: `clawhub:@marketingclaw/stepfun-provider`. Adds StepFun, StepFun Plan model provider support to MarketingClaw.

- **[synology-chat](/plugins/reference/synology-chat)** (`@marketingclaw/synology-chat`) - npm; ClawHub. Synology Chat channel plugin for MarketingClaw channels and direct messages.

- **[tavily](/plugins/reference/tavily)** (`@marketingclaw/tavily-plugin`) - npm; ClawHub: `clawhub:@marketingclaw/tavily-plugin`. Adds agent-callable tools. Adds web search provider support.

- **[tencent](/plugins/reference/tencent)** (`@marketingclaw/tencent-provider`) - npm; ClawHub: `clawhub:@marketingclaw/tencent-provider`. Adds Tencent TokenHub, Tencent Tokenplan model provider support to MarketingClaw.

- **[tlon](/plugins/reference/tlon)** (`@marketingclaw/tlon`) - npm; ClawHub. MarketingClaw Tlon/Urbit channel plugin for chat workflows.

- **[tokenjuice](/plugins/reference/tokenjuice)** (`@marketingclaw/tokenjuice`) - npm; ClawHub: `clawhub:@marketingclaw/tokenjuice`. Compacts exec and bash tool results with tokenjuice reducers.

- **[twitch](/plugins/reference/twitch)** (`@marketingclaw/twitch`) - npm; ClawHub. MarketingClaw Twitch channel plugin for chat and moderation workflows.

- **[venice](/plugins/reference/venice)** (`@marketingclaw/venice-provider`) - npm; ClawHub: `clawhub:@marketingclaw/venice-provider`. Adds Venice model provider support to MarketingClaw.

- **[vercel-ai-gateway](/plugins/reference/vercel-ai-gateway)** (`@marketingclaw/vercel-ai-gateway-provider`) - npm; ClawHub: `clawhub:@marketingclaw/vercel-ai-gateway-provider`. Adds Vercel AI Gateway model provider support to MarketingClaw.

- **[voice-call](/plugins/reference/voice-call)** (`@marketingclaw/voice-call`) - npm; ClawHub. MarketingClaw voice-call plugin for Twilio, Telnyx, and Plivo phone calls.

- **[whatsapp](/plugins/reference/whatsapp)** (`@marketingclaw/whatsapp`) - ClawHub: `clawhub:@marketingclaw/whatsapp`; npm. MarketingClaw WhatsApp channel plugin for WhatsApp Web chats.

- **[zai](/plugins/reference/zai)** (`@marketingclaw/zai-provider`) - npm; ClawHub: `clawhub:@marketingclaw/zai-provider`. Adds Z.AI model provider support to MarketingClaw.

- **[zalo](/plugins/reference/zalo)** (`@marketingclaw/zalo`) - npm; ClawHub. MarketingClaw Zalo channel plugin for bot and webhook chats.

- **[zalouser](/plugins/reference/zalouser)** (`@marketingclaw/zalouser`) - npm; ClawHub. MarketingClaw Zalo Personal Account plugin via native zca-js integration.

## Source checkout only

3 plugins

- **[qa-channel](/plugins/reference/qa-channel)** (`@marketingclaw/qa-channel`) - source checkout only. Adds the QA Channel surface for sending and receiving MarketingClaw messages.

- **[qa-lab](/plugins/reference/qa-lab)** (`@marketingclaw/qa-lab`) - source checkout only. MarketingClaw QA lab plugin with private debugger UI and scenario runner.

- **[qa-matrix](/plugins/reference/qa-matrix)** (`@marketingclaw/qa-matrix`) - source checkout only. Matrix QA transport runner and substrate.
