import Link from "next/link";
import { ArrowRightIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { REGISTER_ROUTE } from "@/constants/routes";
import { Reveal } from "@/features/marketing/components/reveal";

export function FinalCta() {
  return (
    <section id="cta" className="relative overflow-hidden py-[clamp(80px,12vw,150px)]">
      <div className="mkt-aurora" aria-hidden="true" />
      <div className="relative mx-auto max-w-[1360px] px-6 text-center">
        <Reveal>
          <p className="text-primary font-mono text-xs tracking-[0.22em] uppercase">Get started</p>
          <h2 className="font-display mx-auto mt-5 max-w-[16ch] text-[clamp(2.2rem,5.5vw,4rem)] leading-[1.04] font-medium tracking-[-0.02em]">
            Your next project should <em className="italic">remember</em> everything.
          </h2>
          <div className="mt-9 flex flex-wrap justify-center gap-3">
            <Button asChild size="lg" className="rounded-full">
              <Link href={REGISTER_ROUTE}>
                Start free
                <ArrowRightIcon aria-hidden="true" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="rounded-full">
              <a href="#how">See how it works</a>
            </Button>
          </div>
          <p className="text-muted-foreground/70 mt-6 font-mono text-xs">
            Set up your first project in minutes.
          </p>
        </Reveal>
      </div>
    </section>
  );
}
