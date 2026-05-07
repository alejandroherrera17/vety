import "server-only";

import { prisma } from "@/lib/prisma";
import { EmailNotificationProvider, TwilioWhatsAppProvider } from "@/lib/reminders/providers";
import type { NotificationProvider, ReminderMessage } from "@/lib/reminders/types";

const dayMs = 24 * 60 * 60 * 1000;

function betweenDaysFromNow(days: number) {
  const start = new Date(Date.now() + days * dayMs);
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setHours(23, 59, 59, 999);
  return { gte: start, lte: end };
}

export class ReminderService {
  constructor(private readonly providers: NotificationProvider[]) {}

  async send(message: ReminderMessage) {
    await Promise.all(this.providers.map((provider) => provider.send(message)));
  }

  async collectAppointmentTomorrowReminders() {
    const appointments = await prisma.appointment.findMany({
      where: {
        startDate: betweenDaysFromNow(1),
        status: { in: ["pending", "confirmed"] },
      },
      include: { pet: { include: { client: true } } },
    });

    return appointments.map((appointment): ReminderMessage => ({
      kind: "appointment",
      recipient: {
        name: appointment.pet.client.name,
        phone: appointment.pet.client.phone,
        email: appointment.pet.client.email,
      },
      subject: `Recordatorio de cita para ${appointment.pet.name}`,
      body: `${appointment.pet.name} tiene una cita manana: ${appointment.title}.`,
      scheduledFor: appointment.startDate,
      metadata: { appointmentId: appointment.id, petId: appointment.petId },
    }));
  }

  async collectVaccineDueInThreeDaysReminders() {
    const vaccinations = await prisma.vaccination.findMany({
      where: { nextDose: betweenDaysFromNow(3) },
      include: { pet: { include: { client: true } } },
    });

    return vaccinations.map((vaccination): ReminderMessage => ({
      kind: "vaccine",
      recipient: {
        name: vaccination.pet.client.name,
        phone: vaccination.pet.client.phone,
        email: vaccination.pet.client.email,
      },
      subject: `Vacuna proxima para ${vaccination.pet.name}`,
      body: `${vaccination.pet.name} tiene la vacuna ${vaccination.vaccine} programada en 3 dias.`,
      scheduledFor: vaccination.nextDose ?? new Date(),
      metadata: { vaccinationId: vaccination.id, petId: vaccination.petId },
    }));
  }

  async dispatchDueReminders() {
    const [appointments, vaccines] = await Promise.all([
      this.collectAppointmentTomorrowReminders(),
      this.collectVaccineDueInThreeDaysReminders(),
    ]);
    const messages = [...appointments, ...vaccines];

    await Promise.all(messages.map((message) => this.send(message)));
    return { sent: messages.length };
  }
}

export function createReminderService(providers: NotificationProvider[] = [
  new EmailNotificationProvider(),
  new TwilioWhatsAppProvider(),
]) {
  return new ReminderService(providers);
}
