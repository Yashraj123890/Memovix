export interface EmailPayload {
  to: string;
  subject: string;
  html: string;
}

export interface SendEmailResult {
  success: boolean;
}

export interface ClientInvitationEmail {
    to: string;
    invitedBy: string;
    companyName: string;
    projectName: string;
    inviteLink: string;
}