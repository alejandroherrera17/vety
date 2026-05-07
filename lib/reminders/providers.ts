import type { NotificationProvider, ReminderMessage } from "@/lib/reminders/types";

export class EmailNotificationProvider implements NotificationProvider {
  channel = "email" as const;

  async send(message: ReminderMessage) {
    if (!message.recipient.email) return;
    // Wire Resend, SendGrid, SES, or another email adapter here.
    console.info("[reminders:email]", message.recipient.email, message.subject);
  }
}

export class TwilioWhatsAppProvider implements NotificationProvider {
  channel = "whatsapp" as const;

  async send(message: ReminderMessage) {
    if (!message.recipient.phone) return;
    // Wire Twilio's WhatsApp client here without changing reminder orchestration.
    console.info("[reminders:whatsapp]", message.recipient.phone, message.subject);
  }
}
