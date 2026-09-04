import {
    transporter,
    emailConfig,
} from "../../../config/email.config";

export interface SendEmailOptions {
    to: string;
    subject: string;
    html: string;
}

export class ResendProvider {
    async send(options: SendEmailOptions): Promise<void> {
        try {
            const info = await transporter.sendMail({
                from: emailConfig.from,
                to: options.to,
                subject: options.subject,
                html: options.html,
            });

            console.log("Email sent:", info.messageId);
        } catch (error: any) {
            console.error("GMAIL SMTP ERROR:");
            console.error(error);

            throw new Error("Failed to send email.");
        }
    }
}