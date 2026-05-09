import { CalendarDays, Clock3 } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { AppointmentCalendar } from "@/components/appointment-calendar";
import { Card } from "@/components/ui/card";
import { prisma } from "@/lib/prisma";
import { requireVeterinarian } from "@/lib/session";
import { formatDateTime } from "@/lib/utils";

export default async function AppointmentsPage() {
  const veterinarian = await requireVeterinarian();
  const now = new Date();
  const [appointments, pets, nextAppointment] = await Promise.all([
    prisma.appointment.findMany({
      where: { veterinarianId: veterinarian.id },
      orderBy: { startDate: "asc" },
      include: { pet: { include: { client: true } } },
    }),
    prisma.pet.findMany({
      where: { client: { veterinarianId: veterinarian.id } },
      orderBy: { name: "asc" },
      include: { client: true },
    }),
    prisma.appointment.findFirst({
      where: { veterinarianId: veterinarian.id, startDate: { gte: now }, status: { in: ["pending", "confirmed"] } },
      orderBy: { startDate: "asc" },
      include: { pet: { include: { client: true } } },
    }),
  ]);

  return (
    <AppShell>
      <div className="mb-6 rounded-lg border border-white/10 bg-white/[0.06] p-5 shadow-2xl shadow-black/10 backdrop-blur-xl sm:p-6">
        <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
        <div>
          <p className="text-sm font-semibold text-cyan-100">Agenda clinica</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-foreground">Calendario de citas</h1>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
            Vista diaria y semanal para coordinar pacientes, propietarios y estados de atencion.
          </p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:w-[520px]">
          <Card className="rounded-xl p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-muted-foreground">Total programadas</span>
              <CalendarDays className="h-4 w-4" />
            </div>
            <p className="mt-2 text-2xl font-bold">{appointments.length}</p>
          </Card>
          <Card className="rounded-xl p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-muted-foreground">Proxima cita</span>
              <Clock3 className="h-4 w-4" />
            </div>
            <p className="mt-2 text-sm font-bold">
              {nextAppointment ? formatDateTime(nextAppointment.startDate) : "Sin citas"}
            </p>
          </Card>
        </div>
        </div>
      </div>
      <AppointmentCalendar
        pets={pets.map((pet) => ({ id: pet.id, name: pet.name, owner: pet.client.name }))}
        appointments={appointments.map((appointment) => ({
          id: appointment.id,
          title: appointment.title,
          notes: appointment.notes,
          startDate: appointment.startDate.toISOString(),
          endDate: appointment.endDate.toISOString(),
          status: appointment.status,
          petId: appointment.petId,
          petName: appointment.pet.name,
          ownerName: appointment.pet.client.name,
        }))}
      />
    </AppShell>
  );
}
