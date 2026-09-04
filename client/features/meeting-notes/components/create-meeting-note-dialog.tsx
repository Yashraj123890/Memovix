"use client";

import { useEffect, useRef, useState } from "react";
import {
  AlertTriangleIcon,
  MicIcon,
  SparklesIcon,
  SquareIcon,
  UploadIcon,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Spinner } from "@/components/ui/spinner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  useConfirmMeetingNoteMutation,
  useIngestMeetingNoteMutation,
  useRetryMeetingNoteMutation,
} from "@/features/meeting-notes/hooks/use-meeting-note-mutations";
import { useMeetingNoteDetailQuery } from "@/features/meeting-notes/hooks/use-meeting-note-detail-query";
import { useTranscriber } from "@/features/meeting-notes/hooks/use-transcriber";
import { MeetingNoteReview } from "@/features/meeting-notes/components/meeting-note-review";

interface CreateMeetingNoteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: string;
}

// "submitted" = we have a note id and render by its status (EXTRACTING → spinner,
// FAILED → retry, READY → review). Transcription happens before a note exists.
type Step = "input" | "transcribing" | "submitted";

/**
 * Meeting Notes v2 create flow. Record or upload a meeting → transcribe it IN THE
 * BROWSER (audio never leaves the device) → submit only the transcript → poll the
 * async extraction → review & confirm the decisions and action items. Paste is
 * the same pipeline minus the transcription step.
 */
export function CreateMeetingNoteDialog({
  open,
  onOpenChange,
  projectId,
}: CreateMeetingNoteDialogProps) {
  const [step, setStep] = useState<Step>("input");
  const [noteId, setNoteId] = useState<string | null>(null);
  const [pasted, setPasted] = useState("");

  // Mic recording
  const [recording, setRecording] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const transcriber = useTranscriber();
  const ingest = useIngestMeetingNoteMutation(projectId);
  const confirm = useConfirmMeetingNoteMutation(projectId);
  const retry = useRetryMeetingNoteMutation(projectId);
  const detail = useMeetingNoteDetailQuery(
    projectId,
    step === "submitted" ? noteId : null,
  );

  const note = detail.data;

  const cleanupRecording = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = null;
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    recorderRef.current = null;
    chunksRef.current = [];
    setRecording(false);
    setElapsed(0);
  };

  // Stop any in-flight recording when the component unmounts.
  useEffect(() => cleanupRecording, []);

  const reset = () => {
    cleanupRecording();
    setStep("input");
    setNoteId(null);
    setPasted("");
    transcriber.reset();
  };

  // Reset on close (not on open) so state is fresh next time, without a
  // setState-in-effect. All close paths route through this handler.
  const handleOpenChange = (next: boolean) => {
    if (!next) reset();
    onOpenChange(next);
  };

  /** Transcribe a recording in-browser, then submit only the transcript. */
  const transcribeAndIngest = async (blob: Blob) => {
    setStep("transcribing");
    let transcript: string;
    try {
      transcript = await transcriber.transcribe(blob);
    } catch {
      setStep("input"); // transcriber surfaces the error
      return;
    }
    if (!transcript.trim()) {
      toast.error("No speech detected. Try again or paste the transcript.");
      setStep("input");
      return;
    }
    ingest.mutate(
      { transcript, source: "browser-whisper" },
      {
        onSuccess: (created) => {
          setNoteId(created.id);
          setStep("submitted");
        },
        onError: () => setStep("input"),
      },
    );
  };

  const handleFile = (file: File | undefined) => {
    if (file) void transcribeAndIngest(file);
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      chunksRef.current = [];
      const recorder = new MediaRecorder(stream);
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };
      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, {
          type: chunksRef.current[0]?.type || "audio/webm",
        });
        cleanupRecording();
        void transcribeAndIngest(blob);
      };
      recorderRef.current = recorder;
      recorder.start();
      setRecording(true);
      setElapsed(0);
      timerRef.current = setInterval(() => setElapsed((s) => s + 1), 1000);
    } catch {
      toast.error("Microphone access was denied. Upload a file or paste instead.");
    }
  };

  const stopRecording = () => recorderRef.current?.stop();

  const handlePaste = () => {
    const text = pasted.trim();
    if (!text) return;
    ingest.mutate(
      { transcript: text, source: "paste" },
      {
        onSuccess: (created) => {
          setNoteId(created.id);
          setStep("submitted");
        },
      },
    );
  };

  const mmss = (s: number) =>
    `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

  const showReview = step === "submitted" && note?.status === "READY";
  const showFailed = step === "submitted" && note?.status === "FAILED";
  const showProcessing = step === "submitted" && !showReview && !showFailed;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>New meeting note</DialogTitle>
          <DialogDescription>
            Record or upload a meeting, or paste a transcript. Audio is transcribed
            in your browser and never uploaded — only the transcript is saved.
          </DialogDescription>
        </DialogHeader>

        {/* STEP: input ------------------------------------------------------ */}
        {step === "input" && (
          <InputTabs
            pasted={pasted}
            setPasted={setPasted}
            onFile={handleFile}
            recording={recording}
            elapsed={elapsed}
            startRecording={startRecording}
            stopRecording={stopRecording}
            onPaste={handlePaste}
            pasteBusy={ingest.isPending}
            webgpu={transcriber.webgpuAvailable}
            mmss={mmss}
          />
        )}

        {/* STEP: transcribing (browser Whisper) ----------------------------- */}
        {step === "transcribing" && (
          <div className="flex flex-col items-center gap-4 py-10 text-center">
            <Spinner className="size-6" />
            {transcriber.status === "loading-model" ? (
              <div className="flex w-full max-w-sm flex-col gap-2">
                <p className="text-sm font-medium">Preparing the transcription model…</p>
                <Progress value={transcriber.modelPct} />
                <p className="text-muted-foreground text-xs">
                  One-time download, then cached in your browser ({transcriber.modelPct}%)
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-1">
                <p className="text-sm font-medium">Transcribing in your browser…</p>
                <p className="text-muted-foreground text-xs">
                  The recording stays on your device. This can take a few minutes.
                </p>
              </div>
            )}
          </div>
        )}

        {/* STEP: submitted → processing / failed / review ------------------- */}
        {showProcessing && (
          <div className="flex flex-col items-center gap-4 py-10 text-center">
            <Spinner className="size-6" />
            <div className="flex flex-col gap-1">
              <p className="text-sm font-medium">
                Extracting summary, decisions &amp; action items…
              </p>
              <p className="text-muted-foreground text-xs">
                Running on the project&apos;s AI. This usually takes a couple of minutes.
              </p>
            </div>
          </div>
        )}

        {showFailed && note && (
          <div className="flex flex-col items-center gap-3 py-10 text-center">
            <AlertTriangleIcon className="text-destructive size-6" aria-hidden="true" />
            <p className="text-sm font-medium">Extraction failed</p>
            <p className="text-muted-foreground max-w-sm text-xs">
              {note.error ?? "Something went wrong while extracting."}
            </p>
            <Button onClick={() => noteId && retry.mutate(noteId)} loading={retry.isPending}>
              Retry
            </Button>
          </div>
        )}

        {showReview && note && (
          <div className="max-h-[70vh] overflow-y-auto pr-1">
            <MeetingNoteReview
              note={note}
              confirming={confirm.isPending}
              onCancel={() => handleOpenChange(false)}
              onConfirm={(decisions, actionItems) =>
                confirm.mutate(
                  { meetingNoteId: note.id, decisions, actionItems },
                  { onSuccess: () => handleOpenChange(false) },
                )
              }
            />
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

/* ---- input step: record/upload | paste (local tab state) ----------------- */

function InputTabs(props: {
  pasted: string;
  setPasted: (v: string) => void;
  onFile: (file: File | undefined) => void;
  recording: boolean;
  elapsed: number;
  startRecording: () => void;
  stopRecording: () => void;
  onPaste: () => void;
  pasteBusy: boolean;
  webgpu: boolean;
  mmss: (s: number) => string;
}) {
  const [tab, setTab] = useState<"record" | "paste">("record");
  const fileRef = useRef<HTMLInputElement>(null);

  return (
    <Tabs value={tab} onValueChange={(v) => setTab(v as "record" | "paste")}>
      <TabsList>
        <TabsTrigger value="record" icon={<MicIcon aria-hidden="true" className="size-4" />}>
          Record / Upload
        </TabsTrigger>
        <TabsTrigger value="paste" icon={<SparklesIcon aria-hidden="true" className="size-4" />}>
          Paste transcript
        </TabsTrigger>
      </TabsList>

      <TabsContent value="record" className="flex flex-col gap-4">
        <div className="border-border/60 flex flex-col items-center gap-4 rounded-lg border border-dashed p-6 text-center">
          {props.recording ? (
            <>
              <div className="flex items-center gap-2 text-sm font-medium">
                <span className="bg-destructive size-2.5 animate-pulse rounded-full" />
                Recording · {props.mmss(props.elapsed)}
              </div>
              <Button variant="destructive" onClick={props.stopRecording}>
                <SquareIcon aria-hidden="true" />
                Stop &amp; transcribe
              </Button>
            </>
          ) : (
            <>
              <Button onClick={props.startRecording}>
                <MicIcon aria-hidden="true" />
                Record meeting
              </Button>
              <div className="text-muted-foreground text-xs">or</div>
              <Button variant="outline" onClick={() => fileRef.current?.click()}>
                <UploadIcon aria-hidden="true" />
                Upload audio / video
              </Button>
              <input
                ref={fileRef}
                type="file"
                accept="audio/*,video/*"
                className="hidden"
                onChange={(e) => props.onFile(e.target.files?.[0])}
              />
            </>
          )}
        </div>
        <p className="text-muted-foreground text-xs">
          Best for meetings up to ~10–15 minutes. Transcription runs on your device
          {props.webgpu ? " (WebGPU accelerated)" : " and may be slower on this browser"}.
        </p>
      </TabsContent>

      <TabsContent value="paste" className="flex flex-col gap-3">
        <Label htmlFor="paste-transcript">Transcript</Label>
        <Textarea
          id="paste-transcript"
          rows={8}
          placeholder="Paste the meeting transcript or notes here…"
          value={props.pasted}
          onChange={(e) => props.setPasted(e.target.value)}
        />
        <div className="flex justify-end">
          <Button
            onClick={props.onPaste}
            loading={props.pasteBusy}
            disabled={props.pasted.trim().length === 0}
          >
            <SparklesIcon aria-hidden="true" />
            Extract
          </Button>
        </div>
      </TabsContent>
    </Tabs>
  );
}
