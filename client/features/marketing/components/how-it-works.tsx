import { Reveal } from "@/features/marketing/components/reveal";
import { VideoBlock } from "@/features/marketing/components/video-block";
import { MARKETING_STEPS } from "@/features/marketing/data/steps";

export function HowItWorks() {
  return (
    <section id="how" className="py-[clamp(72px,11vw,140px)]">
      <div className="mx-auto max-w-[1360px] px-6">
        <Reveal>
          <p className="text-primary font-mono text-xs tracking-[0.22em] uppercase">How it works</p>
          <h2 className="font-display mt-4 max-w-[20ch] text-[clamp(2rem,4.6vw,3.4rem)] leading-[1.05] font-medium tracking-[-0.02em]">
            From empty project to project memory in five steps.
          </h2>
        </Reveal>

        <Reveal>
          <ol className="border-border mt-12 overflow-hidden rounded-2xl border">
            {MARKETING_STEPS.map((step, i) => (
              <li
                key={step.title}
                className="border-border bg-card hover:bg-card/60 grid grid-cols-[auto_1fr] items-baseline gap-5 border-b p-6 transition-colors last:border-b-0 sm:gap-7 sm:px-9"
              >
                <span className="font-display text-primary min-w-[1.6em] text-[clamp(1.6rem,3vw,2.4rem)] leading-none tabular-nums">
                  {i + 1}
                </span>
                <div>
                  <h3 className="text-foreground text-xl font-bold">{step.title}</h3>
                  <p className="text-muted-foreground mt-1 max-w-[60ch]">{step.description}</p>
                </div>
              </li>
            ))}
          </ol>
        </Reveal>

        <Reveal>
          <div className="mt-12">
            <VideoBlock tag="Product tour" caption="Workflow demo — coming soon" duration="15–25s" />
          </div>
        </Reveal>
      </div>
    </section>
  );
}
