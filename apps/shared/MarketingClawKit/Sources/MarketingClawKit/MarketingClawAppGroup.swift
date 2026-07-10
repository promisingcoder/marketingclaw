import Foundation

public enum MarketingClawAppGroup {
    public static let canonicalIdentifier = "group.ai.marketingclaw.app.shared"

    public static var identifier: String {
        let raw = Bundle.main.object(forInfoDictionaryKey: "MarketingClawAppGroupIdentifier") as? String
        let trimmed = raw?.trimmingCharacters(in: .whitespacesAndNewlines) ?? ""
        return trimmed.isEmpty ? self.canonicalIdentifier : trimmed
    }
}
