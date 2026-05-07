export { createReminderService, ReminderService } from "@/lib/reminders/service";
export { EmailNotificationProvider, TwilioWhatsAppProvider } from "@/lib/reminders/providers";
export type {
  NotificationChannel,
  NotificationProvider,
  ReminderKind,
  ReminderMessage,
  ReminderRecipient,
} from "@/lib/reminders/types";
