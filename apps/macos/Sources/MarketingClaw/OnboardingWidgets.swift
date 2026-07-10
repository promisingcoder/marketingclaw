import MarketingClawChatUI
import SwiftUI

/// Onboarding hero mascot with the marketingclaw.ai hero treatment: the animated
/// mascot plus its coral silhouette glow (drop-shadow at ~10% of size).
struct GlowingMarketingClawIcon: View {
    @Environment(\.colorScheme) private var colorScheme

    let size: CGFloat

    init(size: CGFloat = 148) {
        self.size = size
    }

    var body: some View {
        MarketingClawMascotView()
            .frame(width: self.size, height: self.size)
            .shadow(
                color: MarketingClawMascotView.heroGlowColor(for: self.colorScheme),
                radius: self.size * 0.1)
    }
}
