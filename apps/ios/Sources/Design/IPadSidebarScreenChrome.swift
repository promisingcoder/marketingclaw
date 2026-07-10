import SwiftUI

struct IPadSidebarScreenChrome<Content: View>: View {
    @Environment(\.verticalSizeClass) private var verticalSizeClass
    let title: String
    let subtitle: String
    let headerLeadingAction: MarketingClawSidebarHeaderAction?
    let usesNativeNavigationChrome: Bool
    let gatewayAction: (() -> Void)?
    @ViewBuilder var content: Content

    init(
        title: String,
        subtitle: String,
        headerLeadingAction: MarketingClawSidebarHeaderAction? = nil,
        usesNativeNavigationChrome: Bool = false,
        gatewayAction: (() -> Void)? = nil,
        @ViewBuilder content: () -> Content)
    {
        self.title = title
        self.subtitle = subtitle
        self.headerLeadingAction = headerLeadingAction
        self.usesNativeNavigationChrome = usesNativeNavigationChrome
        self.gatewayAction = gatewayAction
        self.content = content()
    }

    var body: some View {
        ZStack {
            MarketingClawProBackground()
            ScrollView {
                VStack(alignment: .leading, spacing: self.isCompactHeight ? 10 : 16) {
                    if !self.usesNativeNavigationChrome {
                        MarketingClawAdaptiveHeaderRow(
                            title: self.title,
                            subtitle: self.subtitle,
                            titleFont: self.isCompactHeight ? MarketingClawType.headline : MarketingClawType.title2SemiBold,
                            subtitleLineLimit: self.isCompactHeight ? 1 : 2)
                        {
                            if let headerLeadingAction {
                                MarketingClawSidebarHeaderLeadingSlot(action: headerLeadingAction)
                            }
                        } accessory: {
                            self.gatewayPill
                        }
                        .padding(.horizontal, MarketingClawProMetric.pagePadding)
                    }
                    self.content
                }
                .padding(.vertical, self.isCompactHeight ? 10 : 18)
                .font(MarketingClawType.body)
            }
            .safeAreaPadding(.bottom, self.bottomScrollInset)
        }
        .navigationTitle(self.title)
        .navigationBarTitleDisplayMode(.inline)
        .toolbar(self.usesNativeNavigationChrome ? .visible : .hidden, for: .navigationBar)
        .toolbar {
            if self.usesNativeNavigationChrome, let gatewayAction {
                ToolbarItem(placement: .topBarTrailing) {
                    Button(action: gatewayAction) {
                        Image(systemName: "antenna.radiowaves.left.and.right")
                    }
                    .accessibilityLabel("Gateway settings")
                }
            }
        }
    }

    private var isCompactHeight: Bool {
        self.verticalSizeClass == .compact
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

    private var bottomScrollInset: CGFloat {
        self.isCompactHeight ? 150 : MarketingClawProMetric.bottomScrollInset
    }
}
