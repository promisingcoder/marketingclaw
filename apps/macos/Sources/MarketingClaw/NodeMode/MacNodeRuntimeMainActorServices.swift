import CoreLocation
import Foundation
import MarketingClawKit

@MainActor
protocol MacNodeRuntimeMainActorServices: Sendable {
    func snapshotScreen(
        screenIndex: Int?,
        maxWidth: Int?,
        quality: Double?,
        format: MarketingClawScreenSnapshotFormat?) async throws
        -> (data: Data, format: MarketingClawScreenSnapshotFormat, width: Int, height: Int)

    func recordScreen(
        screenIndex: Int?,
        durationMs: Int?,
        fps: Double?,
        includeAudio: Bool?,
        outPath: String?) async throws -> (path: String, hasAudio: Bool)

    func locationAuthorizationStatus() -> CLAuthorizationStatus
    func locationAccuracyAuthorization() -> CLAccuracyAuthorization
    func currentLocation(
        desiredAccuracy: MarketingClawLocationAccuracy,
        maxAgeMs: Int?,
        timeoutMs: Int?) async throws -> CLLocation

    func performComputerAct(_ params: MarketingClawComputerActParams) async throws -> MarketingClawComputerActResult
    func releaseHeldInput()
}

@MainActor
final class LiveMacNodeRuntimeMainActorServices: MacNodeRuntimeMainActorServices, @unchecked Sendable {
    private let screenSnapshotter = ScreenSnapshotService()
    private let screenRecorder = ScreenRecordService()
    private let locationService = MacNodeLocationService()
    private let computerAction = ComputerActionService()

    func snapshotScreen(
        screenIndex: Int?,
        maxWidth: Int?,
        quality: Double?,
        format: MarketingClawScreenSnapshotFormat?) async throws
        -> (data: Data, format: MarketingClawScreenSnapshotFormat, width: Int, height: Int)
    {
        try await self.screenSnapshotter.snapshot(
            screenIndex: screenIndex,
            maxWidth: maxWidth,
            quality: quality,
            format: format)
    }

    func recordScreen(
        screenIndex: Int?,
        durationMs: Int?,
        fps: Double?,
        includeAudio: Bool?,
        outPath: String?) async throws -> (path: String, hasAudio: Bool)
    {
        try await self.screenRecorder.record(
            screenIndex: screenIndex,
            durationMs: durationMs,
            fps: fps,
            includeAudio: includeAudio,
            outPath: outPath)
    }

    func locationAuthorizationStatus() -> CLAuthorizationStatus {
        self.locationService.authorizationStatus()
    }

    func locationAccuracyAuthorization() -> CLAccuracyAuthorization {
        self.locationService.accuracyAuthorization()
    }

    func currentLocation(
        desiredAccuracy: MarketingClawLocationAccuracy,
        maxAgeMs: Int?,
        timeoutMs: Int?) async throws -> CLLocation
    {
        try await self.locationService.currentLocation(
            desiredAccuracy: desiredAccuracy,
            maxAgeMs: maxAgeMs,
            timeoutMs: timeoutMs)
    }

    func performComputerAct(_ params: MarketingClawComputerActParams) async throws -> MarketingClawComputerActResult {
        try await self.computerAction.perform(params)
    }

    func releaseHeldInput() {
        self.computerAction.releaseHeldInput()
    }
}
