import Link from "next/link";
import { ArrowRightIcon, UsersIcon, GavelIcon, FileTextIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { REGISTER_ROUTE } from "@/constants/routes";
import { Reveal } from "@/features/marketing/components/reveal";
import { AnswerCard } from "@/features/marketing/components/answer-card";

export function Hero() {
  return (
    <section id="top" className="relative overflow-hidden">
      <div className="mkt-aurora" aria-hidden="true" />
      <div className="relative mx-auto grid max-w-[1360px] items-center gap-12 px-6 pt-16 pb-20 md:grid-cols-[1.05fr_0.95fr] md:pt-24 md:pb-28 lg:gap-16">
        <Reveal>
          <p className="text-primary font-mono text-xs tracking-[0.22em] uppercase">
            AI Project Memory
          </p>
          <h1 className="font-display mt-5 text-[clamp(2.9rem,7vw,5rem)] leading-[1.02] font-medium tracking-[-0.03em]">
            Your projects <em className="italic">remember</em> everything.
          </h1>
          <p className="text-muted-foreground mt-6 max-w-[56ch] text-[clamp(1.05rem,1.7vw,1.28rem)] leading-relaxed">
            Memovix turns scattered files, meetings, and decisions into living project memory — one
            place where your team and your clients always have the full context, and can just ask AI
            for grounded answers.
          </p>
          <div className="mt-9 flex flex-wrap gap-3">
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
            No credit card · A project set up in minutes
          </p>
        </Reveal>

        <Reveal>
          <AnswerCard
            question="Why did the launch date slip?"
            answer={
              <>
                The launch moved from <b>Sep&nbsp;12</b> to <b>Sep&nbsp;26</b> after the client
                requested extra payment features in the <b>Aug&nbsp;14 review</b>. Engineering
                flagged a vault-integration risk, and the team agreed to a phased beta.
              </>
            }
            sources={[
              { icon: UsersIcon, label: "Meeting Notes · Aug 14", score: 94 },
              { icon: GavelIcon, label: "Decision Log", score: 88 },
              { icon: FileTextIcon, label: "Requirements.pdf", score: 81 },
            ]}
            footer="Grounded in this project — every claim cites its source."
          />
        </Reveal>
      </div>
    </section>
  );
}
