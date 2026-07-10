import MarketingClawKit
import SwiftUI
import UIKit

struct GatewayProblemBanner: View {
    let problem: GatewayConnectionProblem
    var primaryActionTitle: String?
    var onPrimaryAction: (() -> Void)?
    var onShowDetails: (() -> Void)?

    var body: some View {
        MarketingClawNoticeBanner(
            icon: self.iconName,
            title: self.problem.title,
            message: self.problem.message,
            ownerLabel: self.ownerLabel,
            tint: self.tint,
            detail: self.problem.requestId.map(MarketingClawNoticeDetail.requestID),
            primaryActionTitle: self.primaryActionTitle,
            onPrimaryAction: self.onPrimaryAction,
            secondaryActionTitle: "Details",
            onSecondaryAction: self.onShowDetails)
    }

    private var iconName: String {
        switch self.problem.kind {
        case .pairingRequired,
             .pairingRoleUpgradeRequired,
             .pairingScopeUpgradeRequired,
             .pairingMetadataUpgradeRequired:
            "person.crop.circle.badge.clock"
        case .timeout, .connectionRefused, .reachabilityFailed, .websocketCancelled:
            "wifi.exclamationmark"
        case .deviceIdentityRequired,
             .deviceSignatureExpired,
             .deviceNonceRequired,
             .deviceNonceMismatch,
             .deviceSignatureInvalid,
             .devicePublicKeyInvalid,
             .deviceIdMismatch:
            "lock.shield"
        default:
            "exclamationmark.triangle.fill"
        }
    }

    private var tint: Color {
        switch self.problem.kind {
        case .pairingRequired,
             .pairingRoleUpgradeRequired,
             .pairingScopeUpgradeRequired,
             .pairingMetadataUpgradeRequired:
            MarketingClawBrand.warn
        case .timeout, .connectionRefused, .reachabilityFailed, .websocketCancelled:
            MarketingClawBrand.warn
        default:
            MarketingClawBrand.danger
        }
    }

    private var ownerLabel: String {
        switch self.problem.owner {
        case .gateway:
            "Fix on gateway"
        case .iphone:
            "Fix on this device"
        case .both:
            "Check both"
        case .network:
            "Check network"
        case .unknown:
            "Needs attention"
        }
    }
}

struct GatewayProblemDetailsSheet: View {
    @Environment(\.dismiss) private var dismiss

    let problem: GatewayConnectionProblem
    var primaryActionTitle: String?
    var onPrimaryAction: (() -> Void)?

    @State private var copyFeedback: String?

    var body: some View {
        NavigationStack {
            List {
                Section {
                    VStack(alignment: .leading, spacing: 10) {
                        Text(self.problem.title)
                            .font(MarketingClawType.title3)
                        Text(self.problem.message)
                            .font(MarketingClawType.body)
                            .foregroundStyle(.secondary)
                        Text(self.ownerSummary)
                            .font(MarketingClawType.footnoteSemiBold)
                            .foregroundStyle(.secondary)
                    }
                    .frame(maxWidth: .infinity, alignment: .leading)
                    .padding(.vertical, 4)
                }

                if let requestId = self.problem.requestId {
                    Section {
                        Text(verbatim: requestId)
                            .font(MarketingClawType.mono)
                            .textSelection(.enabled)
                        Button {
                            UIPasteboard.general.string = requestId
                            self.copyFeedback = "Copied request ID"
                        } label: {
                            Text("Copy request ID")
                                .font(MarketingClawType.subheadSemiBold)
                        }
                        .font(MarketingClawType.subheadSemiBold)
                    } header: {
                        Text("Request")
                            .font(MarketingClawType.captionSemiBold)
                    }
                }

                if let actionCommand = self.problem.actionCommand {
                    Section {
                        Text(verbatim: actionCommand)
                            .font(MarketingClawType.mono)
                            .textSelection(.enabled)
                        Button {
                            UIPasteboard.general.string = actionCommand
                            self.copyFeedback = "Copied command"
                        } label: {
                            Text("Copy command")
                                .font(MarketingClawType.subheadSemiBold)
                        }
                        .font(MarketingClawType.subheadSemiBold)
                    } header: {
                        Text("Gateway command")
                            .font(MarketingClawType.captionSemiBold)
                    }
                }

                if let docsURL = self.problem.docsURL {
                    Section {
                        Link(destination: docsURL) {
                            Label("Open docs", systemImage: "book")
                                .font(MarketingClawType.subheadSemiBold)
                        }
                        .font(MarketingClawType.subheadSemiBold)
                        Text(verbatim: docsURL.absoluteString)
                            .font(MarketingClawType.footnote)
                            .foregroundStyle(.secondary)
                            .textSelection(.enabled)
                    } header: {
                        Text("Help")
                            .font(MarketingClawType.captionSemiBold)
                    }
                }

                if let technicalDetails = self.problem.technicalDetails {
                    Section {
                        Text(verbatim: technicalDetails)
                            .font(MarketingClawType.monoFootnote)
                            .foregroundStyle(.secondary)
                            .textSelection(.enabled)
                    } header: {
                        Text("Technical details")
                            .font(MarketingClawType.captionSemiBold)
                    }
                }

                if let copyFeedback {
                    Section {
                        Text(copyFeedback)
                            .font(MarketingClawType.footnote)
                            .foregroundStyle(.secondary)
                    }
                }
            }
            .navigationTitle("Connection problem")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .principal) {
                    Text("Connection problem")
                        .font(MarketingClawType.headline)
                }
                ToolbarItem(placement: .topBarLeading) {
                    if let primaryActionTitle, let onPrimaryAction {
                        Button {
                            self.dismiss()
                            onPrimaryAction()
                        } label: {
                            Text(primaryActionTitle)
                                .font(MarketingClawType.subheadSemiBold)
                        }
                        .font(MarketingClawType.subheadSemiBold)
                    }
                }
                ToolbarItem(placement: .topBarTrailing) {
                    Button {
                        self.dismiss()
                    } label: {
                        Text("Done")
                            .font(MarketingClawType.subheadSemiBold)
                    }
                    .font(MarketingClawType.subheadSemiBold)
                }
            }
        }
    }

    private var ownerSummary: String {
        switch self.problem.owner {
        case .gateway:
            "Primary fix: gateway"
        case .iphone:
            "Primary fix: this device"
        case .both:
            "Primary fix: check both this device and the gateway"
        case .network:
            "Primary fix: network or remote access"
        case .unknown:
            "Primary fix: review details and retry"
        }
    }
}
