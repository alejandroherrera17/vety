import Link from "next/link";
import { CalendarDays, CalendarPlus, Clock3, Inbox, PawPrint, Plus, UserRoundCheck, Users } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { AppointmentModal } from "@/components/appointment-modal";
import { ClientFormModal } from "@/components/client-form-modal";
import { PetFormModal } from "@/components/pet-form-modal";
import { Button } from "@/components/ui/button";
import { Card, EmptyState } from "@/components/ui/card";
import { prisma } from "@/lib/prisma";
import { requirePremiumWorkspace } from "@/lib/session";
import { formatDate, formatDateTime } from "@/lib/utils";

export default async function DashboardPage() {
  const workspace = await requirePremiumWorkspace();
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const todayEnd = new Date(todayStart);
  todayEnd.setHours(23, 59, 59, 999);

  const [
    totalClients,
    totalPets,
    recentConsultations,
    clients,
    pets,
    todaysAppointments,
    upcomingAppointments,
    pendingRequests,
    activeTeam,
  ] = await Promise.all([
    prisma.client.count({ where: { organizationId: workspace.organizationId } }),
    prisma.pet.count({ where: { organizationId: workspace.organizationId } }),
    prisma.consultation.findMany({
      where: { medicalRecord: { organizationId: workspace.organizationId } },
      orderBy: { date: "desc" },
      take: 5,
      include: { medicalRecord: { include: { pet: { include: { client: true } } } } },
    }),
    prisma.client.findMany({
      where: { organizationId: workspace.organizationId },
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
    prisma.pet.findMany({
      where: { organizationId: workspace.organizationId },
      orderBy: { name: "asc" },
      include: { client: true },
    }),
    prisma.appointment.findMany({
      where: { organizationId: workspace.organizationId, startDate: { gte: todayStart, lte: todayEnd } },
      orderBy: { startDate: "asc" },
      include: { pet: { include: { client: true } }, assignedVeterinarian: true },
    }),
    prisma.appointment.findMany({
      where: {
        organizationId: workspace.organizationId,
        startDate: { gt: todayEnd },
        status: { in: ["pending", "confirmed"] },
      },
      orderBy: { startDate: "asc" },
      take: 5,
      include: { pet: { include: { client: true } }, assignedVeterinarian: true },
    }),
    prisma.appointmentRequest.findMany({
      where: { organizationId: workspace.organizationId, status: "pending" },
      orderBy: { requestedStart: "asc" },
      take: 5,
      include: { client: true, pet: true },
    }),
    prisma.organizationUser.findMany({
      where: { organizationId: workspace.organizationId, status: "active" },
      orderBy: { name: "asc" },
      select: { name: true, role: true, veterinarianId: true },
    }),
  ]);

  const petOptions = pets.map((pet) => ({ id: pet.id, name: pet.name, owner: pet.client.name }));
  const veterinarianOptions = activeTeam
    .filter((member) => member.veterinarianId && ["admin", "veterinarian"].includes(member.role))
    .map((member) => ({
      id: member.veterinarianId as string,
      name: member.name,
      role: member.role,
    }));

  return (
    <AppShell>
      <div className="mb-6 overflow-hidden rounded-lg border border-border bg-white p-5 shadow-2xl shadow-black/10 backdrop-blur-xl sm:p-6">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <p className="text-sm font-semibold text-[#27ADF5]">Hoy en VettiPets</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-foreground">
            Que bueno verte, {workspace.organizationName}
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
            Vision ejecutiva de citas, pacientes y actividad clinica en tiempo real.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <AppointmentModal pets={petOptions} veterinarians={veterinarianOptions} />
          <Link href="/pets">
            <Button type="button" variant="secondary" className="hover:bg-primary hover:text-primary-foreground">
              <CalendarPlus className="h-4 w-4" />
              Nueva Consulta
            </Button>
          </Link>
          <ClientFormModal />
        </div>
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="p-5 transition hover:-translate-y-0.5 hover:border-sky-200/25">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-muted-foreground">Total de clientes</span>
            <Users className="h-5 w-5 text-muted-foreground" />
          </div>
          <p className="mt-4 text-3xl font-bold">{totalClients}</p>
        </Card>
        <Card className="p-5 transition hover:-translate-y-0.5 hover:border-sky-200/25">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-muted-foreground">Total de mascotas</span>
            <PawPrint className="h-5 w-5 text-muted-foreground" />
          </div>
          <p className="mt-4 text-3xl font-bold">{totalPets}</p>
        </Card>
        <Card className="p-5 transition hover:-translate-y-0.5 hover:border-sky-200/25">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-muted-foreground">Citas de hoy</span>
            <CalendarDays className="h-5 w-5 text-muted-foreground" />
          </div>
          <p className="mt-4 text-3xl font-bold">{todaysAppointments.length}</p>
        </Card>
        <Card className="p-5 transition hover:-translate-y-0.5 hover:border-sky-200/25">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-muted-foreground">Solicitudes pendientes</span>
            <Inbox className="h-5 w-5 text-muted-foreground" />
          </div>
          <p className="mt-4 text-3xl font-bold">{pendingRequests.length}</p>
        </Card>
        <Card className="p-5 transition hover:-translate-y-0.5 hover:border-sky-200/25">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-muted-foreground">Equipo activo</span>
            <UserRoundCheck className="h-5 w-5 text-muted-foreground" />
          </div>
          <p className="mt-4 text-3xl font-bold">{activeTeam.length}</p>
        </Card>
      </div>
      <section className="mt-6">
        <Card className="p-5">
          <h2 className="text-lg font-bold text-foreground">Solicitudes pendientes</h2>
          <div className="mt-4 grid gap-3">
            {pendingRequests.length ? (
              pendingRequests.map((request) => (
                <Link
                  key={request.id}
                  href="/appointments"
                  className="rounded-lg border border-border bg-white p-4 transition hover:-translate-y-0.5 hover:border-sky-200/30 hover:bg-[#edf8ff]"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-foreground">{request.service}</p>
                      <p className="text-sm text-muted-foreground">
                        {request.pet.name} - {request.client.name}
                      </p>
                    </div>
                    <span className="rounded-full border border-amber-300/20 bg-amber-300/10 px-2 py-1 text-xs font-bold text-amber-100">
                      pendiente
                    </span>
                  </div>
                  <p className="mt-2 text-sm font-semibold text-foreground">{formatDateTime(request.requestedStart)}</p>
                </Link>
              ))
            ) : (
              <EmptyState
                title="Sin solicitudes por aprobar"
                description="Las solicitudes del portal cliente apareceran aqui antes de convertirse en citas oficiales."
              />
            )}
          </div>
        </Card>
      </section>
      <section className="mt-4 grid gap-4 lg:grid-cols-[1fr_360px]">
        <Card className="p-5">
          <h2 className="text-lg font-bold text-foreground">Consultas recientes</h2>
          <div className="mt-4 grid gap-3">
            {recentConsultations.length ? (
              recentConsultations.map((consultation) => (
                <Link
                  href={`/pets/${consultation.medicalRecord.pet.id}`}
                  key={consultation.id}
                  className="rounded-lg border border-border bg-white p-4 transition hover:-translate-y-0.5 hover:border-sky-200/30 hover:bg-[#edf8ff]"
                >
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="font-semibold text-foreground">{consultation.medicalRecord.pet.name}</p>
                      <p className="text-sm text-muted-foreground">{consultation.medicalRecord.pet.client.name}</p>
                    </div>
                    <span className="text-sm text-muted-foreground">{formatDate(consultation.date)}</span>
                  </div>
                </Link>
              ))
            ) : (
              <EmptyState
                title="Aun no hay consultas"
                description="Abre el perfil de una mascota y comienza una nota clinica rapida cuando llegue el proximo paciente."
              />
            )}
          </div>
        </Card>
        <Card className="p-5">
          <h2 className="flex items-center gap-2 text-lg font-bold text-foreground">
            <Clock3 className="h-5 w-5" />
            Proximas citas
          </h2>
          <div className="mt-4 grid gap-3">
            {upcomingAppointments.length ? (
              upcomingAppointments.map((appointment) => (
                <Link
                  key={appointment.id}
                  href="/appointments"
                  className="rounded-lg border border-border bg-white p-4 transition hover:-translate-y-0.5 hover:border-sky-200/30 hover:bg-[#edf8ff]"
                >
                  <p className="font-semibold text-foreground">{appointment.pet.name}</p>
                  <p className="text-sm text-muted-foreground">{appointment.pet.client.name}</p>
                  <p className="mt-2 text-sm font-semibold text-foreground">{formatDateTime(appointment.startDate)}</p>
                </Link>
              ))
            ) : (
              <EmptyState
                title="Agenda despejada"
                description="Crea una cita rapida para mantener visible el flujo de la clinica."
                action={<AppointmentModal pets={petOptions} veterinarians={veterinarianOptions} />}
              />
            )}
          </div>
        </Card>
      </section>
      <section className="mt-4 grid gap-4 lg:grid-cols-[1fr_360px]">
        <Card className="p-5">
          <h2 className="text-lg font-bold text-foreground">Citas de hoy</h2>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {todaysAppointments.length ? (
              todaysAppointments.map((appointment) => (
                <Link key={appointment.id} href="/appointments" className="rounded-lg border border-border bg-white p-4 transition hover:-translate-y-0.5 hover:border-sky-200/30 hover:bg-[#edf8ff]">
                  <p className="font-semibold text-foreground">{appointment.title}</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {appointment.pet.name} - {appointment.pet.client.name}
                  </p>
                  <p className="mt-2 text-sm font-semibold text-foreground">{formatDateTime(appointment.startDate)}</p>
                </Link>
              ))
            ) : (
              <EmptyState title="Sin citas hoy" description="La agenda del dia aparecera aqui cuando programes pacientes." />
            )}
          </div>
        </Card>
        <Card className="p-5">
          <h2 className="text-lg font-bold text-foreground">Ingreso rapido</h2>
          <p className="mt-1 text-sm text-muted-foreground">Agrega un paciente despues de crear o seleccionar un propietario.</p>
          <div className="mt-4 grid gap-3">
            <ClientFormModal
              trigger={
                <Button type="button" variant="secondary" className="w-full">
                  <Plus className="h-4 w-4" />
                  Agregar Cliente
                </Button>
              }
            />
            <PetFormModal clients={clients} />
          </div>
        </Card>
      </section>
    </AppShell>
  );
}
