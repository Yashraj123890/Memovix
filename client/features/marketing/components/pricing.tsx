import Link from "next/link";
import { CheckIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { REGISTER_ROUTE } from "@/constants/routes";
import { Reveal } from "@/features/marketing/components/reveal";
import { PRICING_TIERS } from "@/features/marketing/data/pricing";

export function Pricing() {
  return (
    <section id="pricing" className="py-[clamp(72px,11vw,140px)]">
      <div className="mx-auto max-w-[1360px] px-6">
        <Reveal>
          <p className="text-primary font-mono text-xs tracking-[0.22em] uppercase">Pricing</p>
          <h2 className="font-display mt-4 text-[clamp(2rem,4.6vw,3.4rem)] leading-[1.05] font-medium tracking-[-0.02em]">
            Start free. Grow when you&apos;re ready.
          </h2>
          <p className="text-muted-foreground mt-5 max-w-[52ch] text-lg">
            A suggested structure to adapt to your model — the plan below is a starting point, not
            final pricing.
          </p>
        </Reveal>

        <div className="mt-12 grid gap-4 md:grid-cols-3">
          {PRICING_TIERS.map((tier) => (
            <Reveal key={tier.name}>
              <div
                className={cn(
                  "flex h-full flex-col gap-5 rounded-2xl border p-8",
                  tier.featured
                    ? "border-primary bg-card shadow-2xl"
                    : "border-border bg-background",
                )}
              >
                <div
                  className={cn(
                    "font-mono text-xs tracking-[0.16em] uppercase",
                    tier.featured ? "text-primary" : "text-muted-foreground",
                  )}
                >
                  {tier.name}
                </div>
                <div className="font-display text-4xl leading-none">
                  {tier.price}
                  {tier.cadence && (
                    <span className="text-muted-foreground ml-1.5 font-sans text-sm font-medium">
                      / {tier.cadence}
                    </span>
                  )}
                </div>
                <ul className="text-muted-foreground flex flex-1 flex-col gap-2.5 text-[0.94rem]">
                  {tier.features.map((f) => (
                    <li key={f} className="flex items-start gap-2.5">
                      <CheckIcon className="text-success mt-0.5 size-4 shrink-0" aria-hidden="true" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Button
                  asChild
                  variant={tier.featured ? "default" : "outline"}
                  className="rounded-full"
                >
                  <Link href={REGISTER_ROUTE}>{tier.cta}</Link>
                </Button>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
