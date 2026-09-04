interface ClientInvitationTemplateProps {
  invitedBy: string;
  companyName: string;
  projectName: string;
  inviteLink: string;
}

/**
 * Client invitation email — the client-facing counterpart of
 * memberInvitationTemplate. Same visual structure (dark Memovix header, white
 * card, primary CTA button, plain-text fallback link) so both invitations
 * feel like one product, but the copy is project-centric ("access your
 * project") rather than workspace-centric. Every prop is used: an email with
 * a real subject, body copy AND a working ${inviteLink} is what keeps it out
 * of the spam filter (the previous placeholder body had no link and near-empty
 * content, which is why client invitations never landed in the inbox).
 */
export function clientInvitationTemplate({
  invitedBy,
  companyName,
  projectName,
  inviteLink,
}: ClientInvitationTemplateProps): {
  subject: string;
  html: string;
} {
  return {
    subject: `You're invited to the "${projectName}" project on Memovix`,

    html: `
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>Project Invitation</title>
</head>

<body style="
margin:0;
padding:0;
background:#f5f5f5;
font-family:Arial,Helvetica,sans-serif;
">

<table width="100%" cellpadding="0" cellspacing="0">
<tr>
<td align="center" style="padding:40px;">

<table
width="600"
cellpadding="0"
cellspacing="0"
style="
background:white;
border-radius:12px;
overflow:hidden;
box-shadow:0 4px 12px rgba(0,0,0,.08);
">

<tr>
<td
style="
background:#111827;
padding:24px;
color:white;
font-size:24px;
font-weight:bold;
text-align:center;
">
Memovix
</td>
</tr>

<tr>
<td style="padding:40px;">

<h2 style="margin-top:0;">
You've been invited!
</h2>

<p>
<b>${invitedBy}</b> from <b>${companyName}</b> invited you to access the
project <b>${projectName}</b> on Memovix as a client.
</p>

<p>
Click the button below to set your password and access your project.
</p>

<p style="text-align:center;margin:40px 0;">

<a
href="${inviteLink}"
style="
background:#2563eb;
color:white;
padding:14px 28px;
text-decoration:none;
border-radius:8px;
display:inline-block;
font-weight:bold;
">

Accept Invitation

</a>

</p>

<p>
If the button doesn't work, copy this link:
</p>

<p style="word-break:break-all;">
${inviteLink}
</p>

<hr>

<p
style="
font-size:12px;
color:#666;
">

If you weren't expecting this invitation, you can safely ignore this email.

</p>

</td>
</tr>

</table>

</td>
</tr>
</table>

</body>
</html>
`,
  };
}
