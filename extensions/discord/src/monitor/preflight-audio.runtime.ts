// Discord plugin module implements preflight audio behavior.
import { transcribeFirstAudio as transcribeFirstAudioImpl } from "marketingclaw/plugin-sdk/media-runtime";

type TranscribeFirstAudio =
  typeof import("marketingclaw/plugin-sdk/media-runtime").transcribeFirstAudio;

export async function transcribeFirstAudio(
  ...args: Parameters<TranscribeFirstAudio>
): ReturnType<TranscribeFirstAudio> {
  return await transcribeFirstAudioImpl(...args);
}
