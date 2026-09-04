import {
  BrainCircuitIcon,
  SparklesIcon,
  MessagesSquareIcon,
  Contact2Icon,
  ScrollTextIcon,
  ListChecksIcon,
  type LucideIcon,
} from "lucide-react";

export interface MarketingFeature {
  title: string;
  description: string;
  icon: LucideIcon;
}

/**
 * Six headline features — every one is implemented and usable today (verified
 * against features/projects/config/workspace-tabs.ts and the feature dirs).
 * No planned/"coming soon" capability is listed.
 */
export const MARKETING_FEATURES: MarketingFeature[] = [
  {
    title: "Project memory",
    description:
      "Files, notes, decisions, and requirements stay linked in one context that grows with the project — nothing gets orphaned.",
    icon: BrainCircuitIcon,
  },
  {
    title: "AI project assistant",
    description:
      "Ask anything and get answers grounded in your project — every reply cites the files, meetings, and decisions it drew from.",
    icon: SparklesIcon,
  },
  {
    title: "Meeting notes that record themselves",
    description:
      "Record or upload a meeting; it's transcribed in your browser, and the decisions and action items are pulled out for you to confirm.",
    icon: MessagesSquareIcon,
  },
  {
    title: "Client portal",
    description:
      "Give clients a dedicated workspace to review and approve deliverables and see decisions — without touching your internal chaos.",
    icon: Contact2Icon,
  },
  {
    title: "Timeline & decision log",
    description:
      "Every change, approval, and decision is captured automatically — so “why did this change?” always has an answer.",
    icon: ScrollTextIcon,
  },
  {
    title: "Requirements & deliverables",
    description:
      "Track scope from brief to sign-off, flag scope creep early, and ship deliverables clients can approve in a click.",
    icon: ListChecksIcon,
  },
];

/** Secondary, also-real capabilities shown as a compact strip. */
export const MARKETING_FEATURE_STRIP: string[] = [
  "Team roles & permissions",
  "Semantic AI search",
  "Audit logs",
  "Tenant-isolated & secure",
];
