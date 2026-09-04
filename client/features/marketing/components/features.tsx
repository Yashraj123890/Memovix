import { Reveal } from "@/features/marketing/components/reveal";
import {
  MARKETING_FEATURES,
  MARKETING_FEATURE_STRIP,
} from "@/features/marketing/data/features";

export function Features() {
  return (
    <section id="features" className="border-border bg-card/30 border-y py-[clamp(72px,11vw,140px)]">
      <div className="mx-auto max-w-[1360px] px-6">
        <Reveal>
          <p className="text-primary font-mono text-xs tracking-[0.22em] uppercase">What&apos;s inside</p>
          <h2 className="font-display mt-4 text-[clamp(2rem,4.6vw,3.4rem)] leading-[1.05] font-medium tracking-[-0.02em]">
            Everything a project needs to remember.
          </h2>
        </Reveal>

        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {MARKETING_FEATURES.map(({ title, description, icon: Icon }) => (
            <Reveal key={title}>
              <div className="border-border bg-background hover:border-primary/40 h-full rounded-2xl border p-6 transition-colors">
                <div className="border-primary/25 bg-primary/10 text-primary mb-4 grid size-11 place-items-center rounded-xl border">
                  <Icon className="size-5" aria-hidden="true" />
                </div>
                <h3 className="text-foreground text-lg font-bold tracking-tight">{title}</h3>
                <p className="text-muted-foreground mt-2 text-[0.96rem] leading-relaxed">
                  {description}
                </p>
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal>
          <div className="mt-8 flex flex-wrap gap-2.5">
            {MARKETING_FEATURE_STRIP.map((item) => (
              <span
                key={item}
                className="border-border text-muted-foreground rounded-full border px-3.5 py-1.5 font-mono text-sm"
              >
                <span className="text-primary">+</span> {item}
              </span>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
