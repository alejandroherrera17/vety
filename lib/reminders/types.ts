export type ReminderKind = "appointment" | "vaccine";

export type ReminderRecipient = {
  name: string;
  phone?: string | null;
  email?: string | null;
};

export type ReminderMessage = {
  kind: ReminderKind;
  recipient: ReminderRecipient;
  subject: string;
  body: string;
  scheduledFor: Date;
  metadata?: Record<string, string>;
};

export type NotificationChannel = "email" | "whatsapp";

export type NotificationProvider = {
  channel: NotificationChannel;
  send(message: ReminderMessage): Promise<void>;
};
