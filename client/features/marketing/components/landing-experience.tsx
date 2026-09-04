"use client";

import Link from "next/link";
import {
  ArrowDownIcon,
  ArrowRightIcon,
  CalendarIcon,
  CheckCircle2Icon,
  FileTextIcon,
  GavelIcon,
  MailIcon,
  MessageSquareIcon,
  MessagesSquareIcon,
  MicIcon,
  RotateCcwIcon,
  ShieldAlertIcon,
  UploadCloudIcon,
} from "lucide-react";
import {
  useEffect,
  useRef,
  useState,
  type ComponentType,
  type CSSProperties,
  type ReactNode,
} from "react";
import { LOGIN_ROUTE, REGISTER_ROUTE } from "@/constants/routes";

const workflow = [
  ["Create project", "Step 01 · Begin", "Create the project"],
  ["Invite people", "Step 02 · Collaborate", "Invite your team and client"],
  ["Add context", "Step 03 · Capture", "Add the project context"],
  ["Build memory", "Step 04 · Connect", "Memovix builds the memory"],
  ["Ask anything", "Step 05 · Understand", "Ask the project anything"],
] as const;

const particles = Array.from({ length: 62 }, (_, index) => ({
  id: index,
  left: `${(index * 37.17) % 100}%`,
  top: `${(index * 61.73) % 100}%`,
  duration: `${8 + (index % 9)}s`,
  delay: `${-(index % 12)}s`,
  dx: `${-25 + (index % 11) * 5}px`,
  dy: `${20 + (index % 8) * 7}px`,
  color: [
    "var(--mkt-violet)",
    "var(--mkt-blue)",
    "var(--mkt-mint)",
    "var(--mkt-amber)",
  ][index % 4],
}));

function useObserved(
  ref: React.RefObject<HTMLElement | null>,
  threshold = 0.35,
) {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    const observer = new IntersectionObserver(
      ([entry]) => setVisible(entry.isIntersecting),
      { threshold },
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, [ref, threshold]);
  return visible;
}

export function LandingExperience() {
  const workflowRef = useRef<HTMLElement>(null);
  const aiRef = useRef<HTMLElement>(null);
  const workflowVisible = useObserved(workflowRef);
  const aiVisible = useObserved(aiRef, 0.42);
  const [activeStep, setActiveStep] = useState(0);
  const [aiCycle, setAiCycle] = useState(0);

  useEffect(() => {
    if (!workflowVisible) return;
    const timer = window.setInterval(
      () => setActiveStep((step) => (step + 1) % workflow.length),
      3200,
    );
    return () => window.clearInterval(timer);
  }, [workflowVisible]);

  useEffect(() => {
    if (aiVisible) setAiCycle((cycle) => cycle + 1);
  }, [aiVisible]);

  return (
    <div className="mkt-page">
      <div className="mkt-field" aria-hidden="true">
        <div className="mkt-grid" />
        <div className="mkt-haze a" />
        <div className="mkt-haze b" />
        <div className="mkt-haze c" />
        {particles.map((p) => (
          <span
            key={p.id}
            className="mkt-particle"
            style={
              {
                left: p.left,
                top: p.top,
                color: p.color,
                background: p.color,
                "--duration": p.duration,
                "--delay": p.delay,
                "--dx": p.dx,
                "--dy": p.dy,
              } as CSSProperties
            }
          />
        ))}
      </div>
      <header className="mkt-nav">
        <Link className="mkt-brand" href="#top">
          <span aria-hidden="true" />
          Memovix
        </Link>
        <div>
          <Link className="mkt-login" href={LOGIN_ROUTE}>
            Log in
          </Link>
          <Link className="mkt-primary" href={REGISTER_ROUTE}>
            Start free
          </Link>
        </div>
      </header>
      <main>
        <section className="mkt-section mkt-hero" id="top">
          <div className="mkt-orb" aria-hidden="true">
            <span />
            <span />
          </div>
          <div className="mkt-copy">
            <p className="mkt-kicker">The problem with project work</p>
            <h1>
              Projects don&apos;t lose information.
              <br />
              They lose the truth.
            </h1>
            <p className="mkt-lede">
              The decision is in a meeting. The requirement is inside a PDF. The
              approval is buried in email. The reason behind it all lives in
              someone&apos;s memory.
            </p>
            <div className="mkt-actions">
              <a className="mkt-primary" href="#problem">
                Follow the context <ArrowDownIcon />
              </a>
              <a className="mkt-secondary" href="#memory">
                Meet Memovix
              </a>
            </div>
            <p className="mkt-scroll">Scroll to follow the signal ↓</p>
          </div>
        </section>
        <section className="mkt-section mkt-chaos" id="problem">
          <div className="mkt-section-heading">
            <p className="mkt-kicker">Context, scattered</p>
            <h2>Every missing detail creates another conversation.</h2>
          </div>
          <div className="mkt-chaos-stage">
            <svg viewBox="0 0 980 510" aria-hidden="true">
              {[
                "M490 255 Q330 170 190 100",
                "M490 255 Q490 125 490 50",
                "M490 255 Q650 160 790 135",
                "M490 255 Q340 320 240 405",
                "M490 255 Q510 380 545 455",
                "M490 255 Q675 300 780 350",
              ].map((d, i) => (
                <path
                  key={d}
                  style={{ "--delay": `${i * 0.18}s` } as CSSProperties}
                  d={d}
                />
              ))}
            </svg>
            <p className="mkt-question">
              “Wait—<span>why</span> did this change?”
            </p>
            <ContextMessage c="m1" icon={MessageSquareIcon}>
              Slack · “I think it was approved”
            </ContextMessage>
            <ContextMessage c="m2" icon={FileTextIcon}>
              Requirements-final-v4.pdf
            </ContextMessage>
            <ContextMessage c="m3" icon={MailIcon}>
              Re: New checkout request
            </ContextMessage>
            <ContextMessage c="m4" icon={MicIcon}>
              Client review · 47:12
            </ContextMessage>
            <ContextMessage c="m5" icon={CheckCircle2Icon}>
              Approved by Sarah
            </ContextMessage>
            <ContextMessage c="m6" icon={CalendarIcon}>
              Launch moved to Sep 26
            </ContextMessage>
          </div>
        </section>
        <section className="mkt-section mkt-memory" id="memory">
          <div className="mkt-memory-layout">
            <div>
              <p className="mkt-kicker">From fragments to memory</p>
              <h2>What if your project remembered everything?</h2>
              <p className="mkt-lede left">
                Memovix continuously connects files, meetings, requirements,
                decisions, and approvals into one living project record.
              </p>
            </div>
            <div className="mkt-memory-core">
              <div className="mkt-core-ring">
                <span />
                <span />
              </div>
              <div className="mkt-core-label">
                Always connected<strong>Project memory</strong>
              </div>
              {[
                ["Files", "n1"],
                ["Meetings", "n2"],
                ["Approvals", "n3"],
                ["Requirements", "n4"],
                ["Decisions", "n5"],
              ].map(([label, c]) => (
                <span key={label} className={`mkt-core-node ${c}`}>
                  {label}
                </span>
              ))}
            </div>
          </div>
        </section>
        <section ref={workflowRef} className="mkt-section mkt-how" id="how">
          <div className="mkt-how-wrap">
            <p className="mkt-kicker">How it works</p>
            <h2>From empty project to living memory.</h2>
            <p className="mkt-lede left">
              One continuous workflow. Choose a step, or watch Memovix build the
              project&apos;s context automatically.
            </p>
            <div className="mkt-workflow">
              <div className="mkt-step-list" role="tablist">
                {workflow.map((step, i) => (
                  <button
                    key={step[0]}
                    type="button"
                    role="tab"
                    aria-selected={activeStep === i}
                    className={activeStep === i ? "active" : ""}
                    onClick={() => setActiveStep(i)}
                  >
                    <span>{i + 1}</span>
                    <strong>{step[0]}</strong>
                  </button>
                ))}
              </div>
              <div className="mkt-workspace">
                <div className="mkt-workspace-head">
                  <div>
                    <small>{workflow[activeStep][1]}</small>
                    <h3>{workflow[activeStep][2]}</h3>
                  </div>
                  <span>0{activeStep + 1} / 05</span>
                </div>
                <div className="mkt-scene" key={activeStep}>
                  {renderWorkflowScene(activeStep)}
                </div>
                <div className="mkt-progress">
                  <span style={{ width: `${(activeStep + 1) * 20}%` }} />
                </div>
              </div>
            </div>
          </div>
        </section>
        <section ref={aiRef} className="mkt-section mkt-ai" id="ai">
          <div className="mkt-copy">
            <p className="mkt-kicker">Grounded intelligence</p>
            <h2>
              Don&apos;t search the project.
              <br />
              Reconstruct it.
            </h2>
            <p className="mkt-lede">
              Memovix follows the evidence, connects the events, and shows you
              exactly why something changed.
            </p>
            <EvidenceReconstruction key={aiCycle} />
            <button
              className="mkt-ai-replay"
              type="button"
              onClick={() => setAiCycle((v) => v + 1)}
            >
              <RotateCcwIcon /> Replay reconstruction
            </button>
          </div>
        </section>
        <section className="mkt-section mkt-final">
          <div className="mkt-copy">
            <p className="mkt-kicker">One continuous thread</p>
            <h2>
              Your next project shouldn&apos;t forget.
              <br />
              It should remember.
            </h2>
            <p className="mkt-lede">
              Give your team and clients one trusted record of what happened,
              why it happened, and what comes next.
            </p>
            <div className="mkt-actions">
              <Link className="mkt-primary" href={REGISTER_ROUTE}>
                Start your first project <ArrowRightIcon />
              </Link>
            </div>
          </div>
        </section>
      </main>
      <footer className="mkt-footer">
        <span>Memovix — Your project&apos;s living memory.</span>
        <span>© 2026 Memovix</span>
      </footer>
    </div>
  );
}

function ContextMessage({
  c,
  icon: Icon,
  children,
}: {
  c: string;
  icon: ComponentType<{ className?: string }>;
  children: ReactNode;
}) {
  return (
    <div className={`mkt-message ${c}`}>
      <Icon />
      {children}
    </div>
  );
}
function Person({ initials, label }: { initials: string; label: string }) {
  return (
    <div>
      <span>{initials}</span>
      <small>{label}</small>
    </div>
  );
}
function renderWorkflowScene(step: number) {
  if (step === 0)
    return (
      <div className="mkt-project-form">
        <small>Project name</small>
        <div>Acme Website Redesign</div>
        <small>Description</small>
        <div>A complete digital experience for Acme</div>
        <span>Create project →</span>
      </div>
    );
  if (step === 1)
    return (
      <div className="mkt-people">
        <Person initials="YO" label="Owner" />
        <i />
        <Person initials="TM" label="Team" />
        <i />
        <Person initials="CL" label="Client" />
      </div>
    );
  if (step === 2)
    return (
      <div className="mkt-dropzone">
        <UploadCloudIcon />
        <strong>Drop in the project context</strong>
        <small>Files · meeting recordings · briefs · contracts</small>
      </div>
    );
  if (step === 3)
    return (
      <div className="mkt-ingest">
        <span>Files</span>
        <span>Meetings</span>
        <strong>Project memory</strong>
        <span>Decisions</span>
        <span>Requirements</span>
      </div>
    );
  return (
    <div className="mkt-mini-answer">
      <span>› What has the client approved?</span>
      <p>
        The client approved the <b>onboarding redesign</b> and{" "}
        <b>brand palette</b>. The checkout flow is awaiting revisions.
      </p>
      <div>
        <small>Meeting Notes · 94%</small>
        <small>Decision Log · 88%</small>
      </div>
    </div>
  );
}
function EvidenceReconstruction() {
  return (
    <div className="mkt-reconstruction">
      <div className="mkt-reconstruction-head">
        <p>Why did the launch date move?</p>
        <span>Reconstructing timeline</span>
      </div>
      <div className="mkt-date-shift">
        <div>
          <small>Original launch</small>
          <strong>Sep 12</strong>
        </div>
        <i />
        <div>
          <small>Revised launch</small>
          <strong>Sep 26</strong>
        </div>
      </div>
      <div className="mkt-evidence-chain">
        <Evidence
          icon={MessagesSquareIcon}
          score="94% match"
          title="Client requested more"
          detail="Additional payment functionality · Aug 14 review"
          c="e1"
        />
        <Evidence
          icon={ShieldAlertIcon}
          score="88% match"
          title="Engineering raised a risk"
          detail="Vault integration required more validation"
          c="e2"
        />
        <Evidence
          icon={GavelIcon}
          score="81% match"
          title="The team chose a path"
          detail="Phased beta approved for September 26"
          c="e3"
        />
      </div>
      <p className="mkt-verdict">
        <b>Answer:</b> The launch moved two weeks because the new payment
        request introduced a vault-integration risk. The team approved a phased
        beta to protect the release.
      </p>
    </div>
  );
}
function Evidence({
  icon: Icon,
  score,
  title,
  detail,
  c,
}: {
  icon: ComponentType<{ className?: string }>;
  score: string;
  title: string;
  detail: string;
  c: string;
}) {
  return (
    <div className={`mkt-evidence ${c}`}>
      <div>
        <span>
          <Icon />
        </span>
        <em>{score}</em>
      </div>
      <strong>{title}</strong>
      <small>{detail}</small>
    </div>
  );
}
