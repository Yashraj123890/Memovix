export interface Faq {
  q: string;
  a: string;
}

/** Honest FAQ — no "zero hallucinations"; answers are grounded and cite sources. */
export const MARKETING_FAQS: Faq[] = [
  {
    q: "Is my project data used to train AI?",
    a: "No. Your project data stays inside your workspace and is used only to answer your team's and clients' questions about that project — never to train shared models.",
  },
  {
    q: "Can clients see our internal files?",
    a: "No. Clients only see what you share in their portal — deliverables, decisions, and timeline. Internal files and memory stay internal, enforced by role-based access.",
  },
  {
    q: "How trustworthy are the AI answers?",
    a: "Answers are grounded in your project's actual content and cite their sources, so you can open the meeting note, file, or decision behind any claim and verify it yourself.",
  },
  {
    q: "What can I upload?",
    a: "PDFs, documents, images, and meeting recordings. Files are indexed into searchable memory; meeting audio is transcribed in your browser, so recordings never have to leave your device.",
  },
  {
    q: "Is it secure?",
    a: "Every workspace is tenant-isolated with role-based permissions and audit logs, so each team's data is separated at the database level.",
  },
  {
    q: "Do I need to set up any AI infrastructure?",
    a: "No. Memovix works out of the box — create a project, add content, and start asking.",
  },
];
