#!/usr/bin/env node
import { existsSync, lstatSync, mkdirSync, readdirSync, writeFileSync } from "node:fs";
import path from "node:path";

const repoRoot = path.resolve(import.meta.dirname, "..");
const iosRoot = path.join(repoRoot, "apps", "ios");
const outputPath = path.join(iosRoot, "SwiftSources.input.xcfilelist");

const iosSourceRoots = [
  "Sources",
  "ShareExtension",
  "ActivityWidget",
  path.join("WatchApp", "Sources"),
];

const sharedSwiftFiles = [
  "../shared/MarketingClawKit/Sources/MarketingClawChatUI/ChatComposer.swift",
  "../shared/MarketingClawKit/Sources/MarketingClawChatUI/ChatCodeHighlighter.swift",
  "../shared/MarketingClawKit/Sources/MarketingClawChatUI/ChatInlineMath.swift",
  "../shared/MarketingClawKit/Sources/MarketingClawChatUI/ChatLinkPreview.swift",
  "../shared/MarketingClawKit/Sources/MarketingClawChatUI/ChatMarkdownBlockSegmenter.swift",
  "../shared/MarketingClawKit/Sources/MarketingClawChatUI/ChatMarkdownBlockViews.swift",
  "../shared/MarketingClawKit/Sources/MarketingClawChatUI/ChatMarkdownPreprocessor.swift",
  "../shared/MarketingClawKit/Sources/MarketingClawChatUI/ChatMarkdownRenderer.swift",
  "../shared/MarketingClawKit/Sources/MarketingClawChatUI/ChatMessageViews.swift",
  "../shared/MarketingClawKit/Sources/MarketingClawChatUI/ChatModelPickerStore.swift",
  "../shared/MarketingClawKit/Sources/MarketingClawChatUI/ChatModels.swift",
  "../shared/MarketingClawKit/Sources/MarketingClawChatUI/ChatPayloadDecoding.swift",
  "../shared/MarketingClawKit/Sources/MarketingClawChatUI/ChatSessions.swift",
  "../shared/MarketingClawKit/Sources/MarketingClawChatUI/ChatSheets.swift",
  "../shared/MarketingClawKit/Sources/MarketingClawChatUI/ChatStreamingReveal.swift",
  "../shared/MarketingClawKit/Sources/MarketingClawChatUI/ChatTheme.swift",
  "../shared/MarketingClawKit/Sources/MarketingClawChatUI/ChatTranscriptCache.swift",
  "../shared/MarketingClawKit/Sources/MarketingClawChatUI/ChatTransport.swift",
  "../shared/MarketingClawKit/Sources/MarketingClawChatUI/ChatView.swift",
  "../shared/MarketingClawKit/Sources/MarketingClawChatUI/ChatViewModel+Attachments.swift",
  "../shared/MarketingClawKit/Sources/MarketingClawChatUI/ChatViewModel+SessionKeys.swift",
  "../shared/MarketingClawKit/Sources/MarketingClawChatUI/ChatViewModel+TranscriptCache.swift",
  "../shared/MarketingClawKit/Sources/MarketingClawChatUI/ChatViewModel.swift",
  "../shared/MarketingClawKit/Sources/MarketingClawChatUI/MarketingClawMascotView.swift",
  "../shared/MarketingClawKit/Sources/MarketingClawKit/AnyCodable.swift",
  "../shared/MarketingClawKit/Sources/MarketingClawKit/BonjourEscapes.swift",
  "../shared/MarketingClawKit/Sources/MarketingClawKit/BonjourTypes.swift",
  "../shared/MarketingClawKit/Sources/MarketingClawKit/BridgeFrames.swift",
  "../shared/MarketingClawKit/Sources/MarketingClawKit/CameraCommands.swift",
  "../shared/MarketingClawKit/Sources/MarketingClawKit/CanvasA2UIAction.swift",
  "../shared/MarketingClawKit/Sources/MarketingClawKit/CanvasA2UICommands.swift",
  "../shared/MarketingClawKit/Sources/MarketingClawKit/CanvasA2UIJSONL.swift",
  "../shared/MarketingClawKit/Sources/MarketingClawKit/CanvasCommandParams.swift",
  "../shared/MarketingClawKit/Sources/MarketingClawKit/CanvasCommands.swift",
  "../shared/MarketingClawKit/Sources/MarketingClawKit/Capabilities.swift",
  "../shared/MarketingClawKit/Sources/MarketingClawKit/DeepLinks.swift",
  "../shared/MarketingClawKit/Sources/MarketingClawKit/JPEGTranscoder.swift",
  "../shared/MarketingClawKit/Sources/MarketingClawKit/NodeError.swift",
  "../shared/MarketingClawKit/Sources/MarketingClawKit/MarketingClawKitResources.swift",
  "../shared/MarketingClawKit/Sources/MarketingClawKit/ScreenCommands.swift",
  "../shared/MarketingClawKit/Sources/MarketingClawKit/StoragePaths.swift",
  "../shared/MarketingClawKit/Sources/MarketingClawKit/SystemCommands.swift",
  "../shared/MarketingClawKit/Sources/MarketingClawKit/TalkDirective.swift",
  "../swabble/Sources/SwabbleKit/WakeWordGate.swift",
];

function normalizeFileListPath(filePath) {
  return filePath.split(path.sep).join("/");
}

function collectSwiftFiles(rootRelativePath) {
  const root = path.join(iosRoot, rootRelativePath);
  if (!existsSync(root)) {
    throw new Error(`Missing iOS Swift source root: ${rootRelativePath}`);
  }

  const entries = [];
  const visit = (dir) => {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        visit(fullPath);
      } else if (entry.isFile() && entry.name.endsWith(".swift")) {
        entries.push(normalizeFileListPath(path.relative(iosRoot, fullPath)));
      }
    }
  };
  visit(root);
  return entries;
}

function assertSharedFilesExist(filePaths) {
  for (const filePath of filePaths) {
    const absolutePath = path.resolve(iosRoot, filePath);
    if (!existsSync(absolutePath)) {
      throw new Error(`Missing shared Swift file listed for iOS lint: ${filePath}`);
    }
  }
}

function writeGeneratedFile(filePath, contents) {
  if (existsSync(filePath) && lstatSync(filePath).isSymbolicLink()) {
    throw new Error(`Refusing to overwrite symlinked file: ${filePath}`);
  }
  mkdirSync(path.dirname(filePath), { recursive: true });
  writeFileSync(filePath, contents, "utf8");
}

assertSharedFilesExist(sharedSwiftFiles);

const iosFiles = iosSourceRoots.flatMap(collectSwiftFiles);
const fileList = [...new Set([...iosFiles, ...sharedSwiftFiles])].toSorted((left, right) =>
  left.localeCompare(right),
);

writeGeneratedFile(outputPath, `${fileList.join("\n")}\n`);
process.stdout.write(`Prepared iOS Swift file list: ${path.relative(repoRoot, outputPath)}\n`);
