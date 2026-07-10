import Foundation

public enum MarketingClawScreenCommand: String, Codable, Sendable {
    case snapshot = "screen.snapshot"
    case record = "screen.record"
}

public enum MarketingClawScreenSnapshotFormat: String, Codable, Sendable {
    case jpeg
    case png
}

public struct MarketingClawScreenSnapshotParams: Codable, Sendable, Equatable {
    public var screenIndex: Int?
    public var maxWidth: Int?
    public var quality: Double?
    public var format: MarketingClawScreenSnapshotFormat?

    public init(
        screenIndex: Int? = nil,
        maxWidth: Int? = nil,
        quality: Double? = nil,
        format: MarketingClawScreenSnapshotFormat? = nil)
    {
        self.screenIndex = screenIndex
        self.maxWidth = maxWidth
        self.quality = quality
        self.format = format
    }
}

public struct MarketingClawScreenRecordParams: Codable, Sendable, Equatable {
    public var screenIndex: Int?
    public var durationMs: Int?
    public var fps: Double?
    public var format: String?
    public var includeAudio: Bool?

    public init(
        screenIndex: Int? = nil,
        durationMs: Int? = nil,
        fps: Double? = nil,
        format: String? = nil,
        includeAudio: Bool? = nil)
    {
        self.screenIndex = screenIndex
        self.durationMs = durationMs
        self.fps = fps
        self.format = format
        self.includeAudio = includeAudio
    }
}
