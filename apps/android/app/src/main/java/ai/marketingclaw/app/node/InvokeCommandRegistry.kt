package ai.marketingclaw.app.node

import ai.marketingclaw.app.protocol.MarketingClawCalendarCommand
import ai.marketingclaw.app.protocol.MarketingClawCallLogCommand
import ai.marketingclaw.app.protocol.MarketingClawCameraCommand
import ai.marketingclaw.app.protocol.MarketingClawCanvasA2UICommand
import ai.marketingclaw.app.protocol.MarketingClawCanvasCommand
import ai.marketingclaw.app.protocol.MarketingClawCapability
import ai.marketingclaw.app.protocol.MarketingClawContactsCommand
import ai.marketingclaw.app.protocol.MarketingClawDeviceCommand
import ai.marketingclaw.app.protocol.MarketingClawLocationCommand
import ai.marketingclaw.app.protocol.MarketingClawMotionCommand
import ai.marketingclaw.app.protocol.MarketingClawNotificationsCommand
import ai.marketingclaw.app.protocol.MarketingClawPhotosCommand
import ai.marketingclaw.app.protocol.MarketingClawSmsCommand
import ai.marketingclaw.app.protocol.MarketingClawSystemCommand
import ai.marketingclaw.app.protocol.MarketingClawTalkCommand

/** Runtime feature flags used to decide which node tools are advertised. */
data class NodeRuntimeFlags(
  val cameraEnabled: Boolean,
  val locationEnabled: Boolean,
  val sendSmsAvailable: Boolean,
  val readSmsAvailable: Boolean,
  val smsSearchPossible: Boolean,
  val callLogAvailable: Boolean,
  val photosAvailable: Boolean,
  val voiceWakeEnabled: Boolean,
  val motionActivityAvailable: Boolean,
  val motionPedometerAvailable: Boolean,
  val installedAppsSharingEnabled: Boolean,
  val debugBuild: Boolean,
)

/** Per-command availability gates checked before advertising invoke methods. */
enum class InvokeCommandAvailability {
  Always,
  CameraEnabled,
  LocationEnabled,
  SendSmsAvailable,
  ReadSmsAvailable,
  RequestableSmsSearchAvailable,
  CallLogAvailable,
  PhotosAvailable,
  MotionActivityAvailable,
  MotionPedometerAvailable,
  InstalledAppsSharingEnabled,
  DebugBuild,
}

/** Per-capability availability gates for the node capabilities manifest. */
enum class NodeCapabilityAvailability {
  Always,
  CameraEnabled,
  LocationEnabled,
  SmsAvailable,
  CallLogAvailable,
  PhotosAvailable,
  VoiceWakeEnabled,
  MotionAvailable,
}

/** Capability entry reported to the gateway when its availability gate passes. */
data class NodeCapabilitySpec(
  val name: String,
  val availability: NodeCapabilityAvailability = NodeCapabilityAvailability.Always,
)

/** Invoke method entry advertised to gateway plus foreground routing metadata. */
data class InvokeCommandSpec(
  val name: String,
  val requiresForeground: Boolean = false,
  val availability: InvokeCommandAvailability = InvokeCommandAvailability.Always,
)

object InvokeCommandRegistry {
  /** Capabilities mirror gateway protocol ids and are filtered by device state. */
  val capabilityManifest: List<NodeCapabilitySpec> =
    listOf(
      NodeCapabilitySpec(name = MarketingClawCapability.Canvas.rawValue),
      NodeCapabilitySpec(name = MarketingClawCapability.Device.rawValue),
      NodeCapabilitySpec(name = MarketingClawCapability.Notifications.rawValue),
      NodeCapabilitySpec(name = MarketingClawCapability.System.rawValue),
      NodeCapabilitySpec(
        name = MarketingClawCapability.Camera.rawValue,
        availability = NodeCapabilityAvailability.CameraEnabled,
      ),
      NodeCapabilitySpec(
        name = MarketingClawCapability.Sms.rawValue,
        availability = NodeCapabilityAvailability.SmsAvailable,
      ),
      NodeCapabilitySpec(
        name = MarketingClawCapability.VoiceWake.rawValue,
        availability = NodeCapabilityAvailability.VoiceWakeEnabled,
      ),
      NodeCapabilitySpec(name = MarketingClawCapability.Talk.rawValue),
      NodeCapabilitySpec(
        name = MarketingClawCapability.Location.rawValue,
        availability = NodeCapabilityAvailability.LocationEnabled,
      ),
      NodeCapabilitySpec(
        name = MarketingClawCapability.Photos.rawValue,
        availability = NodeCapabilityAvailability.PhotosAvailable,
      ),
      NodeCapabilitySpec(name = MarketingClawCapability.Contacts.rawValue),
      NodeCapabilitySpec(name = MarketingClawCapability.Calendar.rawValue),
      NodeCapabilitySpec(
        name = MarketingClawCapability.Motion.rawValue,
        availability = NodeCapabilityAvailability.MotionAvailable,
      ),
      NodeCapabilitySpec(
        name = MarketingClawCapability.CallLog.rawValue,
        availability = NodeCapabilityAvailability.CallLogAvailable,
      ),
    )

  /** Complete Android node command catalog before runtime availability filtering. */
  val all: List<InvokeCommandSpec> =
    listOf(
      InvokeCommandSpec(
        name = MarketingClawCanvasCommand.Present.rawValue,
        requiresForeground = true,
      ),
      InvokeCommandSpec(
        name = MarketingClawCanvasCommand.Hide.rawValue,
        requiresForeground = true,
      ),
      InvokeCommandSpec(
        name = MarketingClawCanvasCommand.Navigate.rawValue,
        requiresForeground = true,
      ),
      InvokeCommandSpec(
        name = MarketingClawCanvasCommand.Eval.rawValue,
        requiresForeground = true,
      ),
      InvokeCommandSpec(
        name = MarketingClawCanvasCommand.Snapshot.rawValue,
        requiresForeground = true,
      ),
      InvokeCommandSpec(
        name = MarketingClawCanvasA2UICommand.Push.rawValue,
        requiresForeground = true,
      ),
      InvokeCommandSpec(
        name = MarketingClawCanvasA2UICommand.PushJSONL.rawValue,
        requiresForeground = true,
      ),
      InvokeCommandSpec(
        name = MarketingClawCanvasA2UICommand.Reset.rawValue,
        requiresForeground = true,
      ),
      InvokeCommandSpec(
        name = MarketingClawSystemCommand.Notify.rawValue,
      ),
      InvokeCommandSpec(
        name = MarketingClawTalkCommand.PttStart.rawValue,
      ),
      InvokeCommandSpec(
        name = MarketingClawTalkCommand.PttStop.rawValue,
      ),
      InvokeCommandSpec(
        name = MarketingClawTalkCommand.PttCancel.rawValue,
      ),
      InvokeCommandSpec(
        name = MarketingClawTalkCommand.PttOnce.rawValue,
        requiresForeground = true,
      ),
      InvokeCommandSpec(
        name = MarketingClawCameraCommand.List.rawValue,
        requiresForeground = true,
        availability = InvokeCommandAvailability.CameraEnabled,
      ),
      InvokeCommandSpec(
        name = MarketingClawCameraCommand.Snap.rawValue,
        requiresForeground = true,
        availability = InvokeCommandAvailability.CameraEnabled,
      ),
      InvokeCommandSpec(
        name = MarketingClawCameraCommand.Clip.rawValue,
        requiresForeground = true,
        availability = InvokeCommandAvailability.CameraEnabled,
      ),
      InvokeCommandSpec(
        name = MarketingClawLocationCommand.Get.rawValue,
        availability = InvokeCommandAvailability.LocationEnabled,
      ),
      InvokeCommandSpec(
        name = MarketingClawDeviceCommand.Status.rawValue,
      ),
      InvokeCommandSpec(
        name = MarketingClawDeviceCommand.Info.rawValue,
      ),
      InvokeCommandSpec(
        name = MarketingClawDeviceCommand.Permissions.rawValue,
      ),
      InvokeCommandSpec(
        name = MarketingClawDeviceCommand.Health.rawValue,
      ),
      InvokeCommandSpec(
        name = MarketingClawDeviceCommand.Apps.rawValue,
        availability = InvokeCommandAvailability.InstalledAppsSharingEnabled,
      ),
      InvokeCommandSpec(
        name = MarketingClawNotificationsCommand.List.rawValue,
      ),
      InvokeCommandSpec(
        name = MarketingClawNotificationsCommand.Actions.rawValue,
      ),
      InvokeCommandSpec(
        name = MarketingClawPhotosCommand.Latest.rawValue,
        availability = InvokeCommandAvailability.PhotosAvailable,
      ),
      InvokeCommandSpec(
        name = MarketingClawContactsCommand.Search.rawValue,
      ),
      InvokeCommandSpec(
        name = MarketingClawContactsCommand.Add.rawValue,
      ),
      InvokeCommandSpec(
        name = MarketingClawCalendarCommand.Events.rawValue,
      ),
      InvokeCommandSpec(
        name = MarketingClawCalendarCommand.Add.rawValue,
      ),
      InvokeCommandSpec(
        name = MarketingClawMotionCommand.Activity.rawValue,
        availability = InvokeCommandAvailability.MotionActivityAvailable,
      ),
      InvokeCommandSpec(
        name = MarketingClawMotionCommand.Pedometer.rawValue,
        availability = InvokeCommandAvailability.MotionPedometerAvailable,
      ),
      InvokeCommandSpec(
        name = MarketingClawSmsCommand.Send.rawValue,
        availability = InvokeCommandAvailability.SendSmsAvailable,
      ),
      InvokeCommandSpec(
        name = MarketingClawSmsCommand.Search.rawValue,
        availability = InvokeCommandAvailability.RequestableSmsSearchAvailable,
      ),
      InvokeCommandSpec(
        name = MarketingClawCallLogCommand.Search.rawValue,
        availability = InvokeCommandAvailability.CallLogAvailable,
      ),
      InvokeCommandSpec(
        name = "debug.logs",
        availability = InvokeCommandAvailability.DebugBuild,
      ),
      InvokeCommandSpec(
        name = "debug.ed25519",
        availability = InvokeCommandAvailability.DebugBuild,
      ),
    )

  private val byNameInternal: Map<String, InvokeCommandSpec> = all.associateBy { it.name }

  /** Finds the command metadata used by dispatch and advertised-method builders. */
  fun find(command: String): InvokeCommandSpec? = byNameInternal[command]

  /** Returns gateway capability ids the current Android device can actually serve. */
  fun advertisedCapabilities(flags: NodeRuntimeFlags): List<String> =
    capabilityManifest
      .filter { spec ->
        when (spec.availability) {
          NodeCapabilityAvailability.Always -> true
          NodeCapabilityAvailability.CameraEnabled -> flags.cameraEnabled
          NodeCapabilityAvailability.LocationEnabled -> flags.locationEnabled
          NodeCapabilityAvailability.SmsAvailable -> flags.sendSmsAvailable || flags.readSmsAvailable
          NodeCapabilityAvailability.CallLogAvailable -> flags.callLogAvailable
          NodeCapabilityAvailability.PhotosAvailable -> flags.photosAvailable
          NodeCapabilityAvailability.VoiceWakeEnabled -> flags.voiceWakeEnabled
          NodeCapabilityAvailability.MotionAvailable -> flags.motionActivityAvailable || flags.motionPedometerAvailable
        }
      }.map { it.name }

  /** Returns gateway invoke method ids available under current permissions/build flags. */
  fun advertisedCommands(flags: NodeRuntimeFlags): List<String> =
    all
      .filter { spec ->
        when (spec.availability) {
          InvokeCommandAvailability.Always -> true
          InvokeCommandAvailability.CameraEnabled -> flags.cameraEnabled
          InvokeCommandAvailability.LocationEnabled -> flags.locationEnabled
          InvokeCommandAvailability.SendSmsAvailable -> flags.sendSmsAvailable
          InvokeCommandAvailability.ReadSmsAvailable -> flags.readSmsAvailable
          InvokeCommandAvailability.RequestableSmsSearchAvailable -> flags.smsSearchPossible
          InvokeCommandAvailability.CallLogAvailable -> flags.callLogAvailable
          InvokeCommandAvailability.PhotosAvailable -> flags.photosAvailable
          InvokeCommandAvailability.MotionActivityAvailable -> flags.motionActivityAvailable
          InvokeCommandAvailability.MotionPedometerAvailable -> flags.motionPedometerAvailable
          InvokeCommandAvailability.InstalledAppsSharingEnabled -> flags.installedAppsSharingEnabled
          InvokeCommandAvailability.DebugBuild -> flags.debugBuild
        }
      }.map { it.name }
}
