/**
 * Transcription provider abstraction (Meeting Notes v2).
 *
 * V1 does ALL transcription in the user's browser (Whisper via transformers.js);
 * the audio/video is NEVER uploaded — only the resulting transcript TEXT reaches
 * the server. So the V1 provider (`clientSupplied`) is a pass-through that simply
 * accepts and normalizes that text.
 *
 * The abstraction exists so a future server-side or hosted provider (local
 * faster-whisper on a GPU box, or Deepgram/Whisper API) can drop in behind
 * `TRANSCRIPTION_PROVIDER` without touching callers — mirroring the chat
 * `ProviderFactory`. Such a provider would receive audio bytes/ref instead of a
 * ready transcript; hence the input carries both shapes, only one of which V1
 * uses.
 */
export interface TranscriptionInput {
  /**
   * A transcript already produced on the client (browser Whisper). Present for
   * the `browser` provider; a server-side provider would ignore this and read
   * `audio` instead.
   */
  transcript?: string;
  /** How the transcript was produced, for provenance (e.g. "browser-whisper"). */
  source?: string;
  /**
   * Raw audio bytes for a FUTURE server-side provider. Never populated in V1
   * (the recording never leaves the browser). Declared here so adding such a
   * provider needs no interface change.
   */
  audio?: Uint8Array;
}

export interface TranscriptionResult {
  /** The transcript text — the permanent, auditable meeting-note source. */
  text: string;
  /** Provenance label persisted on the MeetingNote (`transcriptSource`). */
  source: string;
}

export interface TranscriptionProvider {
  readonly name: string;
  transcribe(input: TranscriptionInput): Promise<TranscriptionResult>;
}
