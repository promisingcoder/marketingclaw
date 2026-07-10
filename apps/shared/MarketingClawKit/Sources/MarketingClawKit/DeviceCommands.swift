import Foundation

public enum MarketingClawDeviceCommand: String, Codable, Sendable {
    case status = "device.status"
    case info = "device.info"
}

public enum MarketingClawBatteryState: String, Codable, Sendable {
    case unknown
    case unplugged
    case charging
    case full
}

public enum MarketingClawThermalState: String, Codable, Sendable {
    case nominal
    case fair
    case serious
    case critical
}

public enum MarketingClawNetworkPathStatus: String, Codable, Sendable {
    case satisfied
    case unsatisfied
    case requiresConnection
}

public enum MarketingClawNetworkInterfaceType: String, Codable, Sendable {
    case wifi
    case cellular
    case wired
    case other
}

public struct MarketingClawBatteryStatusPayload: Codable, Sendable, Equatable {
    public var level: Double?
    public var state: MarketingClawBatteryState
    public var lowPowerModeEnabled: Bool

    public init(level: Double?, state: MarketingClawBatteryState, lowPowerModeEnabled: Bool) {
        self.level = level
        self.state = state
        self.lowPowerModeEnabled = lowPowerModeEnabled
    }
}

public struct MarketingClawThermalStatusPayload: Codable, Sendable, Equatable {
    public var state: MarketingClawThermalState

    public init(state: MarketingClawThermalState) {
        self.state = state
    }
}

public struct MarketingClawStorageStatusPayload: Codable, Sendable, Equatable {
    public var totalBytes: Int64
    public var freeBytes: Int64
    public var usedBytes: Int64

    public init(totalBytes: Int64, freeBytes: Int64, usedBytes: Int64) {
        self.totalBytes = totalBytes
        self.freeBytes = freeBytes
        self.usedBytes = usedBytes
    }
}

public struct MarketingClawNetworkStatusPayload: Codable, Sendable, Equatable {
    public var status: MarketingClawNetworkPathStatus
    public var isExpensive: Bool
    public var isConstrained: Bool
    public var interfaces: [MarketingClawNetworkInterfaceType]

    public init(
        status: MarketingClawNetworkPathStatus,
        isExpensive: Bool,
        isConstrained: Bool,
        interfaces: [MarketingClawNetworkInterfaceType])
    {
        self.status = status
        self.isExpensive = isExpensive
        self.isConstrained = isConstrained
        self.interfaces = interfaces
    }
}

public struct MarketingClawDeviceStatusPayload: Codable, Sendable, Equatable {
    public var battery: MarketingClawBatteryStatusPayload
    public var thermal: MarketingClawThermalStatusPayload
    public var storage: MarketingClawStorageStatusPayload
    public var network: MarketingClawNetworkStatusPayload
    public var uptimeSeconds: Double

    public init(
        battery: MarketingClawBatteryStatusPayload,
        thermal: MarketingClawThermalStatusPayload,
        storage: MarketingClawStorageStatusPayload,
        network: MarketingClawNetworkStatusPayload,
        uptimeSeconds: Double)
    {
        self.battery = battery
        self.thermal = thermal
        self.storage = storage
        self.network = network
        self.uptimeSeconds = uptimeSeconds
    }
}

public struct MarketingClawDeviceInfoPayload: Codable, Sendable, Equatable {
    public var deviceName: String
    public var modelIdentifier: String
    public var systemName: String
    public var systemVersion: String
    public var appVersion: String
    public var appBuild: String
    public var locale: String

    public init(
        deviceName: String,
        modelIdentifier: String,
        systemName: String,
        systemVersion: String,
        appVersion: String,
        appBuild: String,
        locale: String)
    {
        self.deviceName = deviceName
        self.modelIdentifier = modelIdentifier
        self.systemName = systemName
        self.systemVersion = systemVersion
        self.appVersion = appVersion
        self.appBuild = appBuild
        self.locale = locale
    }
}
