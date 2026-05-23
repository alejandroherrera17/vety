import { CalendarDays, Clock3, Inbox } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { AppointmentCalendar } from "@/components/appointment-calendar";
import { AppointmentRequestPanel } from "@/components/appointment-request-panel";
import { Card } from "@/components/ui/card";
import { prisma } from "@/lib/prisma";
import { requireWorkspace } from "@/lib/session";
import { formatDateTime } from "@/lib/utils";

export default async function AppointmentsPage() {
  const workspace = await requireWorkspace();
  const now = new Date();
  const [appointments, pets, veterinarians, appointmentRequests, nextAppointment] = await Promise.all([
    prisma.appointment.findMany({
      where:
        workspace.role === "veterinarian"
          ? { organizationId: workspace.organizationId, assignedVeterinarianId: workspace.veterinarianId }
          : { organizationId: workspace.organizationId },
      orderBy: { startDate: "asc" },
      include: { pet: { include: { client: true } }, assignedVeterinarian: true },
    }),
    prisma.pet.findMany({
      where: { organizationId: workspace.organizationId },
      orderBy: { name: "asc" },
      include: { client: true },
    }),
    prisma.organizationUser.findMany({
      where: {
        organizationId: workspace.organizationId,
        status: "active",
        role: { in: ["admin", "veterinarian"] },
        veterinarianId: { not: null },
      },
      orderBy: { name: "asc" },
      select: { veterinarianId: true, name: true, role: true },
    }),
    prisma.appointmentRequest.findMany({
      where: { organizationId: workspace.organizationId, status: "pending" },
      orderBy: { requestedStart: "asc" },
      take: 12,
      include: {
        client: true,
        pet: true,
        requestedVeterinarian: true,
      },
    }),
    prisma.appointment.findFirst({
      where: { organizationId: workspace.organizationId, startDate: { gte: now }, status: { in: ["pending", "confirmed"] } },
      orderBy: { startDate: "asc" },
      include: { pet: { include: { client: true } } },
    }),
  ]);
  const veterinarianOptions = veterinarians
    .filter((veterinarian) => veterinarian.veterinarianId)
    .map((veterinarian) => ({
      id: veterinarian.veterinarianId as string,
      name: veterinarian.name,
      role: veterinarian.role,
    }));

  return (
    <AppShell>
      <div className="mb-6 rounded-lg border border-white/10 bg-white/[0.06] p-5 shadow-2xl shadow-black/10 backdrop-blur-xl sm:p-6">
        <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
        <div>
          <p className="text-sm font-semibold text-cyan-100">Agenda clinica</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-foreground">Calendario de citas</h1>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
            Vista diaria, semanal y mensual con filtros, reasignacion, solicitudes y validacion de conflictos.
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
          <Card className="rounded-xl p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-muted-foreground">Solicitudes pendientes</span>
              <Inbox className="h-4 w-4" />
            </div>
            <p className="mt-2 text-2xl font-bold">{appointmentRequests.length}</p>
          </Card>
        </div>
        </div>
      </div>
      <section className="mb-5 rounded-lg border border-white/10 bg-white/[0.06] p-5 shadow-2xl shadow-black/10 backdrop-blur-xl">
        <div className="mb-4">
          <p className="text-sm font-semibold text-cyan-100">Solicitudes de propietarios</p>
          <h2 className="mt-1 text-xl font-bold text-foreground">Bandeja de aprobacion</h2>
        </div>
        <AppointmentRequestPanel
          veterinarians={veterinarianOptions}
          requests={appointmentRequests.map((request) => ({
            id: request.id,
            service: request.service,
            reason: request.reason,
            requestedStart: request.requestedStart.toISOString(),
            requestedEnd: request.requestedEnd?.toISOString() ?? null,
            status: request.status,
            clientName: request.client.name,
            petName: request.pet.name,
            requestedVeterinarianName: request.requestedVeterinarian?.name ?? null,
          }))}
        />
      </section>
      <AppointmentCalendar
        pets={pets.map((pet) => ({ id: pet.id, name: pet.name, owner: pet.client.name }))}
        veterinarians={veterinarianOptions}
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
          assignedVeterinarianId: appointment.assignedVeterinarianId,
          assignedVeterinarianName: appointment.assignedVeterinarian?.name ?? null,
        }))}
      />
    </AppShell>
  );
}
