import Foundation

public enum MarketingClawCameraCommand: String, Codable, Sendable {
    case list = "camera.list"
    case snap = "camera.snap"
    case clip = "camera.clip"
}

public enum MarketingClawCameraFacing: String, Codable, Sendable {
    case back
    case front
}

public enum MarketingClawCameraImageFormat: String, Codable, Sendable {
    case jpg
    case jpeg
}

public enum MarketingClawCameraVideoFormat: String, Codable, Sendable {
    case mp4
}

public struct MarketingClawCameraSnapParams: Codable, Sendable, Equatable {
    public var facing: MarketingClawCameraFacing?
    public var maxWidth: Int?
    public var quality: Double?
    public var format: MarketingClawCameraImageFormat?
    public var deviceId: String?
    public var delayMs: Int?

    public init(
        facing: MarketingClawCameraFacing? = nil,
        maxWidth: Int? = nil,
        quality: Double? = nil,
        format: MarketingClawCameraImageFormat? = nil,
        deviceId: String? = nil,
        delayMs: Int? = nil)
    {
        self.facing = facing
        self.maxWidth = maxWidth
        self.quality = quality
        self.format = format
        self.deviceId = deviceId
        self.delayMs = delayMs
    }
}

public struct MarketingClawCameraClipParams: Codable, Sendable, Equatable {
    public var facing: MarketingClawCameraFacing?
    public var durationMs: Int?
    public var includeAudio: Bool?
    public var format: MarketingClawCameraVideoFormat?
    public var deviceId: String?

    public init(
        facing: MarketingClawCameraFacing? = nil,
        durationMs: Int? = nil,
        includeAudio: Bool? = nil,
        format: MarketingClawCameraVideoFormat? = nil,
        deviceId: String? = nil)
    {
        self.facing = facing
        self.durationMs = durationMs
        self.includeAudio = includeAudio
        self.format = format
        self.deviceId = deviceId
    }
}
