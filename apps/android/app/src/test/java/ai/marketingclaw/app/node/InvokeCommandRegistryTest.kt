package ai.marketingclaw.app.node

import ai.marketingclaw.app.protocol.MarketingClawCalendarCommand
import ai.marketingclaw.app.protocol.MarketingClawCallLogCommand
import ai.marketingclaw.app.protocol.MarketingClawCameraCommand
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
import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertNotNull
import org.junit.Assert.assertNull
import org.junit.Assert.assertTrue
import org.junit.Test

class InvokeCommandRegistryTest {
  private val coreCapabilities =
    setOf(
      MarketingClawCapability.Canvas.rawValue,
      MarketingClawCapability.Device.rawValue,
      MarketingClawCapability.Notifications.rawValue,
      MarketingClawCapability.System.rawValue,
      MarketingClawCapability.Talk.rawValue,
      MarketingClawCapability.Contacts.rawValue,
      MarketingClawCapability.Calendar.rawValue,
    )

  private val optionalCapabilities =
    setOf(
      MarketingClawCapability.Camera.rawValue,
      MarketingClawCapability.Location.rawValue,
      MarketingClawCapability.Sms.rawValue,
      MarketingClawCapability.CallLog.rawValue,
      MarketingClawCapability.VoiceWake.rawValue,
      MarketingClawCapability.Motion.rawValue,
      MarketingClawCapability.Photos.rawValue,
    )

  private val coreCommands =
    setOf(
      MarketingClawDeviceCommand.Status.rawValue,
      MarketingClawDeviceCommand.Info.rawValue,
      MarketingClawDeviceCommand.Permissions.rawValue,
      MarketingClawDeviceCommand.Health.rawValue,
      MarketingClawNotificationsCommand.List.rawValue,
      MarketingClawNotificationsCommand.Actions.rawValue,
      MarketingClawSystemCommand.Notify.rawValue,
      MarketingClawTalkCommand.PttStart.rawValue,
      MarketingClawTalkCommand.PttStop.rawValue,
      MarketingClawTalkCommand.PttCancel.rawValue,
      MarketingClawTalkCommand.PttOnce.rawValue,
      MarketingClawContactsCommand.Search.rawValue,
      MarketingClawContactsCommand.Add.rawValue,
      MarketingClawCalendarCommand.Events.rawValue,
      MarketingClawCalendarCommand.Add.rawValue,
    )

  private val optionalCommands =
    setOf(
      MarketingClawCameraCommand.Snap.rawValue,
      MarketingClawCameraCommand.Clip.rawValue,
      MarketingClawCameraCommand.List.rawValue,
      MarketingClawLocationCommand.Get.rawValue,
      MarketingClawMotionCommand.Activity.rawValue,
      MarketingClawMotionCommand.Pedometer.rawValue,
      MarketingClawSmsCommand.Send.rawValue,
      MarketingClawSmsCommand.Search.rawValue,
      MarketingClawCallLogCommand.Search.rawValue,
      MarketingClawPhotosCommand.Latest.rawValue,
    )

  private val debugCommands = setOf("debug.logs", "debug.ed25519")

  @Test
  fun advertisedCapabilities_respectsFeatureAvailability() {
    val capabilities = InvokeCommandRegistry.advertisedCapabilities(defaultFlags())

    assertContainsAll(capabilities, coreCapabilities)
    assertMissingAll(capabilities, optionalCapabilities)
  }

  @Test
  fun advertisedCapabilities_includesFeatureCapabilitiesWhenEnabled() {
    val capabilities =
      InvokeCommandRegistry.advertisedCapabilities(
        defaultFlags(
          cameraEnabled = true,
          locationEnabled = true,
          sendSmsAvailable = true,
          readSmsAvailable = true,
          smsSearchPossible = true,
          callLogAvailable = true,
          photosAvailable = true,
          voiceWakeEnabled = true,
          motionActivityAvailable = true,
          motionPedometerAvailable = true,
        ),
      )

    assertContainsAll(capabilities, coreCapabilities + optionalCapabilities)
  }

  @Test
  fun advertisedCommands_respectsFeatureAvailability() {
    val commands = InvokeCommandRegistry.advertisedCommands(defaultFlags())

    assertContainsAll(commands, coreCommands)
    assertMissingAll(commands, optionalCommands + debugCommands)
  }

  @Test
  fun advertisedCommands_includesDeviceAppsOnlyWhenUserOptedIn() {
    val disabled = InvokeCommandRegistry.advertisedCommands(defaultFlags(installedAppsSharingEnabled = false))
    val enabled = InvokeCommandRegistry.advertisedCommands(defaultFlags(installedAppsSharingEnabled = true))

    assertFalse(disabled.contains(MarketingClawDeviceCommand.Apps.rawValue))
    assertTrue(enabled.contains(MarketingClawDeviceCommand.Apps.rawValue))
  }

  @Test
  fun advertisedCommands_includesFeatureCommandsWhenEnabled() {
    val commands =
      InvokeCommandRegistry.advertisedCommands(
        defaultFlags(
          cameraEnabled = true,
          locationEnabled = true,
          sendSmsAvailable = true,
          readSmsAvailable = true,
          smsSearchPossible = true,
          callLogAvailable = true,
          photosAvailable = true,
          motionActivityAvailable = true,
          motionPedometerAvailable = true,
          debugBuild = true,
        ),
      )

    assertContainsAll(commands, coreCommands + optionalCommands + debugCommands)
  }

  @Test
  fun advertisedCommands_onlyIncludesSupportedMotionCommands() {
    val commands =
      InvokeCommandRegistry.advertisedCommands(
        NodeRuntimeFlags(
          cameraEnabled = false,
          locationEnabled = false,
          sendSmsAvailable = false,
          readSmsAvailable = false,
          smsSearchPossible = false,
          callLogAvailable = false,
          photosAvailable = false,
          voiceWakeEnabled = false,
          motionActivityAvailable = true,
          motionPedometerAvailable = false,
          installedAppsSharingEnabled = false,
          debugBuild = false,
        ),
      )

    assertTrue(commands.contains(MarketingClawMotionCommand.Activity.rawValue))
    assertFalse(commands.contains(MarketingClawMotionCommand.Pedometer.rawValue))
  }

  @Test
  fun advertisedCommands_splitsSmsSendAndSearchAvailability() {
    val readOnlyCommands =
      InvokeCommandRegistry.advertisedCommands(
        defaultFlags(readSmsAvailable = true, smsSearchPossible = true),
      )
    val sendOnlyCommands =
      InvokeCommandRegistry.advertisedCommands(
        defaultFlags(sendSmsAvailable = true),
      )
    val requestableSearchCommands =
      InvokeCommandRegistry.advertisedCommands(
        defaultFlags(smsSearchPossible = true),
      )

    assertTrue(readOnlyCommands.contains(MarketingClawSmsCommand.Search.rawValue))
    assertFalse(readOnlyCommands.contains(MarketingClawSmsCommand.Send.rawValue))
    assertTrue(sendOnlyCommands.contains(MarketingClawSmsCommand.Send.rawValue))
    assertFalse(sendOnlyCommands.contains(MarketingClawSmsCommand.Search.rawValue))
    assertTrue(requestableSearchCommands.contains(MarketingClawSmsCommand.Search.rawValue))
  }

  @Test
  fun advertisedCapabilities_includeSmsWhenEitherSmsPathIsAvailable() {
    val readOnlyCapabilities =
      InvokeCommandRegistry.advertisedCapabilities(
        defaultFlags(readSmsAvailable = true),
      )
    val sendOnlyCapabilities =
      InvokeCommandRegistry.advertisedCapabilities(
        defaultFlags(sendSmsAvailable = true),
      )
    val requestableSearchCapabilities =
      InvokeCommandRegistry.advertisedCapabilities(
        defaultFlags(smsSearchPossible = true),
      )

    assertTrue(readOnlyCapabilities.contains(MarketingClawCapability.Sms.rawValue))
    assertTrue(sendOnlyCapabilities.contains(MarketingClawCapability.Sms.rawValue))
    assertFalse(requestableSearchCapabilities.contains(MarketingClawCapability.Sms.rawValue))
  }

  @Test
  fun advertisedCommands_excludesCallLogWhenUnavailable() {
    val commands = InvokeCommandRegistry.advertisedCommands(defaultFlags(callLogAvailable = false))

    assertFalse(commands.contains(MarketingClawCallLogCommand.Search.rawValue))
  }

  @Test
  fun advertisedCapabilities_excludesCallLogWhenUnavailable() {
    val capabilities = InvokeCommandRegistry.advertisedCapabilities(defaultFlags(callLogAvailable = false))

    assertFalse(capabilities.contains(MarketingClawCapability.CallLog.rawValue))
  }

  @Test
  fun advertisedPhotosSurface_respectsFeatureAvailability() {
    val disabledFlags = defaultFlags(photosAvailable = false)
    val enabledFlags = defaultFlags(photosAvailable = true)

    assertFalse(InvokeCommandRegistry.advertisedCapabilities(disabledFlags).contains(MarketingClawCapability.Photos.rawValue))
    assertFalse(InvokeCommandRegistry.advertisedCommands(disabledFlags).contains(MarketingClawPhotosCommand.Latest.rawValue))
    assertTrue(InvokeCommandRegistry.advertisedCapabilities(enabledFlags).contains(MarketingClawCapability.Photos.rawValue))
    assertTrue(InvokeCommandRegistry.advertisedCommands(enabledFlags).contains(MarketingClawPhotosCommand.Latest.rawValue))
  }

  @Test
  fun advertisedCapabilities_includesVoiceWakeWithoutAdvertisingCommands() {
    val capabilities = InvokeCommandRegistry.advertisedCapabilities(defaultFlags(voiceWakeEnabled = true))
    val commands = InvokeCommandRegistry.advertisedCommands(defaultFlags(voiceWakeEnabled = true))

    assertTrue(capabilities.contains(MarketingClawCapability.VoiceWake.rawValue))
    assertFalse(commands.any { it.contains("voice", ignoreCase = true) })
  }

  @Test
  fun find_returnsForegroundMetadataForCameraCommands() {
    val list = InvokeCommandRegistry.find(MarketingClawCameraCommand.List.rawValue)
    val location = InvokeCommandRegistry.find(MarketingClawLocationCommand.Get.rawValue)
    val pttStart = InvokeCommandRegistry.find(MarketingClawTalkCommand.PttStart.rawValue)
    val pttStop = InvokeCommandRegistry.find(MarketingClawTalkCommand.PttStop.rawValue)
    val pttCancel = InvokeCommandRegistry.find(MarketingClawTalkCommand.PttCancel.rawValue)
    val pttOnce = InvokeCommandRegistry.find(MarketingClawTalkCommand.PttOnce.rawValue)

    assertNotNull(list)
    assertEquals(true, list?.requiresForeground)
    assertNotNull(location)
    assertEquals(false, location?.requiresForeground)
    assertNotNull(pttStart)
    assertEquals(false, pttStart?.requiresForeground)
    assertNotNull(pttStop)
    assertEquals(false, pttStop?.requiresForeground)
    assertNotNull(pttCancel)
    assertEquals(false, pttCancel?.requiresForeground)
    assertNotNull(pttOnce)
    assertEquals(true, pttOnce?.requiresForeground)
  }

  @Test
  fun find_returnsNullForUnknownCommand() {
    assertNull(InvokeCommandRegistry.find("not.real"))
  }

  private fun defaultFlags(
    cameraEnabled: Boolean = false,
    locationEnabled: Boolean = false,
    sendSmsAvailable: Boolean = false,
    readSmsAvailable: Boolean = false,
    smsSearchPossible: Boolean = false,
    callLogAvailable: Boolean = false,
    photosAvailable: Boolean = false,
    voiceWakeEnabled: Boolean = false,
    motionActivityAvailable: Boolean = false,
    motionPedometerAvailable: Boolean = false,
    installedAppsSharingEnabled: Boolean = false,
    debugBuild: Boolean = false,
  ): NodeRuntimeFlags =
    NodeRuntimeFlags(
      cameraEnabled = cameraEnabled,
      locationEnabled = locationEnabled,
      sendSmsAvailable = sendSmsAvailable,
      readSmsAvailable = readSmsAvailable,
      smsSearchPossible = smsSearchPossible,
      callLogAvailable = callLogAvailable,
      photosAvailable = photosAvailable,
      voiceWakeEnabled = voiceWakeEnabled,
      motionActivityAvailable = motionActivityAvailable,
      motionPedometerAvailable = motionPedometerAvailable,
      installedAppsSharingEnabled = installedAppsSharingEnabled,
      debugBuild = debugBuild,
    )

  private fun assertContainsAll(
    actual: List<String>,
    expected: Set<String>,
  ) {
    expected.forEach { value -> assertTrue(actual.contains(value)) }
  }

  private fun assertMissingAll(
    actual: List<String>,
    forbidden: Set<String>,
  ) {
    forbidden.forEach { value -> assertFalse(actual.contains(value)) }
  }
}
