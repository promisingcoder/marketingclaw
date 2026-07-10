import MarketingClawKit
import SwiftUI

extension AgentProTab {
    func detailMetric(label: String, value: String) -> some View {
        VStack(alignment: .leading, spacing: 3) {
            Text(label)
                .font(MarketingClawType.caption2Medium)
                .foregroundStyle(.secondary)
            Text(value)
                .font(MarketingClawType.subheadSemiBold)
                .lineLimit(1)
                .minimumScaleFactor(0.8)
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .padding(10)
        .background(
            Color.primary.opacity(0.055),
            in: RoundedRectangle(cornerRadius: MarketingClawRadius.sm, style: .continuous))
    }

    func emptyDetailRow(icon: String, title: String, detail: String) -> some View {
        HStack(spacing: 12) {
            ProIconBadge(systemName: icon, color: .secondary)
            VStack(alignment: .leading, spacing: 3) {
                Text(title)
                    .font(MarketingClawType.subheadSemiBold)
                Text(detail)
                    .font(MarketingClawType.caption)
                    .foregroundStyle(.secondary)
                    .lineLimit(2)
            }
            Spacer(minLength: 8)
        }
    }
}
