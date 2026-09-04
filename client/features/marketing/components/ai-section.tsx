import { PackageIcon, GavelIcon, UsersIcon } from "lucide-react";
import { Reveal } from "@/features/marketing/components/reveal";
import { AnswerCard } from "@/features/marketing/components/answer-card";

export function AiSection() {
  return (
    <section className="relative overflow-hidden py-[clamp(72px,11vw,140px)]">
      <div className="mkt-aurora" aria-hidden="true" />
      <div className="relative mx-auto grid max-w-[1360px] items-center gap-12 px-6 md:grid-cols-[0.9fr_1.1fr]">
        <Reveal>
          <p className="text-primary font-mono text-xs tracking-[0.22em] uppercase">Grounded AI</p>
          <h2 className="font-display mt-4 text-[clamp(2rem,4.6vw,3.4rem)] leading-[1.05] font-medium tracking-[-0.02em]">
            Don&apos;t search your project. <em className="italic">Ask</em> it.
          </h2>
          <p className="text-muted-foreground mt-5 max-w-[52ch] text-lg leading-relaxed">
            Memovix reads your whole project — meetings, files, timeline, requirements — and answers
            in plain language, with citations you can open. Grounded in your content, not guesswork.
          </p>
        </Reveal>

        <Reveal>
          <AnswerCard
            question="What has the client actually approved so far?"
            answer={
              <>
                The client approved the <b>onboarding redesign</b> (v2) and the <b>brand palette</b>,
                and signed off on <b>Milestone 1</b> on Sep&nbsp;9. The checkout flow is{" "}
                <b>awaiting revisions</b> requested in the last review.
              </>
            }
            sources={[
              { icon: PackageIcon, label: "Deliverables", score: 92 },
              { icon: GavelIcon, label: "Decision Log", score: 87 },
              { icon: UsersIcon, label: "Meeting Notes · Sep 9", score: 79 },
            ]}
          />
        </Reveal>
      </div>
    </section>
  );
}
