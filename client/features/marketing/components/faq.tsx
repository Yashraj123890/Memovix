import { PlusIcon } from "lucide-react";
import { Reveal } from "@/features/marketing/components/reveal";
import { MARKETING_FAQS } from "@/features/marketing/data/faqs";

export function Faq() {
  return (
    <section id="faq" className="border-border bg-card/30 border-t py-[clamp(72px,11vw,140px)]">
      <div className="mx-auto max-w-[820px] px-6">
        <Reveal>
          <p className="text-primary font-mono text-xs tracking-[0.22em] uppercase">Questions</p>
          <h2 className="font-display mt-4 text-[clamp(2rem,4.6vw,3.4rem)] leading-[1.05] font-medium tracking-[-0.02em]">
            Good to know.
          </h2>
        </Reveal>

        <Reveal>
          <div className="border-border mt-10 border-t">
            {MARKETING_FAQS.map((faq, i) => (
              <details
                key={faq.q}
                className="border-border group border-b py-5"
                open={i === 0}
              >
                <summary className="text-foreground flex cursor-pointer list-none items-center justify-between gap-4 text-lg font-semibold [&::-webkit-details-marker]:hidden">
                  {faq.q}
                  <span className="border-border text-primary grid size-7 flex-none place-items-center rounded-lg border transition-transform group-open:rotate-45">
                    <PlusIcon className="size-4" aria-hidden="true" />
                  </span>
                </summary>
                <p className="text-muted-foreground mt-3 max-w-[70ch] leading-relaxed">{faq.a}</p>
              </details>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
