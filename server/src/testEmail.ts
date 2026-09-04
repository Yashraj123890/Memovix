import "dotenv/config";

import { EmailService } from "./services/email/email.service";

async function main() {
  try {
    const emailService = new EmailService();

    await emailService.sendEmail({
      to: "ashbros08@gmail.com", // Replace with your own email
      subject: "🎉 Memovix Email Service Test",
      html: `
        <div style="font-family: Arial, sans-serif;">
          <h2>Memovix Email Test</h2>
          <p>If you received this email, your Email Service is working correctly.</p>
          <p>🚀 Ready to integrate Member & Client Invitations.</p>
        </div>
      `,
    });
    await emailService.sendMemberInvitation({
    to: "ashbros08@gmail.comclea",
    invitedBy: "Abrar",
    workspaceName: "Memovix",
    inviteLink: "http://localhost:3000/member/register/test123",
});

    console.log("✅ Test email sent successfully.");
  } catch (error) {
    console.error("❌ Failed to send test email.");
    console.error(error);
  }
}

main();