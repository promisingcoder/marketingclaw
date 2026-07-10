package ai.marketingclaw.app.protocol

import org.junit.Assert.assertEquals
import org.junit.Test

class MarketingClawProtocolConstantsTest {
  @Test
  fun canvasCommandsUseStableStrings() {
    assertEquals("canvas.present", MarketingClawCanvasCommand.Present.rawValue)
    assertEquals("canvas.hide", MarketingClawCanvasCommand.Hide.rawValue)
    assertEquals("canvas.navigate", MarketingClawCanvasCommand.Navigate.rawValue)
    assertEquals("canvas.eval", MarketingClawCanvasCommand.Eval.rawValue)
    assertEquals("canvas.snapshot", MarketingClawCanvasCommand.Snapshot.rawValue)
  }

  @Test
  fun a2uiCommandsUseStableStrings() {
    assertEquals("canvas.a2ui.push", MarketingClawCanvasA2UICommand.Push.rawValue)
    assertEquals("canvas.a2ui.pushJSONL", MarketingClawCanvasA2UICommand.PushJSONL.rawValue)
    assertEquals("canvas.a2ui.reset", MarketingClawCanvasA2UICommand.Reset.rawValue)
  }

  @Test
  fun capabilitiesUseStableStrings() {
    assertEquals("canvas", MarketingClawCapability.Canvas.rawValue)
    assertEquals("camera", MarketingClawCapability.Camera.rawValue)
    assertEquals("voiceWake", MarketingClawCapability.VoiceWake.rawValue)
    assertEquals("talk", MarketingClawCapability.Talk.rawValue)
    assertEquals("location", MarketingClawCapability.Location.rawValue)
    assertEquals("sms", MarketingClawCapability.Sms.rawValue)
    assertEquals("device", MarketingClawCapability.Device.rawValue)
    assertEquals("notifications", MarketingClawCapability.Notifications.rawValue)
    assertEquals("system", MarketingClawCapability.System.rawValue)
    assertEquals("photos", MarketingClawCapability.Photos.rawValue)
    assertEquals("contacts", MarketingClawCapability.Contacts.rawValue)
    assertEquals("calendar", MarketingClawCapability.Calendar.rawValue)
    assertEquals("motion", MarketingClawCapability.Motion.rawValue)
    assertEquals("callLog", MarketingClawCapability.CallLog.rawValue)
  }

  @Test
  fun cameraCommandsUseStableStrings() {
    assertEquals("camera.list", MarketingClawCameraCommand.List.rawValue)
    assertEquals("camera.snap", MarketingClawCameraCommand.Snap.rawValue)
    assertEquals("camera.clip", MarketingClawCameraCommand.Clip.rawValue)
  }

  @Test
  fun notificationsCommandsUseStableStrings() {
    assertEquals("notifications.list", MarketingClawNotificationsCommand.List.rawValue)
    assertEquals("notifications.actions", MarketingClawNotificationsCommand.Actions.rawValue)
  }

  @Test
  fun deviceCommandsUseStableStrings() {
    assertEquals("device.status", MarketingClawDeviceCommand.Status.rawValue)
    assertEquals("device.info", MarketingClawDeviceCommand.Info.rawValue)
    assertEquals("device.permissions", MarketingClawDeviceCommand.Permissions.rawValue)
    assertEquals("device.health", MarketingClawDeviceCommand.Health.rawValue)
    assertEquals("device.apps", MarketingClawDeviceCommand.Apps.rawValue)
  }

  @Test
  fun systemCommandsUseStableStrings() {
    assertEquals("system.notify", MarketingClawSystemCommand.Notify.rawValue)
  }

  @Test
  fun photosCommandsUseStableStrings() {
    assertEquals("photos.latest", MarketingClawPhotosCommand.Latest.rawValue)
  }

  @Test
  fun contactsCommandsUseStableStrings() {
    assertEquals("contacts.search", MarketingClawContactsCommand.Search.rawValue)
    assertEquals("contacts.add", MarketingClawContactsCommand.Add.rawValue)
  }

  @Test
  fun calendarCommandsUseStableStrings() {
    assertEquals("calendar.events", MarketingClawCalendarCommand.Events.rawValue)
    assertEquals("calendar.add", MarketingClawCalendarCommand.Add.rawValue)
  }

  @Test
  fun motionCommandsUseStableStrings() {
    assertEquals("motion.activity", MarketingClawMotionCommand.Activity.rawValue)
    assertEquals("motion.pedometer", MarketingClawMotionCommand.Pedometer.rawValue)
  }

  @Test
  fun smsCommandsUseStableStrings() {
    assertEquals("sms.send", MarketingClawSmsCommand.Send.rawValue)
    assertEquals("sms.search", MarketingClawSmsCommand.Search.rawValue)
  }

  @Test
  fun talkCommandsUseStableStrings() {
    assertEquals("talk.ptt.start", MarketingClawTalkCommand.PttStart.rawValue)
    assertEquals("talk.ptt.stop", MarketingClawTalkCommand.PttStop.rawValue)
    assertEquals("talk.ptt.cancel", MarketingClawTalkCommand.PttCancel.rawValue)
    assertEquals("talk.ptt.once", MarketingClawTalkCommand.PttOnce.rawValue)
  }

  @Test
  fun callLogCommandsUseStableStrings() {
    assertEquals("callLog.search", MarketingClawCallLogCommand.Search.rawValue)
  }
}
