import { ClientSuppliedTranscriptionProvider } from "./clientSupplied.provider";
import { TranscriptionProvider } from "./transcription.provider";

/**
 * Selects the transcription provider from `TRANSCRIPTION_PROVIDER` (default
 * "browser"), mirroring the chat `ProviderFactory`. V1 ships only the browser
 * (client-supplied) provider; "localWhisper" (server-side faster-whisper on a
 * GPU) and "hosted" (Deepgram/Whisper API) are the documented drop-in points —
 * add the class, add a case, no caller changes.
 */
export class TranscriptionProviderFactory {
  private static instance: TranscriptionProvider | null = null;

  static getProvider(): TranscriptionProvider {
    if (this.instance) return this.instance;

    const kind = process.env.TRANSCRIPTION_PROVIDER || "browser";
    switch (kind) {
      case "browser":
        this.instance = new ClientSuppliedTranscriptionProvider();
        break;
      default:
        throw new Error(
          `Transcription provider "${kind}" is not implemented. ` +
            `Supported: "browser" (client-side Whisper). ` +
            `Add a provider class + a case here to enable a server-side/hosted one.`
        );
    }
    return this.instance;
  }
}
