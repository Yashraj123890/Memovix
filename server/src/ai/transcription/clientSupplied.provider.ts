import {
  TranscriptionInput,
  TranscriptionProvider,
  TranscriptionResult,
} from "./transcription.provider";

/**
 * V1 transcription provider: the transcript is produced in the user's BROWSER
 * (Whisper) and sent to the server as text. This provider just validates and
 * normalizes it — the server does no audio work and the recording is never
 * uploaded or stored (Meeting Notes v2, Requirement 1). Phase 0 default model:
 * whisper-tiny.en (q8, WASM-first).
 */
export class ClientSuppliedTranscriptionProvider implements TranscriptionProvider {
  readonly name = "browser";

  async transcribe(input: TranscriptionInput): Promise<TranscriptionResult> {
    const text = (input.transcript ?? "").trim();
    if (!text) {
      throw new Error("Transcript text is required.");
    }
    return { text, source: input.source?.trim() || "browser-whisper" };
  }
}
