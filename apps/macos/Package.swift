// swift-tools-version: 6.2
// Package manifest for the MarketingClaw macOS companion (menu bar app + IPC library).

import PackageDescription

let package = Package(
    name: "MarketingClaw",
    platforms: [
        .macOS(.v15),
    ],
    products: [
        .library(name: "MarketingClawIPC", targets: ["MarketingClawIPC"]),
        .library(name: "MarketingClawDiscovery", targets: ["MarketingClawDiscovery"]),
        .executable(name: "MarketingClaw", targets: ["MarketingClaw"]),
        .executable(name: "marketingclaw-mac", targets: ["MarketingClawMacCLI"]),
    ],
    dependencies: [
        .package(url: "https://github.com/orchetect/MenuBarExtraAccess", exact: "1.3.0"),
        .package(url: "https://github.com/swiftlang/swift-subprocess.git", from: "0.4.0"),
        .package(url: "https://github.com/apple/swift-log.git", from: "1.10.1"),
        .package(url: "https://github.com/sparkle-project/Sparkle", from: "2.9.0"),
        .package(url: "https://github.com/steipete/Peekaboo.git", exact: "3.5.2"),
        .package(url: "https://github.com/pointfreeco/swift-concurrency-extras", from: "1.3.1"),
        .package(path: "../shared/MarketingClawKit"),
        .package(path: "../swabble"),
    ],
    targets: [
        .target(
            name: "MarketingClawIPC",
            dependencies: [],
            swiftSettings: [
                .enableUpcomingFeature("StrictConcurrency"),
            ]),
        .target(
            name: "MarketingClawDiscovery",
            dependencies: [
                .product(name: "MarketingClawKit", package: "MarketingClawKit"),
            ],
            path: "Sources/MarketingClawDiscovery",
            swiftSettings: [
                .enableUpcomingFeature("StrictConcurrency"),
            ]),
        .executableTarget(
            name: "MarketingClaw",
            dependencies: [
                "MarketingClawIPC",
                "MarketingClawDiscovery",
                .product(name: "MarketingClawKit", package: "MarketingClawKit"),
                .product(name: "MarketingClawChatUI", package: "MarketingClawKit"),
                .product(name: "MarketingClawProtocol", package: "MarketingClawKit"),
                .product(name: "SwabbleKit", package: "swabble"),
                .product(name: "MenuBarExtraAccess", package: "MenuBarExtraAccess"),
                .product(name: "Subprocess", package: "swift-subprocess"),
                .product(name: "Logging", package: "swift-log"),
                .product(name: "Sparkle", package: "Sparkle"),
                .product(name: "PeekabooBridge", package: "Peekaboo"),
                .product(name: "PeekabooAutomationKit", package: "Peekaboo"),
                .product(name: "ConcurrencyExtras", package: "swift-concurrency-extras"),
            ],
            exclude: [
                "Resources/Info.plist",
                "Resources/Localizable.xcstrings",
            ],
            resources: [
                .copy("Resources/MarketingClaw.icns"),
                .copy("Resources/DeviceModels"),
            ],
            swiftSettings: [
                .enableUpcomingFeature("StrictConcurrency"),
            ]),
        .executableTarget(
            name: "MarketingClawMacCLI",
            dependencies: [
                "MarketingClawDiscovery",
                .product(name: "MarketingClawKit", package: "MarketingClawKit"),
                .product(name: "MarketingClawProtocol", package: "MarketingClawKit"),
            ],
            path: "Sources/MarketingClawMacCLI",
            swiftSettings: [
                .enableUpcomingFeature("StrictConcurrency"),
            ]),
        .testTarget(
            name: "MarketingClawIPCTests",
            dependencies: [
                "MarketingClawIPC",
                "MarketingClaw",
                "MarketingClawMacCLI",
                "MarketingClawDiscovery",
                .product(name: "MarketingClawProtocol", package: "MarketingClawKit"),
                .product(name: "SwabbleKit", package: "swabble"),
            ],
            swiftSettings: [
                .enableUpcomingFeature("StrictConcurrency"),
                .enableExperimentalFeature("SwiftTesting"),
            ]),
    ])
