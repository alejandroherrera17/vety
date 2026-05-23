import { prisma } from "@/lib/prisma";
import { requireWorkspace } from "@/lib/session";
import { AppShell } from "@/components/app-shell";
import { AppointmentRequestPanel } from "@/components/appointment-request-panel";
import { assertCan } from "@/lib/permissions";
import { Calendar, CheckCircle2 } from "lucide-react";

export default async function DashboardRequestsPage() {
  const workspace = await requireWorkspace();
  assertCan(workspace.role, "appointment_requests:approve");

  const requests = await prisma.appointmentRequest.findMany({
    where: { 
      organizationId: workspace.organizationId,
      status: "pending",
    },
    include: {
      client: { select: { name: true } },
      pet: { select: { name: true } },
      requestedVeterinarian: { select: { name: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const veterinarians = await prisma.organizationUser.findMany({
    where: {
      organizationId: workspace.organizationId,
      status: "active",
      role: { in: ["admin", "veterinarian"] },
      veterinarianId: { not: null },
    },
    include: {
      veterinarian: { select: { name: true } }
    }
  });

  const serializedRequests = requests.map(req => ({
    id: req.id,
    service: req.service,
    reason: req.reason,
    requestedStart: req.requestedStart.toISOString(),
    requestedEnd: req.requestedEnd?.toISOString() || null,
    status: req.status as "pending" | "approved" | "rejected" | "rescheduled" | "cancelled",
    clientName: req.client.name,
    petName: req.pet.name,
    requestedVeterinarianName: req.requestedVeterinarian?.name || null,
  }));

  const serializedVeterinarians = veterinarians.map(vet => ({
    id: vet.veterinarianId as string,
    name: vet.veterinarian?.name || "Sin nombre",
    role: vet.role,
  }));

  return (
    <AppShell>
    <div className="flex flex-col">
      <header className="flex shrink-0 items-center justify-between rounded-lg border border-white/10 bg-white/[0.06] px-5 py-5 shadow-2xl shadow-black/10 backdrop-blur-xl sm:px-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Bandeja de Solicitudes</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Revisa y aprueba las solicitudes de citas enviadas por los propietarios desde el portal.
          </p>
        </div>
      </header>

      <main className="mt-6 flex-1">
        <div className="mx-auto max-w-6xl space-y-6">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-lg border border-white/10 bg-card/82 p-4 shadow-xl shadow-black/10 backdrop-blur-xl">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-cyan-500/10 p-2 text-cyan-500">
                  <Calendar className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Solicitudes Pendientes</p>
                  <p className="text-2xl font-bold">{requests.length}</p>
                </div>
              </div>
            </div>
            <div className="rounded-lg border border-white/10 bg-card/82 p-4 shadow-xl shadow-black/10 backdrop-blur-xl md:col-span-2">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-emerald-500/10 p-2 text-emerald-500">
                  <CheckCircle2 className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Atender solicitudes</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Aprueba para convertirlas en citas confirmadas o rechaza si no hay disponibilidad.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-white/10 bg-card/82 shadow-xl shadow-black/10 backdrop-blur-xl">
            <div className="p-4 md:p-6">
              <AppointmentRequestPanel 
                requests={serializedRequests} 
                veterinarians={serializedVeterinarians} 
              />
            </div>
          </div>
        </div>
      </main>
    </div>
    </AppShell>
  );
}
