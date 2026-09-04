interface PasswordResetTemplateProps {
  name: string;
  resetLink: string;
}

export function passwordResetTemplate({
  name,
  resetLink,
}: PasswordResetTemplateProps) {
  return {
    subject: "Reset your Memovix password",

    html: `
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>Password Reset</title>
</head>

<body style="font-family:Arial,sans-serif;background:#f4f4f4;padding:40px;">
<div style="max-width:600px;margin:auto;background:white;padding:30px;border-radius:10px;">

<h2>Hello ${name},</h2>

<p>We received a request to reset your password.</p>

<p>
<a href="${resetLink}"
style="
background:#2563eb;
color:white;
padding:12px 20px;
text-decoration:none;
border-radius:6px;
">
Reset Password
</a>
</p>

<p>If you didn't request this, simply ignore this email.</p>

<p>${resetLink}</p>

</div>
</body>
</html>
`,
  };
}