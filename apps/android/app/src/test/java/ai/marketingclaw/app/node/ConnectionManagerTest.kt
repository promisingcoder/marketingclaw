package ai.marketingclaw.app.node

import ai.marketingclaw.app.LocationMode
import ai.marketingclaw.app.SecurePrefs
import ai.marketingclaw.app.VoiceWakeMode
import ai.marketingclaw.app.gateway.GatewayEndpoint
import ai.marketingclaw.app.gateway.isLocalCleartextGatewayHost
import ai.marketingclaw.app.gateway.isLoopbackGatewayHost
import ai.marketingclaw.app.protocol.MarketingClawCallLogCommand
import ai.marketingclaw.app.protocol.MarketingClawCameraCommand
import ai.marketingclaw.app.protocol.MarketingClawCapability
import ai.marketingclaw.app.protocol.MarketingClawDeviceCommand
import ai.marketingclaw.app.protocol.MarketingClawLocationCommand
import ai.marketingclaw.app.protocol.MarketingClawMotionCommand
import ai.marketingclaw.app.protocol.MarketingClawPhotosCommand
import ai.marketingclaw.app.protocol.MarketingClawSmsCommand
import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertNull
import org.junit.Assert.assertTrue
import org.junit.Test
import org.junit.runner.RunWith
import org.robolectric.RobolectricTestRunner
import org.robolectric.RuntimeEnvironment

@RunWith(RobolectricTestRunner::class)
class ConnectionManagerTest {
  @Test
  fun resolveTlsParamsForEndpoint_prefersStoredPinOverAdvertisedFingerprint() {
    val endpoint =
      GatewayEndpoint(
        stableId = "_marketclaw-gw._tcp.|local.|Test",
        name = "Test",
        host = "10.0.0.2",
        port = 18789,
        tlsEnabled = true,
        tlsFingerprintSha256 = "attacker",
      )

    val params =
      ConnectionManager.resolveTlsParamsForEndpoint(
        endpoint,
        storedFingerprint = "legit",
        manualTlsEnabled = false,
      )

    assertEquals("legit", params?.expectedFingerprint)
    assertEquals(false, params?.allowTOFU)
  }

  @Test
  fun resolveTlsParamsForEndpoint_doesNotTrustAdvertisedFingerprintWhenNoStoredPin() {
    val endpoint =
      GatewayEndpoint(
        stableId = "_marketclaw-gw._tcp.|local.|Test",
        name = "Test",
        host = "10.0.0.2",
        port = 18789,
        tlsEnabled = true,
        tlsFingerprintSha256 = "attacker",
      )

    val params =
      ConnectionManager.resolveTlsParamsForEndpoint(
        endpoint,
        storedFingerprint = null,
        manualTlsEnabled = false,
      )

    assertNull(params?.expectedFingerprint)
    assertEquals(false, params?.allowTOFU)
  }

  @Test
  fun resolveTlsParamsForEndpoint_manualRespectsManualTlsToggle() {
    val endpoint = GatewayEndpoint.manual(host = "127.0.0.1", port = 443)

    val off =
      ConnectionManager.resolveTlsParamsForEndpoint(
        endpoint,
        storedFingerprint = null,
        manualTlsEnabled = false,
      )
    assertNull(off)

    val on =
      ConnectionManager.resolveTlsParamsForEndpoint(
        endpoint,
        storedFingerprint = null,
        manualTlsEnabled = true,
      )
    assertNull(on?.expectedFingerprint)
    assertEquals(false, on?.allowTOFU)
  }

  @Test
  fun resolveTlsParamsForEndpoint_manualNonLoopbackForcesTlsWhenToggleIsOff() {
    val endpoint = GatewayEndpoint.manual(host = "example.com", port = 443)

    val params =
      ConnectionManager.resolveTlsParamsForEndpoint(
        endpoint,
        storedFingerprint = null,
        manualTlsEnabled = false,
      )

    assertEquals(true, params?.required)
    assertNull(params?.expectedFingerprint)
    assertEquals(false, params?.allowTOFU)
  }

  @Test
  fun resolveTlsParamsForEndpoint_manualPrivateLanRespectsManualTlsToggle() {
    val endpoint = GatewayEndpoint.manual(host = "192.168.1.20", port = 18789)

    val params =
      ConnectionManager.resolveTlsParamsForEndpoint(
        endpoint,
        storedFingerprint = null,
        manualTlsEnabled = false,
      )

    assertNull(params)
  }

  @Test
  fun resolveTlsParamsForEndpoint_manualMdnsRespectsManualTlsToggle() {
    val endpoint = GatewayEndpoint.manual(host = "gateway.local", port = 18789)

    val params =
      ConnectionManager.resolveTlsParamsForEndpoint(
        endpoint,
        storedFingerprint = null,
        manualTlsEnabled = false,
      )

    assertNull(params)
  }

  @Test
  fun resolveTlsParamsForEndpoint_manualPrivateLanCleartextCanOverrideStoredPin() {
    val endpoint = GatewayEndpoint.manual(host = "192.168.1.20", port = 18789)

    val params =
      ConnectionManager.resolveTlsParamsForEndpoint(
        endpoint,
        storedFingerprint = "pinned",
        manualTlsEnabled = false,
      )

    assertNull(params)
  }

  @Test
  fun resolveTlsParamsForEndpoint_discoveryTailnetWithoutHintsStillRequiresTls() {
    val endpoint =
      GatewayEndpoint(
        stableId = "_marketclaw-gw._tcp.|local.|Test",
        name = "Test",
        host = "100.64.0.9",
        port = 18789,
        tlsEnabled = false,
        tlsFingerprintSha256 = null,
      )

    val params =
      ConnectionManager.resolveTlsParamsForEndpoint(
        endpoint,
        storedFingerprint = null,
        manualTlsEnabled = false,
      )

    assertEquals(true, params?.required)
    assertNull(params?.expectedFingerprint)
    assertEquals(false, params?.allowTOFU)
  }

  @Test
  fun resolveTlsParamsForEndpoint_discoveryPrivateLanWithoutHintsStillRequiresTls() {
    val endpoint =
      GatewayEndpoint(
        stableId = "_marketclaw-gw._tcp.|local.|Test",
        name = "Test",
        host = "192.168.1.20",
        port = 18789,
        tlsEnabled = false,
        tlsFingerprintSha256 = null,
      )

    val params =
      ConnectionManager.resolveTlsParamsForEndpoint(
        endpoint,
        storedFingerprint = null,
        manualTlsEnabled = false,
      )

    assertEquals(true, params?.required)
    assertNull(params?.expectedFingerprint)
    assertEquals(false, params?.allowTOFU)
  }

  @Test
  fun resolveTlsParamsForEndpoint_discoveryMdnsWithoutHintsStillRequiresTls() {
    val endpoint =
      GatewayEndpoint(
        stableId = "_marketclaw-gw._tcp.|local.|Test",
        name = "Test",
        host = "gateway.local",
        port = 18789,
        tlsEnabled = false,
        tlsFingerprintSha256 = null,
      )

    val params =
      ConnectionManager.resolveTlsParamsForEndpoint(
        endpoint,
        storedFingerprint = null,
        manualTlsEnabled = false,
      )

    assertEquals(true, params?.required)
    assertNull(params?.expectedFingerprint)
    assertEquals(false, params?.allowTOFU)
  }

  @Test
  fun resolveTlsParamsForEndpoint_discoveryLoopbackWithoutHintsCanStayCleartext() {
    val endpoint =
      GatewayEndpoint(
        stableId = "_marketclaw-gw._tcp.|local.|Test",
        name = "Test",
        host = "127.0.0.1",
        port = 18789,
        tlsEnabled = false,
        tlsFingerprintSha256 = null,
      )

    val params =
      ConnectionManager.resolveTlsParamsForEndpoint(
        endpoint,
        storedFingerprint = null,
        manualTlsEnabled = false,
      )

    assertNull(params)
  }

  @Test
  fun resolveTlsParamsForEndpoint_discoveryLocalhostWithoutHintsCanStayCleartext() {
    val endpoint =
      GatewayEndpoint(
        stableId = "_marketclaw-gw._tcp.|local.|Test",
        name = "Test",
        host = "localhost",
        port = 18789,
        tlsEnabled = false,
        tlsFingerprintSha256 = null,
      )

    val params =
      ConnectionManager.resolveTlsParamsForEndpoint(
        endpoint,
        storedFingerprint = null,
        manualTlsEnabled = false,
      )

    assertNull(params)
  }

  @Test
  fun resolveTlsParamsForEndpoint_discoveryAndroidEmulatorWithoutHintsCanStayCleartext() {
    val endpoint =
      GatewayEndpoint(
        stableId = "_marketclaw-gw._tcp.|local.|Test",
        name = "Test",
        host = "10.0.2.2",
        port = 18789,
        tlsEnabled = false,
        tlsFingerprintSha256 = null,
      )

    val params =
      ConnectionManager.resolveTlsParamsForEndpoint(
        endpoint,
        storedFingerprint = null,
        manualTlsEnabled = false,
      )

    assertNull(params)
  }

  @Test
  fun isLoopbackGatewayHost_onlyTreatsEmulatorBridgeAsLocalWhenAllowed() {
    assertTrue(isLoopbackGatewayHost("10.0.2.2", allowEmulatorBridgeAlias = true))
    assertFalse(isLoopbackGatewayHost("10.0.2.2", allowEmulatorBridgeAlias = false))
  }

  @Test
  fun isLocalCleartextGatewayHost_acceptsLanIpsAndMdnsButRejectsRemoteHosts() {
    assertTrue(isLocalCleartextGatewayHost("192.168.1.20"))
    assertTrue(isLocalCleartextGatewayHost("gateway.local"))
    assertTrue(isLocalCleartextGatewayHost("GATEWAY.LOCAL."))
    assertFalse(isLocalCleartextGatewayHost("gateway.local.evil.com"))
    assertFalse(isLocalCleartextGatewayHost("gatewaylocal"))
    assertFalse(isLocalCleartextGatewayHost("local"))
    assertFalse(isLocalCleartextGatewayHost(".local"))
    assertFalse(isLocalCleartextGatewayHost("gateway..local"))
    assertFalse(isLocalCleartextGatewayHost("gateway.local%25wlan0"))
    assertFalse(isLocalCleartextGatewayHost("100.64.0.9"))
    assertFalse(isLocalCleartextGatewayHost("gateway.tailnet.ts.net"))
  }

  @Test
  fun resolveTlsParamsForEndpoint_discoveryIpv6LoopbackWithoutHintsCanStayCleartext() {
    val endpoint =
      GatewayEndpoint(
        stableId = "_marketclaw-gw._tcp.|local.|Test",
        name = "Test",
        host = "::1",
        port = 18789,
        tlsEnabled = false,
        tlsFingerprintSha256 = null,
      )

    val params =
      ConnectionManager.resolveTlsParamsForEndpoint(
        endpoint,
        storedFingerprint = null,
        manualTlsEnabled = false,
      )

    assertNull(params)
  }

  @Test
  fun resolveTlsParamsForEndpoint_discoveryMappedIpv4LoopbackWithoutHintsCanStayCleartext() {
    val endpoint =
      GatewayEndpoint(
        stableId = "_marketclaw-gw._tcp.|local.|Test",
        name = "Test",
        host = "::ffff:127.0.0.1",
        port = 18789,
        tlsEnabled = false,
        tlsFingerprintSha256 = null,
      )

    val params =
      ConnectionManager.resolveTlsParamsForEndpoint(
        endpoint,
        storedFingerprint = null,
        manualTlsEnabled = false,
      )

    assertNull(params)
  }

  @Test
  fun resolveTlsParamsForEndpoint_discoveryNonLoopbackIpv6WithoutHintsRequiresTls() {
    val endpoint =
      GatewayEndpoint(
        stableId = "_marketclaw-gw._tcp.|local.|Test",
        name = "Test",
        host = "2001:db8::1",
        port = 18789,
        tlsEnabled = false,
        tlsFingerprintSha256 = null,
      )

    val params =
      ConnectionManager.resolveTlsParamsForEndpoint(
        endpoint,
        storedFingerprint = null,
        manualTlsEnabled = false,
      )

    assertEquals(true, params?.required)
    assertNull(params?.expectedFingerprint)
    assertEquals(false, params?.allowTOFU)
  }

  @Test
  fun resolveTlsParamsForEndpoint_discoveryUnspecifiedIpv4WithoutHintsRequiresTls() {
    val endpoint =
      GatewayEndpoint(
        stableId = "_marketclaw-gw._tcp.|local.|Test",
        name = "Test",
        host = "0.0.0.0",
        port = 18789,
        tlsEnabled = false,
        tlsFingerprintSha256 = null,
      )

    val params =
      ConnectionManager.resolveTlsParamsForEndpoint(
        endpoint,
        storedFingerprint = null,
        manualTlsEnabled = false,
      )

    assertEquals(true, params?.required)
    assertNull(params?.expectedFingerprint)
    assertEquals(false, params?.allowTOFU)
  }

  @Test
  fun resolveTlsParamsForEndpoint_discoveryUnspecifiedIpv6WithoutHintsRequiresTls() {
    val endpoint =
      GatewayEndpoint(
        stableId = "_marketclaw-gw._tcp.|local.|Test",
        name = "Test",
        host = "::",
        port = 18789,
        tlsEnabled = false,
        tlsFingerprintSha256 = null,
      )

    val params =
      ConnectionManager.resolveTlsParamsForEndpoint(
        endpoint,
        storedFingerprint = null,
        manualTlsEnabled = false,
      )

    assertEquals(true, params?.required)
    assertNull(params?.expectedFingerprint)
    assertEquals(false, params?.allowTOFU)
  }

  @Test
  fun buildOperatorConnectOptions_requestsNativeClientOperatorScopes() {
    val options = newManager().buildOperatorConnectOptions()

    assertEquals(
      listOf(
        "operator.admin",
        "operator.approvals",
        "operator.read",
        "operator.talk.secrets",
        "operator.write",
      ),
      options.scopes,
    )
  }

  @Test
  fun operatorScopesForStoredDeviceToken_preservesRecordedScopes() {
    assertEquals(
      listOf("operator.read", "operator.write"),
      ConnectionManager.operatorScopesForStoredDeviceToken(
        listOf("operator.read", "operator.write", "operator.read", " "),
      ),
    )
  }

  @Test
  fun operatorScopesForStoredDeviceToken_fallsBackToLegacyScopesWhenMetadataMissing() {
    assertEquals(
      ConnectionManager.legacyOperatorScopes,
      ConnectionManager.operatorScopesForStoredDeviceToken(emptyList()),
    )
  }

  @Test
  fun buildNodeConnectOptions_advertisesRequestableSmsSearchWithoutSmsCapability() {
    val options =
      newManager(
        sendSmsAvailable = false,
        readSmsAvailable = false,
        smsSearchPossible = true,
      ).buildNodeConnectOptions()

    assertTrue(options.commands.contains(MarketingClawSmsCommand.Search.rawValue))
    assertFalse(options.commands.contains(MarketingClawSmsCommand.Send.rawValue))
    assertFalse(options.caps.contains(MarketingClawCapability.Sms.rawValue))
  }

  @Test
  fun buildNodeConnectOptions_doesNotAdvertiseSmsWhenSearchIsImpossible() {
    val options =
      newManager(
        sendSmsAvailable = false,
        readSmsAvailable = false,
        smsSearchPossible = false,
      ).buildNodeConnectOptions()

    assertFalse(options.commands.contains(MarketingClawSmsCommand.Search.rawValue))
    assertFalse(options.commands.contains(MarketingClawSmsCommand.Send.rawValue))
    assertFalse(options.caps.contains(MarketingClawCapability.Sms.rawValue))
  }

  @Test
  fun buildNodeConnectOptions_advertisesSmsCapabilityWhenReadSmsIsAvailable() {
    val options =
      newManager(
        sendSmsAvailable = false,
        readSmsAvailable = true,
        smsSearchPossible = true,
      ).buildNodeConnectOptions()

    assertTrue(options.commands.contains(MarketingClawSmsCommand.Search.rawValue))
    assertTrue(options.caps.contains(MarketingClawCapability.Sms.rawValue))
  }

  @Test
  fun buildNodeConnectOptions_advertisesSmsSendWithoutSearchWhenOnlySendIsAvailable() {
    val options =
      newManager(
        sendSmsAvailable = true,
        readSmsAvailable = false,
        smsSearchPossible = false,
      ).buildNodeConnectOptions()

    assertTrue(options.commands.contains(MarketingClawSmsCommand.Send.rawValue))
    assertFalse(options.commands.contains(MarketingClawSmsCommand.Search.rawValue))
    assertTrue(options.caps.contains(MarketingClawCapability.Sms.rawValue))
  }

  @Test
  fun buildNodeConnectOptions_advertisesAvailableNonSmsCommandsAndCapabilities() {
    val options =
      newManager(
        cameraEnabled = true,
        locationMode = LocationMode.WhileUsing,
        voiceWakeMode = VoiceWakeMode.Always,
        motionActivityAvailable = true,
        callLogAvailable = true,
        photosAvailable = true,
        hasRecordAudioPermission = true,
      ).buildNodeConnectOptions()

    assertTrue(options.commands.contains(MarketingClawCameraCommand.List.rawValue))
    assertTrue(options.commands.contains(MarketingClawLocationCommand.Get.rawValue))
    assertTrue(options.commands.contains(MarketingClawMotionCommand.Activity.rawValue))
    assertTrue(options.commands.contains(MarketingClawCallLogCommand.Search.rawValue))
    assertTrue(options.commands.contains(MarketingClawPhotosCommand.Latest.rawValue))
    assertTrue(options.caps.contains(MarketingClawCapability.Camera.rawValue))
    assertTrue(options.caps.contains(MarketingClawCapability.Location.rawValue))
    assertTrue(options.caps.contains(MarketingClawCapability.Motion.rawValue))
    assertTrue(options.caps.contains(MarketingClawCapability.CallLog.rawValue))
    assertTrue(options.caps.contains(MarketingClawCapability.Photos.rawValue))
    assertTrue(options.caps.contains(MarketingClawCapability.VoiceWake.rawValue))
  }

  @Test
  fun buildNodeConnectOptions_advertisesDeviceAppsOnlyWhenUserOptedIn() {
    val disabled = newManager(installedAppsSharingEnabled = false).buildNodeConnectOptions()
    val enabled = newManager(installedAppsSharingEnabled = true).buildNodeConnectOptions()

    assertFalse(disabled.commands.contains(MarketingClawDeviceCommand.Apps.rawValue))
    assertTrue(enabled.commands.contains(MarketingClawDeviceCommand.Apps.rawValue))
  }

  @Test
  fun buildNodeConnectOptions_omitsVoiceWakeWithoutMicrophonePermission() {
    val options =
      newManager(
        voiceWakeMode = VoiceWakeMode.Always,
        hasRecordAudioPermission = false,
      ).buildNodeConnectOptions()

    assertFalse(options.caps.contains(MarketingClawCapability.VoiceWake.rawValue))
  }

  @Test
  fun buildNodeConnectOptions_omitsUnavailableCameraLocationCallLogAndPhotosSurfaces() {
    val options =
      newManager(
        cameraEnabled = false,
        locationMode = LocationMode.Off,
        callLogAvailable = false,
        photosAvailable = false,
      ).buildNodeConnectOptions()

    assertFalse(options.commands.contains(MarketingClawCameraCommand.List.rawValue))
    assertFalse(options.commands.contains(MarketingClawCameraCommand.Snap.rawValue))
    assertFalse(options.commands.contains(MarketingClawCameraCommand.Clip.rawValue))
    assertFalse(options.commands.contains(MarketingClawLocationCommand.Get.rawValue))
    assertFalse(options.commands.contains(MarketingClawCallLogCommand.Search.rawValue))
    assertFalse(options.commands.contains(MarketingClawPhotosCommand.Latest.rawValue))
    assertFalse(options.caps.contains(MarketingClawCapability.Camera.rawValue))
    assertFalse(options.caps.contains(MarketingClawCapability.Location.rawValue))
    assertFalse(options.caps.contains(MarketingClawCapability.CallLog.rawValue))
    assertFalse(options.caps.contains(MarketingClawCapability.Photos.rawValue))
  }

  @Test
  fun buildNodeConnectOptions_advertisesOnlyAvailableMotionCommand() {
    val options =
      newManager(
        motionActivityAvailable = false,
        motionPedometerAvailable = true,
      ).buildNodeConnectOptions()

    assertFalse(options.commands.contains(MarketingClawMotionCommand.Activity.rawValue))
    assertTrue(options.commands.contains(MarketingClawMotionCommand.Pedometer.rawValue))
    assertTrue(options.caps.contains(MarketingClawCapability.Motion.rawValue))
  }

  @Test
  fun buildNodeConnectOptions_omitsMotionSurfaceWhenMotionApisUnavailable() {
    val options =
      newManager(
        motionActivityAvailable = false,
        motionPedometerAvailable = false,
      ).buildNodeConnectOptions()

    assertFalse(options.commands.contains(MarketingClawMotionCommand.Activity.rawValue))
    assertFalse(options.commands.contains(MarketingClawMotionCommand.Pedometer.rawValue))
    assertFalse(options.caps.contains(MarketingClawCapability.Motion.rawValue))
  }

  private fun newManager(
    cameraEnabled: Boolean = false,
    locationMode: LocationMode = LocationMode.Off,
    voiceWakeMode: VoiceWakeMode = VoiceWakeMode.Off,
    motionActivityAvailable: Boolean = false,
    motionPedometerAvailable: Boolean = false,
    sendSmsAvailable: Boolean = false,
    readSmsAvailable: Boolean = false,
    smsSearchPossible: Boolean = false,
    callLogAvailable: Boolean = false,
    photosAvailable: Boolean = false,
    hasRecordAudioPermission: Boolean = false,
    installedAppsSharingEnabled: Boolean = false,
  ): ConnectionManager {
    val context = RuntimeEnvironment.getApplication()
    val prefs =
      SecurePrefs(
        context,
        securePrefsOverride = context.getSharedPreferences("connection-manager-test", android.content.Context.MODE_PRIVATE),
      )

    return ConnectionManager(
      prefs = prefs,
      cameraEnabled = { cameraEnabled },
      locationMode = { locationMode },
      voiceWakeMode = { voiceWakeMode },
      motionActivityAvailable = { motionActivityAvailable },
      motionPedometerAvailable = { motionPedometerAvailable },
      sendSmsAvailable = { sendSmsAvailable },
      readSmsAvailable = { readSmsAvailable },
      smsSearchPossible = { smsSearchPossible },
      callLogAvailable = { callLogAvailable },
      photosAvailable = { photosAvailable },
      hasRecordAudioPermission = { hasRecordAudioPermission },
      installedAppsSharingEnabled = { installedAppsSharingEnabled },
      manualTls = { false },
    )
  }
}
