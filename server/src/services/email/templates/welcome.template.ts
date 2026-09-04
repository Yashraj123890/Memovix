interface WelcomeTemplateProps {
  name: string;
  role: string;
}

export function welcomeTemplate({
  name,
  role,
}: WelcomeTemplateProps) {
  return {
    subject: "Welcome to Memovix 🎉",

    html: `
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>Welcome to Memovix</title>
</head>

<body style="font-family:Arial,sans-serif;background:#f4f4f4;padding:40px;">
<div style="max-width:600px;margin:auto;background:white;padding:30px;border-radius:10px;">

<h2>Welcome ${name}! 👋</h2>

<p>Your <strong>${role}</strong> account has been created successfully.</p>

<p>You can now access your Memovix workspace.</p>

<p>We're excited to have you with us.</p>

<hr>

<p style="font-size:13px;color:#777;">
The Memovix Team
</p>

</div>
</body>
</html>
`,
  };
}