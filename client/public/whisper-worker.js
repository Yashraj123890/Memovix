/*
 * Browser-side Whisper transcription worker (Meeting Notes v2).
 *
 * Runs entirely in the user's browser: the recording NEVER leaves the device —
 * only the resulting transcript text is later sent to the server. Loaded as a
 * module worker from /whisper-worker.js. transformers.js + the Whisper model are
 * fetched from CDNs at runtime (Phase 0 default: whisper-tiny.en, q8 on WASM,
 * WebGPU when available). Nothing to install for the user; the model is cached by
 * the browser after first use.
 *
 * NOTE (hardening): the library + model load from public CDNs (jsdelivr /
 * HuggingFace). Self-hosting/bundling them is a future step; pinned versions
 * below keep this deterministic.
 *
 * Protocol:
 *   in : { type: "load", device }               // "webgpu" | "wasm"
 *        { type: "transcribe", audio: Float32Array (16kHz mono) }
 *   out: { type: "load-progress", pct }
 *        { type: "ready" }
 *        { type: "transcribe-start" }
 *        { type: "result", text }
 *        { type: "error", message }
 */
import {
  pipeline,
  env,
} from "https://cdn.jsdelivr.net/npm/@huggingface/transformers@3.7.5";

// Always fetch from the HuggingFace hub (no local models in the app bundle).
env.allowLocalModels = false;

const MODEL = "Xenova/whisper-tiny.en";

let transcriber = null;
let loadingDevice = null;
const fileTotals = {};

async function load(device) {
  if (transcriber && loadingDevice === device) return;
  loadingDevice = device;
  // q4 wrecks Whisper accuracy (Phase 0) — keep full precision on WebGPU, q8 on WASM.
  const dtype = device === "webgpu" ? "fp32" : "q8";
  transcriber = await pipeline("automatic-speech-recognition", MODEL, {
    device,
    dtype,
    progress_callback: (p) => {
      if (p.status === "progress" && p.file) {
        fileTotals[p.file] = { loaded: p.loaded ?? 0, total: p.total ?? 0 };
        let loaded = 0;
        let total = 0;
        for (const f of Object.values(fileTotals)) {
          loaded += f.loaded;
          total += f.total;
        }
        const pct = total > 0 ? Math.min(100, Math.round((loaded / total) * 100)) : 0;
        self.postMessage({ type: "load-progress", pct });
      }
    },
  });
  self.postMessage({ type: "ready" });
}

self.addEventListener("message", async (event) => {
  const data = event.data;
  try {
    if (data.type === "load") {
      await load(data.device || "wasm");
      return;
    }
    if (data.type === "transcribe") {
      if (!transcriber) await load(data.device || "wasm");
      self.postMessage({ type: "transcribe-start" });
      const output = await transcriber(data.audio, {
        chunk_length_s: 30,
        stride_length_s: 5,
        return_timestamps: false,
      });
      const text = (output?.text ?? "").trim();
      self.postMessage({ type: "result", text });
    }
  } catch (error) {
    self.postMessage({
      type: "error",
      message: error && error.message ? error.message : String(error),
    });
  }
});
