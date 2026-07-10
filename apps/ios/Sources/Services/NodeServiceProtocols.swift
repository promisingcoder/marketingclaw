import CoreLocation
import Foundation
import MarketingClawKit
import UIKit

typealias MarketingClawCameraSnapResult = (format: String, base64: String, width: Int, height: Int)
typealias MarketingClawCameraClipResult = (format: String, base64: String, durationMs: Int, hasAudio: Bool)

protocol CameraServicing: Sendable {
    func listDevices() async -> [CameraController.CameraDeviceInfo]
    func snap(params: MarketingClawCameraSnapParams) async throws -> MarketingClawCameraSnapResult
    func clip(params: MarketingClawCameraClipParams) async throws -> MarketingClawCameraClipResult
}

protocol ScreenRecordingServicing: Sendable {
    func record(
        screenIndex: Int?,
        durationMs: Int?,
        fps: Double?,
        includeAudio: Bool?,
        outPath: String?) async throws -> String
}

@MainActor
protocol LocationServicing: Sendable {
    func authorizationStatus() -> CLAuthorizationStatus
    func accuracyAuthorization() -> CLAccuracyAuthorization
    func ensureAuthorization(mode: MarketingClawLocationMode) async -> CLAuthorizationStatus
    func currentLocation(
        params: MarketingClawLocationGetParams,
        desiredAccuracy: MarketingClawLocationAccuracy,
        maxAgeMs: Int?,
        timeoutMs: Int?) async throws -> CLLocation
    func setBackgroundLocationUpdatesEnabled(_ enabled: Bool)
    func setAuthorizationChangeHandler(
        _ handler: @escaping @MainActor @Sendable (CLAuthorizationStatus) -> Void)
    func startMonitoringSignificantLocationChanges(onUpdate: @escaping @Sendable (CLLocation) -> Void)
    func stopMonitoringSignificantLocationChanges()
}

@MainActor
protocol DeviceStatusServicing: Sendable {
    func status() async throws -> MarketingClawDeviceStatusPayload
    func info() -> MarketingClawDeviceInfoPayload
}

protocol PhotosServicing: Sendable {
    func latest(params: MarketingClawPhotosLatestParams) async throws -> MarketingClawPhotosLatestPayload
}

protocol ContactsServicing: Sendable {
    func search(params: MarketingClawContactsSearchParams) async throws -> MarketingClawContactsSearchPayload
    func add(params: MarketingClawContactsAddParams) async throws -> MarketingClawContactsAddPayload
}

protocol CalendarServicing: Sendable {
    func events(params: MarketingClawCalendarEventsParams) async throws -> MarketingClawCalendarEventsPayload
    func add(params: MarketingClawCalendarAddParams) async throws -> MarketingClawCalendarAddPayload
}

protocol RemindersServicing: Sendable {
    func list(params: MarketingClawRemindersListParams) async throws -> MarketingClawRemindersListPayload
    func add(params: MarketingClawRemindersAddParams) async throws -> MarketingClawRemindersAddPayload
}

protocol MotionServicing: Sendable {
    func activities(params: MarketingClawMotionActivityParams) async throws -> MarketingClawMotionActivityPayload
    func pedometer(params: MarketingClawPedometerParams) async throws -> MarketingClawPedometerPayload
}

struct WatchMessagingStatus: Equatable {
    var supported: Bool
    var paired: Bool
    var appInstalled: Bool
    var reachable: Bool
    var activationState: String
}

struct WatchQuickReplyEvent: Codable, Equatable {
    var replyId: String
    var promptId: String
    var actionId: String
    var actionLabel: String?
    var sessionKey: String?
    var gatewayStableID: String?
    var note: String?
    var sentAtMs: Int64?
    var transport: String
}

enum WatchMessageKind: String, Codable, Equatable {
    case chat
    case quickReply
}

struct WatchExecApprovalResolveEvent: Codable, Equatable {
    var replyId: String
    var approvalId: String
    var gatewayStableID: String?
    var decision: MarketingClawWatchExecApprovalDecision
    var sentAtMs: Int64?
    var transport: String
}

struct WatchExecApprovalSnapshotRequestEvent: Equatable {
    var requestId: String
    var sentAtMs: Int64?
    var transport: String
}

struct WatchAppSnapshotRequestEvent: Equatable {
    var requestId: String
    var sentAtMs: Int64?
    var transport: String
}

struct WatchAppCommandEvent: Codable, Equatable {
    var commandId: String
    var command: MarketingClawWatchAppCommand
    var sessionKey: String?
    var gatewayStableID: String?
    var text: String?
    var sentAtMs: Int64?
    var transport: String
    var messageKind: WatchMessageKind? = nil
}

struct WatchNotificationSendResult: Equatable {
    var deliveredImmediately: Bool
    var queuedForDelivery: Bool
    var transport: String
}

protocol WatchMessagingServicing: AnyObject, Sendable {
    func status() async -> WatchMessagingStatus
    func setStatusHandler(_ handler: (@Sendable (WatchMessagingStatus) -> Void)?)
    func setReplyHandler(_ handler: (@Sendable (WatchQuickReplyEvent) -> Void)?)
    func setExecApprovalResolveHandler(_ handler: (@Sendable (WatchExecApprovalResolveEvent) -> Void)?)
    func setExecApprovalSnapshotRequestHandler(
        _ handler: (@Sendable (WatchExecApprovalSnapshotRequestEvent) -> Void)?)
    func setAppSnapshotRequestHandler(_ handler: (@Sendable (WatchAppSnapshotRequestEvent) -> Void)?)
    func setAppCommandHandler(_ handler: (@Sendable (WatchAppCommandEvent) -> Void)?)
    func sendDirectNodeSetup(setupCode: String) async throws -> WatchNotificationSendResult
    func sendNotification(
        id: String,
        params: MarketingClawWatchNotifyParams,
        gatewayStableID: String?) async throws -> WatchNotificationSendResult
    func sendExecApprovalPrompt(
        _ message: MarketingClawWatchExecApprovalPromptMessage) async throws -> WatchNotificationSendResult
    func sendExecApprovalResolved(
        _ message: MarketingClawWatchExecApprovalResolvedMessage) async throws -> WatchNotificationSendResult
    func sendExecApprovalExpired(
        _ message: MarketingClawWatchExecApprovalExpiredMessage) async throws -> WatchNotificationSendResult
    func syncExecApprovalSnapshot(
        _ message: MarketingClawWatchExecApprovalSnapshotMessage) async throws -> WatchNotificationSendResult
    func syncAppSnapshot(
        _ message: MarketingClawWatchAppSnapshotMessage) async throws -> WatchNotificationSendResult
    func sendChatCompletion(
        _ message: MarketingClawWatchChatCompletionMessage) async throws -> WatchNotificationSendResult
}

extension CameraController: CameraServicing {}
extension ScreenRecordService: ScreenRecordingServicing {}
extension LocationService: LocationServicing {}
