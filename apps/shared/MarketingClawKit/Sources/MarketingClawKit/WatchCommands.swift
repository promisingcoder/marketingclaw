import Foundation

public enum MarketingClawWatchCommand: String, Codable, Sendable {
    case status = "watch.status"
    case notify = "watch.notify"
}

public enum MarketingClawWatchPayloadType: String, Codable, Sendable, Equatable {
    case notify = "watch.notify"
    case directNodeSetup = "watch.node.setup"
    case reply = "watch.reply"
    case appSnapshot = "watch.app.snapshot"
    case appSnapshotRequest = "watch.app.snapshotRequest"
    case appCommand = "watch.app.command"
    case chatCompletion = "watch.chat.completion"
    case execApprovalPrompt = "watch.execApproval.prompt"
    case execApprovalResolve = "watch.execApproval.resolve"
    case execApprovalResolved = "watch.execApproval.resolved"
    case execApprovalExpired = "watch.execApproval.expired"
    case execApprovalSnapshot = "watch.execApproval.snapshot"
    case execApprovalSnapshotRequest = "watch.execApproval.snapshotRequest"
}

public enum MarketingClawWatchRisk: String, Codable, Sendable, Equatable {
    case low
    case medium
    case high
}

public enum MarketingClawWatchExecApprovalDecision: String, Codable, Sendable, Equatable {
    case allowOnce = "allow-once"
    case deny
}

public enum MarketingClawWatchExecApprovalCloseReason: String, Codable, Sendable, Equatable {
    case expired
    case notFound = "not-found"
    case unavailable
    case replaced
    case resolved
}

public struct MarketingClawWatchAction: Codable, Sendable, Equatable {
    public var id: String
    public var label: String
    public var style: String?

    public init(id: String, label: String, style: String? = nil) {
        self.id = id
        self.label = label
        self.style = style
    }
}

public struct MarketingClawWatchExecApprovalItem: Codable, Sendable, Equatable, Identifiable {
    public var id: String
    public var gatewayStableID: String?
    public var commandText: String
    public var commandPreview: String?
    public var host: String?
    public var nodeId: String?
    public var agentId: String?
    public var expiresAtMs: Int64?
    public var allowedDecisions: [MarketingClawWatchExecApprovalDecision]
    public var risk: MarketingClawWatchRisk?

    public init(
        id: String,
        gatewayStableID: String? = nil,
        commandText: String,
        commandPreview: String? = nil,
        host: String? = nil,
        nodeId: String? = nil,
        agentId: String? = nil,
        expiresAtMs: Int64? = nil,
        allowedDecisions: [MarketingClawWatchExecApprovalDecision] = [],
        risk: MarketingClawWatchRisk? = nil)
    {
        self.id = id
        self.gatewayStableID = gatewayStableID
        self.commandText = commandText
        self.commandPreview = commandPreview
        self.host = host
        self.nodeId = nodeId
        self.agentId = agentId
        self.expiresAtMs = expiresAtMs
        self.allowedDecisions = allowedDecisions
        self.risk = risk
    }
}

public struct MarketingClawWatchExecApprovalPromptMessage: Codable, Sendable, Equatable {
    public var type: MarketingClawWatchPayloadType
    public var approval: MarketingClawWatchExecApprovalItem
    public var sentAtMs: Int64?
    public var deliveryId: String?
    public var resetResolvingState: Bool?

    public init(
        approval: MarketingClawWatchExecApprovalItem,
        sentAtMs: Int64? = nil,
        deliveryId: String? = nil,
        resetResolvingState: Bool? = nil)
    {
        self.type = .execApprovalPrompt
        self.approval = approval
        self.sentAtMs = sentAtMs
        self.deliveryId = deliveryId
        self.resetResolvingState = resetResolvingState
    }
}

public struct MarketingClawWatchExecApprovalResolveMessage: Codable, Sendable, Equatable {
    public var type: MarketingClawWatchPayloadType
    public var approvalId: String
    public var gatewayStableID: String?
    public var decision: MarketingClawWatchExecApprovalDecision
    public var replyId: String
    public var sentAtMs: Int64?

    public init(
        approvalId: String,
        gatewayStableID: String? = nil,
        decision: MarketingClawWatchExecApprovalDecision,
        replyId: String,
        sentAtMs: Int64? = nil)
    {
        self.type = .execApprovalResolve
        self.approvalId = approvalId
        self.gatewayStableID = gatewayStableID
        self.decision = decision
        self.replyId = replyId
        self.sentAtMs = sentAtMs
    }
}

public struct MarketingClawWatchExecApprovalResolvedMessage: Codable, Sendable, Equatable {
    public var type: MarketingClawWatchPayloadType
    public var approvalId: String
    public var gatewayStableID: String?
    public var decision: MarketingClawWatchExecApprovalDecision?
    public var resolvedAtMs: Int64?
    public var source: String?

    public init(
        approvalId: String,
        gatewayStableID: String? = nil,
        decision: MarketingClawWatchExecApprovalDecision? = nil,
        resolvedAtMs: Int64? = nil,
        source: String? = nil)
    {
        self.type = .execApprovalResolved
        self.approvalId = approvalId
        self.gatewayStableID = gatewayStableID
        self.decision = decision
        self.resolvedAtMs = resolvedAtMs
        self.source = source
    }
}

public struct MarketingClawWatchExecApprovalExpiredMessage: Codable, Sendable, Equatable {
    public var type: MarketingClawWatchPayloadType
    public var approvalId: String
    public var gatewayStableID: String?
    public var reason: MarketingClawWatchExecApprovalCloseReason
    public var expiredAtMs: Int64?

    public init(
        approvalId: String,
        gatewayStableID: String? = nil,
        reason: MarketingClawWatchExecApprovalCloseReason,
        expiredAtMs: Int64? = nil)
    {
        self.type = .execApprovalExpired
        self.approvalId = approvalId
        self.gatewayStableID = gatewayStableID
        self.reason = reason
        self.expiredAtMs = expiredAtMs
    }
}

public struct MarketingClawWatchExecApprovalSnapshotMessage: Codable, Sendable, Equatable {
    public var type: MarketingClawWatchPayloadType
    public var approvals: [MarketingClawWatchExecApprovalItem]
    public var gatewayStableID: String?
    public var sentAtMs: Int64?
    public var snapshotId: String?

    public init(
        approvals: [MarketingClawWatchExecApprovalItem],
        gatewayStableID: String? = nil,
        sentAtMs: Int64? = nil,
        snapshotId: String? = nil)
    {
        self.type = .execApprovalSnapshot
        self.approvals = approvals
        self.gatewayStableID = gatewayStableID
        self.sentAtMs = sentAtMs
        self.snapshotId = snapshotId
    }
}

public struct MarketingClawWatchExecApprovalSnapshotRequestMessage: Codable, Sendable, Equatable {
    public var type: MarketingClawWatchPayloadType
    public var requestId: String
    public var sentAtMs: Int64?

    public init(requestId: String, sentAtMs: Int64? = nil) {
        self.type = .execApprovalSnapshotRequest
        self.requestId = requestId
        self.sentAtMs = sentAtMs
    }
}

public struct MarketingClawWatchChatItem: Codable, Sendable, Equatable, Identifiable {
    public var id: String
    public var role: String
    public var text: String
    public var timestampMs: Int64?

    public init(
        id: String,
        role: String,
        text: String,
        timestampMs: Int64? = nil)
    {
        self.id = id
        self.role = role
        self.text = text
        self.timestampMs = timestampMs
    }
}

public struct MarketingClawWatchChatCompletionMessage: Codable, Sendable, Equatable {
    public var type: MarketingClawWatchPayloadType
    public var commandId: String
    public var replyText: String
    public var sentAtMs: Int64?

    public init(commandId: String, replyText: String, sentAtMs: Int64? = nil) {
        self.type = .chatCompletion
        self.commandId = commandId
        self.replyText = replyText
        self.sentAtMs = sentAtMs
    }
}

public struct MarketingClawWatchAppSnapshotMessage: Codable, Sendable, Equatable {
    public var type: MarketingClawWatchPayloadType
    public var gatewayStatusText: String
    public var gatewayConnected: Bool
    public var agentName: String
    public var agentAvatarURL: String?
    public var agentAvatarText: String?
    public var sessionKey: String
    public var gatewayStableID: String?
    public var talkStatusText: String
    public var talkEnabled: Bool
    public var talkListening: Bool
    public var talkSpeaking: Bool
    public var pendingApprovalCount: Int
    public var chatItems: [MarketingClawWatchChatItem]?
    public var chatStatusText: String?
    public var sentAtMs: Int64?
    public var snapshotId: String?

    public init(
        gatewayStatusText: String,
        gatewayConnected: Bool,
        agentName: String,
        agentAvatarURL: String? = nil,
        agentAvatarText: String? = nil,
        sessionKey: String,
        gatewayStableID: String? = nil,
        talkStatusText: String,
        talkEnabled: Bool,
        talkListening: Bool,
        talkSpeaking: Bool,
        pendingApprovalCount: Int,
        chatItems: [MarketingClawWatchChatItem]? = nil,
        chatStatusText: String? = nil,
        sentAtMs: Int64? = nil,
        snapshotId: String? = nil)
    {
        self.type = .appSnapshot
        self.gatewayStatusText = gatewayStatusText
        self.gatewayConnected = gatewayConnected
        self.agentName = agentName
        self.agentAvatarURL = agentAvatarURL
        self.agentAvatarText = agentAvatarText
        self.sessionKey = sessionKey
        self.gatewayStableID = gatewayStableID
        self.talkStatusText = talkStatusText
        self.talkEnabled = talkEnabled
        self.talkListening = talkListening
        self.talkSpeaking = talkSpeaking
        self.pendingApprovalCount = pendingApprovalCount
        self.chatItems = chatItems
        self.chatStatusText = chatStatusText
        self.sentAtMs = sentAtMs
        self.snapshotId = snapshotId
    }
}

public struct MarketingClawWatchAppSnapshotRequestMessage: Codable, Sendable, Equatable {
    public var type: MarketingClawWatchPayloadType
    public var requestId: String
    public var sentAtMs: Int64?

    public init(requestId: String, sentAtMs: Int64? = nil) {
        self.type = .appSnapshotRequest
        self.requestId = requestId
        self.sentAtMs = sentAtMs
    }
}

public enum MarketingClawWatchAppCommand: String, Codable, Sendable, Equatable {
    case refresh
    case openChat = "open-chat"
    case sendChat = "send-chat"
    case startTalk = "start-talk"
    case stopTalk = "stop-talk"
}

public struct MarketingClawWatchAppCommandMessage: Codable, Sendable, Equatable {
    public var type: MarketingClawWatchPayloadType
    public var command: MarketingClawWatchAppCommand
    public var commandId: String
    public var sessionKey: String?
    public var gatewayStableID: String?
    public var text: String?
    public var sentAtMs: Int64?

    public init(
        command: MarketingClawWatchAppCommand,
        commandId: String,
        sessionKey: String? = nil,
        gatewayStableID: String? = nil,
        text: String? = nil,
        sentAtMs: Int64? = nil)
    {
        self.type = .appCommand
        self.command = command
        self.commandId = commandId
        self.sessionKey = sessionKey
        self.gatewayStableID = gatewayStableID
        self.text = text
        self.sentAtMs = sentAtMs
    }
}

public struct MarketingClawWatchStatusPayload: Codable, Sendable, Equatable {
    public var supported: Bool
    public var paired: Bool
    public var appInstalled: Bool
    public var reachable: Bool
    public var activationState: String

    public init(
        supported: Bool,
        paired: Bool,
        appInstalled: Bool,
        reachable: Bool,
        activationState: String)
    {
        self.supported = supported
        self.paired = paired
        self.appInstalled = appInstalled
        self.reachable = reachable
        self.activationState = activationState
    }
}

public struct MarketingClawWatchNotifyParams: Codable, Sendable, Equatable {
    public var title: String
    public var body: String
    public var priority: MarketingClawNotificationPriority?
    public var promptId: String?
    public var sessionKey: String?
    public var gatewayStableID: String?
    public var kind: String?
    public var details: String?
    public var expiresAtMs: Int64?
    public var risk: MarketingClawWatchRisk?
    public var actions: [MarketingClawWatchAction]?

    public init(
        title: String,
        body: String,
        priority: MarketingClawNotificationPriority? = nil,
        promptId: String? = nil,
        sessionKey: String? = nil,
        gatewayStableID: String? = nil,
        kind: String? = nil,
        details: String? = nil,
        expiresAtMs: Int64? = nil,
        risk: MarketingClawWatchRisk? = nil,
        actions: [MarketingClawWatchAction]? = nil)
    {
        self.title = title
        self.body = body
        self.priority = priority
        self.promptId = promptId
        self.sessionKey = sessionKey
        self.gatewayStableID = gatewayStableID
        self.kind = kind
        self.details = details
        self.expiresAtMs = expiresAtMs
        self.risk = risk
        self.actions = actions
    }
}

public struct MarketingClawWatchNotifyPayload: Codable, Sendable, Equatable {
    public var deliveredImmediately: Bool
    public var queuedForDelivery: Bool
    public var transport: String

    public init(deliveredImmediately: Bool, queuedForDelivery: Bool, transport: String) {
        self.deliveredImmediately = deliveredImmediately
        self.queuedForDelivery = queuedForDelivery
        self.transport = transport
    }
}
