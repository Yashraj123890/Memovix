import { ResendProvider } from "./providers/resend.provider";
import { memberInvitationTemplate } from "./templates/member-invitation.template";
import { clientInvitationTemplate } from "./templates/client-invitation.template";
import { welcomeTemplate } from "./templates/welcome.template";
import { passwordResetTemplate } from "./templates/password-reset.template";
import { deliverableUpdateTemplate } from "./templates/deliverable-update.template";

export class EmailService {
  private provider = new ResendProvider();

  async sendEmail(payload: {
    to: string;
    subject: string;
    html: string;
  }) {
    await this.provider.send(payload);
  }

  async sendMemberInvitation(data: {
    to: string;
    invitedBy: string;
    workspaceName: string;
    inviteLink: string;
  }) {
    const template = memberInvitationTemplate({
      inviteeEmail: data.to,
      invitedBy: data.invitedBy,
      workspaceName: data.workspaceName,
      inviteLink: data.inviteLink,
    });

    await this.sendEmail({
      to: data.to,
      subject: template.subject,
      html: template.html,
    });
  }
async sendWelcomeEmail(data: {
    to: string;
    name: string;
    role: string;
}) {
    const template = welcomeTemplate(data);

    await this.sendEmail({
        to: data.to,
        subject: template.subject,
        html: template.html,
    });
}
async sendPasswordResetEmail(data: {
    to: string;
    name: string;
    resetLink: string;
}) {
    const template = passwordResetTemplate(data);

    await this.sendEmail({
        to: data.to,
        subject: template.subject,
        html: template.html,
    });
}
  async sendClientInvitation(data: {
    to: string;
    invitedBy: string;
    companyName: string;
    projectName: string;
    inviteLink: string;
  }) {
    const template = clientInvitationTemplate({
      invitedBy: data.invitedBy,
      companyName: data.companyName,
      projectName: data.projectName,
      inviteLink: data.inviteLink,
    });

    await this.sendEmail({
      to: data.to,
      subject: template.subject,
      html: template.html,
    });
  }

  async sendDeliverableUpdate(data: {
    to: string;
    recipientName: string;
    deliverableTitle: string;
    projectName: string;
    action: "submitted" | "approved" | "revision";
    comment?: string;
  }) {
    const template = deliverableUpdateTemplate(data);

    await this.sendEmail({
      to: data.to,
      subject: template.subject,
      html: template.html,
    });
  }
}