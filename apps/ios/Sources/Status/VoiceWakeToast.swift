import SwiftUI

struct VoiceWakeToast: View {
    var command: String

    var body: some View {
        HStack(spacing: 10) {
            Image(systemName: "mic.fill")
                .font(MarketingClawType.subheadSemiBold)
                .foregroundStyle(.primary)

            Text(self.command)
                .font(MarketingClawType.subheadSemiBold)
                .foregroundStyle(.primary)
                .lineLimit(1)
                .truncationMode(.tail)
        }
        .padding(.vertical, 10)
        .padding(.horizontal, 12)
        .marketingClawGlassSurface()
        .accessibilityLabel("Voice Wake triggered")
        .accessibilityValue("Command: \(self.command)")
    }
}
