export interface MarketingStep {
  title: string;
  description: string;
}

/** How it works — a genuine ordered sequence (the numbering carries meaning). */
export const MARKETING_STEPS: MarketingStep[] = [
  {
    title: "Create a project",
    description:
      "Start with a name and a description. Your project's memory begins the moment it exists.",
  },
  {
    title: "Invite your team and your client",
    description:
      "Add teammates with roles, and give the client their own portal — everyone works from the same context.",
  },
  {
    title: "Upload files and capture memories",
    description:
      "Drop in briefs, contracts, and recordings. Record meetings and confirm the decisions and action items it extracts.",
  },
  {
    title: "Memovix builds the project's context",
    description:
      "Everything is indexed into one searchable memory — files, decisions, timeline, and requirements, all connected.",
  },
  {
    title: "Ask AI anything about the project",
    description:
      "Get grounded answers with citations — for your team, and for clients, without anyone digging through folders.",
  },
];
