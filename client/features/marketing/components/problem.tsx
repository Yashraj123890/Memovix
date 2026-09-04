import { Reveal } from "@/features/marketing/components/reveal";

const SCATTER = [
  "Slack threads",
  "Email chains",
  "PDFs & docs",
  "Meeting recordings",
  "Call decisions",
  "Spreadsheets",
  "Someone's memory",
];

export function Problem() {
  return (
    <section id="problem" className="py-[clamp(72px,11vw,140px)]">
      <div className="mx-auto max-w-[1360px] px-6">
        <Reveal>
          <p className="text-primary font-mono text-xs tracking-[0.22em] uppercase">The problem</p>
          <h2 className="font-display mt-4 max-w-[18ch] text-[clamp(2rem,4.6vw,3.4rem)] leading-[1.05] font-medium tracking-[-0.02em]">
            Project context lives everywhere — then quietly disappears.
          </h2>
          <p className="text-muted-foreground mt-5 max-w-[60ch] text-lg leading-relaxed">
            A decision made on a call. A requirement buried in a PDF. A deadline change lost in an
            email thread. When context is scattered across a dozen tools, it slips through the cracks
            — and every “wait, what did we decide?” costs your team real hours.
          </p>
          <div className="mt-8 flex max-w-[640px] flex-wrap gap-2.5">
            {SCATTER.map((item) => (
              <span
                key={item}
                className="border-border bg-card text-muted-foreground rounded-lg border px-3.5 py-2 font-mono text-sm"
              >
                {item}
              </span>
            ))}
          </div>
          <p className="font-display text-foreground mt-9 max-w-[34ch] text-[clamp(1.2rem,2.2vw,1.6rem)] italic">
            Onboarding drags. Decisions get re-litigated. Knowledge walks out the door when people do.
          </p>
        </Reveal>
      </div>
    </section>
  );
}
