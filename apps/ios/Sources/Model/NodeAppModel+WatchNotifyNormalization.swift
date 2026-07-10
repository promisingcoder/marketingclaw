import Foundation
import MarketingClawKit

extension NodeAppModel {
    static func normalizeWatchNotifyParams(_ params: MarketingClawWatchNotifyParams) -> MarketingClawWatchNotifyParams {
        var normalized = params
        normalized.title = params.title.trimmingCharacters(in: .whitespacesAndNewlines)
        normalized.body = params.body.trimmingCharacters(in: .whitespacesAndNewlines)
        normalized.promptId = self.trimmedOrNil(params.promptId)
        normalized.sessionKey = self.trimmedOrNil(params.sessionKey)
        normalized.gatewayStableID = self.trimmedOrNil(params.gatewayStableID)
        normalized.kind = self.trimmedOrNil(params.kind)
        normalized.details = self.trimmedOrNil(params.details)
        normalized.priority = self.normalizedWatchPriority(params.priority, risk: params.risk)
        normalized.risk = self.normalizedWatchRisk(params.risk, priority: normalized.priority)

        let normalizedActions = self.normalizeWatchActions(
            params.actions,
            kind: normalized.kind,
            promptId: normalized.promptId)
        normalized.actions = normalizedActions.isEmpty ? nil : normalizedActions
        return normalized
    }

    static func normalizeWatchActions(
        _ actions: [MarketingClawWatchAction]?,
        kind: String?,
        promptId: String?) -> [MarketingClawWatchAction]
    {
        let provided = (actions ?? []).compactMap { action -> MarketingClawWatchAction? in
            let id = action.id.trimmingCharacters(in: .whitespacesAndNewlines)
            let label = action.label.trimmingCharacters(in: .whitespacesAndNewlines)
            guard !id.isEmpty, !label.isEmpty else { return nil }
            return MarketingClawWatchAction(
                id: id,
                label: label,
                style: self.trimmedOrNil(action.style))
        }
        if !provided.isEmpty {
            return Array(provided.prefix(4))
        }

        // Only auto-insert quick actions when this is a prompt/decision flow.
        guard promptId?.isEmpty == false else {
            return []
        }

        let normalizedKind = kind?.trimmingCharacters(in: .whitespacesAndNewlines).lowercased() ?? ""
        if normalizedKind.contains("approval") || normalizedKind.contains("approve") {
            return [
                MarketingClawWatchAction(id: "approve", label: "Approve"),
                MarketingClawWatchAction(id: "decline", label: "Decline", style: "destructive"),
                MarketingClawWatchAction(id: "open_phone", label: "Open iPhone"),
                MarketingClawWatchAction(id: "escalate", label: "Escalate"),
            ]
        }

        return [
            MarketingClawWatchAction(id: "done", label: "Done"),
            MarketingClawWatchAction(id: "snooze_10m", label: "Snooze 10m"),
            MarketingClawWatchAction(id: "open_phone", label: "Open iPhone"),
            MarketingClawWatchAction(id: "escalate", label: "Escalate"),
        ]
    }

    static func normalizedWatchRisk(
        _ risk: MarketingClawWatchRisk?,
        priority: MarketingClawNotificationPriority?) -> MarketingClawWatchRisk?
    {
        if let risk { return risk }
        switch priority {
        case .passive:
            return .low
        case .active:
            return .medium
        case .timeSensitive:
            return .high
        case nil:
            return nil
        }
    }

    static func normalizedWatchPriority(
        _ priority: MarketingClawNotificationPriority?,
        risk: MarketingClawWatchRisk?) -> MarketingClawNotificationPriority?
    {
        if let priority { return priority }
        switch risk {
        case .low:
            return .passive
        case .medium:
            return .active
        case .high:
            return .timeSensitive
        case nil:
            return nil
        }
    }

    static func trimmedOrNil(_ value: String?) -> String? {
        let trimmed = value?.trimmingCharacters(in: .whitespacesAndNewlines) ?? ""
        return trimmed.isEmpty ? nil : trimmed
    }
}
