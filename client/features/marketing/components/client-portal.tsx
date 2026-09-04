import Link from "next/link";
import { Button } from "@/components/ui/button";
import { REGISTER_ROUTE } from "@/constants/routes";
import { Reveal } from "@/features/marketing/components/reveal";
import { VideoBlock } from "@/features/marketing/components/video-block";

export function ClientPortal() {
  return (
    <section className="border-border bg-card/30 border-y py-[clamp(72px,11vw,140px)]">
      <div className="mx-auto grid max-w-[1360px] items-center gap-12 px-6 md:grid-cols-2">
        <Reveal>
          <p className="font-display text-[clamp(1.7rem,3.4vw,2.7rem)] leading-[1.14] font-medium italic tracking-[-0.01em]">
            <span className="text-primary not-italic">“</span>Your client shouldn&apos;t need access
            to your internal chaos.<span className="text-primary not-italic">”</span>
          </p>
          <p className="text-muted-foreground mt-6 max-w-[52ch] text-lg leading-relaxed">
            Clients get their own workspace — deliverables to review and approve, the decisions that
            matter, and a clean timeline of progress. They see the work; they never see the mess
            behind it.
          </p>
          <div className="mt-8">
            <Button asChild variant="outline" className="rounded-full">
              <Link href={REGISTER_ROUTE}>Explore the client portal</Link>
            </Button>
          </div>
        </Reveal>

        <Reveal>
          <VideoBlock tag="Client view" caption="Client portal walkthrough — coming soon" />
        </Reveal>
      </div>
    </section>
  );
}
