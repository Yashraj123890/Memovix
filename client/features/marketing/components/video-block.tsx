import { PlayIcon } from "lucide-react";

/**
 * A framed 16:9 slot for a workflow demo. Phase 1 renders a polished STATIC
 * placeholder (on-brand poster) so the page is complete and shippable without
 * any video; the animated clip drops in here later (see the plan's video
 * section) as a <video> with poster + WebM/MP4 sources.
 */
export function VideoBlock({
  tag,
  caption,
  duration,
}: {
  tag: string;
  caption: string;
  duration?: string;
}) {
  return (
    <div className="border-border bg-card relative grid aspect-video place-items-center overflow-hidden rounded-2xl border shadow-2xl">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(60% 60% at 50% 40%, color-mix(in oklch, var(--primary) 16%, transparent), transparent 70%)",
        }}
      />
      <span className="text-primary border-primary/30 bg-primary/5 absolute top-4 left-4 z-10 rounded-full border px-2.5 py-1 font-mono text-[0.62rem] tracking-[0.14em] uppercase">
        {tag}
      </span>
      <span className="bg-primary text-primary-foreground z-10 grid size-16 place-items-center rounded-full shadow-lg">
        <PlayIcon className="size-6 translate-x-0.5 fill-current" aria-hidden="true" />
      </span>
      <div className="text-muted-foreground absolute right-4 bottom-4 left-4 z-10 flex items-center justify-between gap-3 font-mono text-[0.72rem]">
        <span className="tracking-wide uppercase">{caption}</span>
        {duration && <span className="text-foreground/50">{duration}</span>}
      </div>
    </div>
  );
}
