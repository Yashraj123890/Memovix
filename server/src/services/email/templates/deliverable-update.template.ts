export interface DeliverableUpdateTemplateProps {
  recipientName: string;
  deliverableTitle: string;
  projectName: string;
  action: "submitted" | "approved" | "revision";
  comment?: string;
}

/**
 * Deliverable lifecycle emails. Owner/member-facing on `approved` / `revision`
 * (blueprint §3.1.7); client-facing on `submitted` (blueprint §2.2 / §3.1.10 —
 * "a new deliverable is ready to review"). Same visual structure as the
 * invitation emails.
 */
export function deliverableUpdateTemplate({
  recipientName,
  deliverableTitle,
  projectName,
  action,
  comment,
}: DeliverableUpdateTemplateProps): { subject: string; html: string } {
  const subject =
    action === "submitted"
      ? `Ready for review: ${deliverableTitle}`
      : action === "approved"
        ? `Deliverable approved: ${deliverableTitle}`
        : `Revision requested: ${deliverableTitle}`;

  const heading =
    action === "submitted"
      ? "Ready for your review"
      : action === "approved"
        ? "Deliverable approved"
        : "Revision requested";

  const body =
    action === "submitted"
      ? `The deliverable <b>${deliverableTitle}</b> in project <b>${projectName}</b> is ready for your review.`
      : action === "approved"
        ? `Your client approved the deliverable <b>${deliverableTitle}</b> in project <b>${projectName}</b>.`
        : `Your client requested a revision on <b>${deliverableTitle}</b> in project <b>${projectName}</b>.`;

  const commentBlock =
    action === "revision" && comment
      ? `<p style="background:#f3f4f6;padding:12px 16px;border-radius:8px;margin:16px 0;">“${comment}”</p>`
      : "";

  return {
    subject,
    html: `
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><title>${subject}</title></head>
<body style="margin:0;padding:0;background:#f5f5f5;font-family:Arial,Helvetica,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:40px;">
<table width="600" cellpadding="0" cellspacing="0" style="background:white;border-radius:12px;overflow:hidden;box-shadow:0 4px 12px rgba(0,0,0,.08);">
<tr><td style="background:#111827;padding:24px;color:white;font-size:24px;font-weight:bold;text-align:center;">Memovix</td></tr>
<tr><td style="padding:40px;">
<h2 style="margin-top:0;">${heading}</h2>
<p>Hi ${recipientName},</p>
<p>${body}</p>
${commentBlock}
<hr>
<p style="font-size:12px;color:#666;">You're receiving this because you own this deliverable on Memovix.</p>
</td></tr>
</table>
</td></tr></table>
</body>
</html>
`,
  };
}
