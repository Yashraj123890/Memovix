export interface MemberInvitationTemplateData {
  inviteeEmail: string;
  invitedBy: string;
  workspaceName: string;
  inviteLink: string;
}

export function memberInvitationTemplate(
  data: MemberInvitationTemplateData
) {
  return {
    subject: `You're invited to join ${data.workspaceName} on Memovix`,

    html: `
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>Workspace Invitation</title>
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
<b>${data.invitedBy}</b> invited you to join the workspace
<b>${data.workspaceName}</b>.
</p>

<p>
Click the button below to accept the invitation.
</p>

<p style="text-align:center;margin:40px 0;">

<a
href="${data.inviteLink}"
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
${data.inviteLink}
</p>

<hr>

<p
style="
font-size:12px;
color:#666;
">

This invitation was sent to
<b>${data.inviteeEmail}</b>.

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