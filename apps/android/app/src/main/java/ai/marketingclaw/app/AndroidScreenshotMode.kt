package ai.marketingclaw.app

import android.content.Intent

const val extraAndroidScreenshotMode = "marketingclaw.screenshotMode"
const val extraAndroidScreenshotScene = "marketingclaw.screenshotScene"

enum class AndroidScreenshotScene(
  val rawValue: String,
  val homeDestination: HomeDestination,
) {
  Home("home", HomeDestination.Connect),
  Chat("chat", HomeDestination.Chat),
  Voice("voice", HomeDestination.Voice),
  Settings("settings", HomeDestination.Settings),
  ;

  companion object {
    fun fromRawValue(raw: String?): AndroidScreenshotScene = entries.firstOrNull { it.rawValue == raw?.trim()?.lowercase() } ?: Home
  }
}

fun parseAndroidScreenshotModeIntent(intent: Intent?): AndroidScreenshotScene? {
  if (intent?.getBooleanExtra(extraAndroidScreenshotMode, false) != true) {
    return null
  }
  return AndroidScreenshotScene.fromRawValue(intent.getStringExtra(extraAndroidScreenshotScene))
}
