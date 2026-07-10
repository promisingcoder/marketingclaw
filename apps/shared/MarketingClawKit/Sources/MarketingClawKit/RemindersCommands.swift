import Foundation

public enum MarketingClawRemindersCommand: String, Codable, Sendable {
    case list = "reminders.list"
    case add = "reminders.add"
}

public enum MarketingClawReminderStatusFilter: String, Codable, Sendable {
    case incomplete
    case completed
    case all
}

public struct MarketingClawRemindersListParams: Codable, Sendable, Equatable {
    public var status: MarketingClawReminderStatusFilter?
    public var limit: Int?

    public init(status: MarketingClawReminderStatusFilter? = nil, limit: Int? = nil) {
        self.status = status
        self.limit = limit
    }
}

public struct MarketingClawRemindersAddParams: Codable, Sendable, Equatable {
    public var title: String
    public var dueISO: String?
    public var notes: String?
    public var listId: String?
    public var listName: String?

    public init(
        title: String,
        dueISO: String? = nil,
        notes: String? = nil,
        listId: String? = nil,
        listName: String? = nil)
    {
        self.title = title
        self.dueISO = dueISO
        self.notes = notes
        self.listId = listId
        self.listName = listName
    }
}

public struct MarketingClawReminderPayload: Codable, Sendable, Equatable {
    public var identifier: String
    public var title: String
    public var dueISO: String?
    public var completed: Bool
    public var listName: String?

    public init(
        identifier: String,
        title: String,
        dueISO: String? = nil,
        completed: Bool,
        listName: String? = nil)
    {
        self.identifier = identifier
        self.title = title
        self.dueISO = dueISO
        self.completed = completed
        self.listName = listName
    }
}

public struct MarketingClawRemindersListPayload: Codable, Sendable, Equatable {
    public var reminders: [MarketingClawReminderPayload]

    public init(reminders: [MarketingClawReminderPayload]) {
        self.reminders = reminders
    }
}

public struct MarketingClawRemindersAddPayload: Codable, Sendable, Equatable {
    public var reminder: MarketingClawReminderPayload

    public init(reminder: MarketingClawReminderPayload) {
        self.reminder = reminder
    }
}
