"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export type TranscriberStatus =
  | "idle"
  | "decoding"
  | "loading-model"
  | "transcribing"
  | "error";

interface WorkerMessage {
  type: "load-progress" | "ready" | "transcribe-start" | "result" | "error";
  pct?: number;
  text?: string;
  message?: string;
}

/** True when the browser exposes WebGPU (opportunistic; WASM is the fallback). */
function detectWebGPU(): boolean {
  return typeof navigator !== "undefined" && "gpu" in navigator;
}

/**
 * Browser-side Whisper transcription (Meeting Notes v2). Decodes the picked
 * audio/video to 16 kHz mono on the main thread, then runs Whisper in a Web
 * Worker so the UI never blocks. The recording stays in memory and is dropped
 * after transcription — it is never uploaded or stored.
 */
export function useTranscriber() {
  const workerRef = useRef<Worker | null>(null);
  const resolverRef = useRef<{
    resolve: (text: string) => void;
    reject: (err: Error) => void;
  } | null>(null);

  const [status, setStatus] = useState<TranscriberStatus>("idle");
  const [modelPct, setModelPct] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const webgpuAvailable = detectWebGPU();

  const ensureWorker = useCallback(() => {
    if (workerRef.current) return workerRef.current;
    const worker = new Worker("/whisper-worker.js", { type: "module" });
    worker.addEventListener("message", (event: MessageEvent<WorkerMessage>) => {
      const msg = event.data;
      switch (msg.type) {
        case "load-progress":
          setStatus("loading-model");
          setModelPct(msg.pct ?? 0);
          break;
        case "ready":
          setModelPct(100);
          break;
        case "transcribe-start":
          setStatus("transcribing");
          break;
        case "result":
          resolverRef.current?.resolve(msg.text ?? "");
          resolverRef.current = null;
          setStatus("idle");
          break;
        case "error":
          setError(msg.message ?? "Transcription failed");
          setStatus("error");
          resolverRef.current?.reject(new Error(msg.message ?? "Transcription failed"));
          resolverRef.current = null;
          break;
      }
    });
    workerRef.current = worker;
    return worker;
  }, []);

  useEffect(() => {
    return () => {
      workerRef.current?.terminate();
      workerRef.current = null;
    };
  }, []);

  /** Decode a recording to a 16 kHz mono Float32Array (native, fast). */
  const decode = useCallback(async (file: Blob): Promise<Float32Array> => {
    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext })
        .webkitAudioContext;
    const ctx = new AudioCtx({ sampleRate: 16000 });
    try {
      const buffer = await file.arrayBuffer();
      const decoded = await ctx.decodeAudioData(buffer);
      // Copy channel 0 out before closing the context.
      return decoded.getChannelData(0).slice();
    } finally {
      await ctx.close();
    }
  }, []);

  /** Transcribe a recording end-to-end. Resolves with the transcript text. */
  const transcribe = useCallback(
    async (file: Blob): Promise<string> => {
      setError(null);
      setStatus("decoding");
      let audio: Float32Array;
      try {
        audio = await decode(file);
      } catch {
        setStatus("error");
        const message =
          "Could not read this audio/video. Try a different file, or paste the transcript.";
        setError(message);
        throw new Error(message);
      }

      const worker = ensureWorker();
      const device = webgpuAvailable ? "webgpu" : "wasm";
      setStatus("loading-model");

      return new Promise<string>((resolve, reject) => {
        resolverRef.current = { resolve, reject };
        // Transfer the audio buffer to the worker (zero-copy; we drop it after).
        worker.postMessage({ type: "transcribe", audio, device }, [audio.buffer]);
      });
    },
    [decode, ensureWorker, webgpuAvailable],
  );

  const reset = useCallback(() => {
    setStatus("idle");
    setModelPct(0);
    setError(null);
  }, []);

  return { transcribe, status, modelPct, error, webgpuAvailable, reset };
}
