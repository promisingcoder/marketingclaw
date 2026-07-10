// swift-tools-version: 6.2

import PackageDescription

let package = Package(
    name: "MarketingClawKit",
    platforms: [
        .iOS(.v18),
        .macOS(.v15),
        .watchOS(.v11),
    ],
    products: [
        .library(name: "MarketingClawProtocol", targets: ["MarketingClawProtocol"]),
        .library(name: "MarketingClawKit", targets: ["MarketingClawKit"]),
        .library(name: "MarketingClawChatUI", targets: ["MarketingClawChatUI"]),
    ],
    traits: [
        .trait(name: "Talk", description: "ElevenLabs cloud TTS / talk support"),
        .default(enabledTraits: ["Talk"]),
    ],
    dependencies: [
        .package(url: "https://github.com/steipete/ElevenLabsKit", exact: "0.1.1"),
        .package(url: "https://github.com/mgriebling/SwiftMath", exact: "1.7.3"),
        .package(url: "https://github.com/swiftlang/swift-markdown", exact: "0.8.0"),
    ],
    targets: [
        .target(
            name: "MarketingClawProtocol",
            path: "Sources/MarketingClawProtocol",
            swiftSettings: [
                .enableUpcomingFeature("StrictConcurrency"),
            ]),
        .target(
            name: "MarketingClawKit",
            dependencies: [
                "MarketingClawProtocol",
                .product(
                    name: "ElevenLabsKit",
                    package: "ElevenLabsKit",
                    condition: .when(platforms: [.iOS, .macOS], traits: ["Talk"])),
            ],
            path: "Sources/MarketingClawKit",
            resources: [
                .process("Resources"),
            ],
            swiftSettings: [
                .enableUpcomingFeature("StrictConcurrency"),
            ]),
        .target(
            name: "MarketingClawChatUI",
            dependencies: [
                "MarketingClawKit",
                .product(name: "Markdown", package: "swift-markdown"),
                .product(name: "SwiftMath", package: "SwiftMath"),
            ],
            path: "Sources/MarketingClawChatUI",
            swiftSettings: [
                .enableUpcomingFeature("StrictConcurrency"),
            ]),
        .testTarget(
            name: "MarketingClawKitTests",
            dependencies: ["MarketingClawKit", "MarketingClawChatUI"],
            path: "Tests/MarketingClawKitTests",
            swiftSettings: [
                .enableUpcomingFeature("StrictConcurrency"),
                .enableExperimentalFeature("SwiftTesting"),
            ]),
    ])
