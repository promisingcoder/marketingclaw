import SwiftUI

struct MarketingClawDocsScreen: View {
    private let docsURL = URL(string: "https://docs.marketingclaw.ai")!
    private let gatewayURL = URL(string: "https://docs.marketingclaw.ai/gateway")!
    private let pairingURL = URL(string: "https://docs.marketingclaw.ai/channels/pairing")!
    let headerLeadingAction: MarketingClawSidebarHeaderAction?
    let usesNativeNavigationChrome: Bool
    let gatewayAction: (() -> Void)?

    init(
        headerLeadingAction: MarketingClawSidebarHeaderAction? = nil,
        usesNativeNavigationChrome: Bool = false,
        gatewayAction: (() -> Void)? = nil)
    {
        self.headerLeadingAction = headerLeadingAction
        self.usesNativeNavigationChrome = usesNativeNavigationChrome
        self.gatewayAction = gatewayAction
    }

    var body: some View {
        ZStack {
            MarketingClawProBackground()
            ScrollView {
                VStack(alignment: .leading, spacing: 16) {
                    if !self.usesNativeNavigationChrome {
                        self.headerCard
                    }
                    self.linkCard
                }
                .padding(.vertical, 18)
                .font(MarketingClawType.body)
            }
        }
        .navigationTitle("Docs")
        .navigationBarTitleDisplayMode(.inline)
        .toolbar(self.usesNativeNavigationChrome ? .visible : .hidden, for: .navigationBar)
        .toolbar {
            if self.usesNativeNavigationChrome, let gatewayAction {
                ToolbarItem(placement: .topBarTrailing) {
                    Button(action: gatewayAction) {
                        Image(systemName: "antenna.radiowaves.left.and.right")
                            .font(MarketingClawType.subheadSemiBold)
                    }
                    .accessibilityLabel("Gateway settings")
                }
            }
        }
    }

    private var headerCard: some View {
        ProCard(radius: MarketingClawProMetric.cardRadius) {
            MarketingClawAdaptiveHeaderRow(
                title: "Docs",
                subtitle: "Gateway setup, pairing, channels, and mobile node reference.",
                titleFont: MarketingClawType.headline,
                subtitleFont: MarketingClawType.caption)
            {
                HStack(alignment: .top, spacing: 12) {
                    if let headerLeadingAction {
                        MarketingClawSidebarHeaderLeadingSlot(action: headerLeadingAction)
                    }
                    ProIconBadge(systemName: "book", color: MarketingClawBrand.accent)
                }
            } accessory: {
                self.gatewayPill
            }
        }
        .padding(.horizontal, MarketingClawProMetric.pagePadding)
    }

    @ViewBuilder
    private var gatewayPill: some View {
        if let gatewayAction {
            Button(action: gatewayAction) {
                MarketingClawGatewayCompactPill()
            }
            .buttonBorderShape(.capsule)
            .marketingClawGlassButton()
            .accessibilityHint("Opens Settings / Gateway")
        } else {
            MarketingClawGatewayCompactPill()
        }
    }

    private var linkCard: some View {
        ProCard(padding: 0, radius: MarketingClawProMetric.cardRadius) {
            VStack(spacing: 0) {
                self.docsLinkRow(
                    title: "Docs Home",
                    detail: "Browse the current MarketingClaw reference.",
                    icon: "book",
                    url: self.docsURL)
                Divider().padding(.leading, 58)
                self.docsLinkRow(
                    title: "Gateway",
                    detail: "Connection, auth, and diagnostics.",
                    icon: "network",
                    url: self.gatewayURL)
                Divider().padding(.leading, 58)
                self.docsLinkRow(
                    title: "Pairing",
                    detail: "Mobile setup codes, QR, and node approval.",
                    icon: "qrcode",
                    url: self.pairingURL)
            }
        }
        .padding(.horizontal, MarketingClawProMetric.pagePadding)
    }

    private func docsLinkRow(title: String, detail: String, icon: String, url: URL) -> some View {
        Link(destination: url) {
            HStack(spacing: 12) {
                ProIconBadge(systemName: icon, color: MarketingClawBrand.accent)
                VStack(alignment: .leading, spacing: 3) {
                    Text(title)
                        .font(MarketingClawType.subheadSemiBold)
                    Text(detail)
                        .font(MarketingClawType.caption)
                        .foregroundStyle(.secondary)
                        .lineLimit(1)
                }
                Spacer(minLength: 8)
                Image(systemName: "arrow.up.right")
                    .font(MarketingClawType.captionBold)
                    .foregroundStyle(.secondary)
            }
            .padding(.horizontal, 14)
            .padding(.vertical, 12)
            .contentShape(Rectangle())
        }
        .buttonStyle(.plain)
    }
}
