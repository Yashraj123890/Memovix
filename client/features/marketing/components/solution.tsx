import { ArrowRightIcon } from "lucide-react";
import { Reveal } from "@/features/marketing/components/reveal";

const THREAD = [
  { k: "Capture", n: "Files", d: "Docs, PDFs, and recordings become searchable memory." },
  { k: "Structure", n: "Memories", d: "Key facts, decisions, and requirements stay connected." },
  { k: "Track", n: "Timeline", d: "Every change and approval is recorded automatically." },
  { k: "Answer", n: "AI", d: "Ask anything and get grounded answers, with citations." },
];

export function Solution() {
  return (
    <section className="pb-[clamp(72px,11vw,140px)]">
      <div className="mx-auto max-w-[1360px] px-6">
        <Reveal>
          <p className="text-primary font-mono text-xs tracking-[0.22em] uppercase">The shift</p>
          <h2 className="font-display mt-4 text-[clamp(2rem,4.6vw,3.4rem)] leading-[1.05] font-medium tracking-[-0.02em]">
            One project brain, always up to date.
          </h2>
          <p className="text-muted-foreground mt-5 max-w-[60ch] text-lg leading-relaxed">
            Memovix connects your files, memories, meetings, and timeline into a single searchable
            project memory — with an AI on top that answers from your project, and shows its sources.
          </p>

          <div className="mt-10 flex flex-wrap items-stretch gap-3">
            {THREAD.map((node, i) => (
              <div key={node.n} className="flex flex-1 items-center gap-3 sm:flex-none">
                <div className="border-border bg-card min-w-[190px] flex-1 rounded-2xl border p-5">
                  <p className="text-muted-foreground/80 font-mono text-[0.7rem] tracking-[0.14em] uppercase">
                    {node.k}
                  </p>
                  <p className="font-display text-foreground mt-1.5 text-2xl">{node.n}</p>
                  <p className="text-muted-foreground mt-2 text-sm">{node.d}</p>
                </div>
                {i < THREAD.length - 1 && (
                  <ArrowRightIcon
                    className="text-primary hidden size-5 shrink-0 sm:block"
                    aria-hidden="true"
                  />
                )}
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
