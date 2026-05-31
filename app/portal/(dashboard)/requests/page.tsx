import Link from "next/link";
import { getServerSession } from "next-auth";
import { AlertCircle, Building2, Calendar, CheckCircle2, Clock, PawPrint, XCircle } from "lucide-react";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { formatDateTime } from "@/lib/utils";

function getStatusBadge(status: string) {
  switch (status) {
    case "pending":
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-medium text-amber-700">
          <Clock className="h-3.5 w-3.5" /> Pendiente
        </span>
      );
    case "approved":
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-xs font-medium text-[#27ADF5]">
          <CheckCircle2 className="h-3.5 w-3.5" /> Aprobada
        </span>
      );
    case "rejected":
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full border border-red-200 bg-red-50 px-3 py-1 text-xs font-medium text-[#F52727]">
          <XCircle className="h-3.5 w-3.5" /> Rechazada
        </span>
      );
    case "rescheduled":
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-medium text-[#27ADF5]">
          <AlertCircle className="h-3.5 w-3.5" /> Reprogramada
        </span>
      );
    default:
      return <span className="inline-flex rounded-full border border-border bg-secondary px-3 py-1 text-xs font-medium text-muted-foreground">{status}</span>;
  }
}

export default async function PortalRequestsPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) return null;

  const requests = await prisma.appointmentRequest.findMany({
    where: { clientId: session.user.id },
    include: {
      pet: { select: { name: true, species: true } },
      organization: { select: { name: true, city: true } },
      requestedVeterinarian: { select: { name: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="mx-auto max-w-7xl space-y-8 p-6 md:p-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Mis solicitudes de citas</h1>
        <p className="mt-1 text-muted-foreground">Sigue el estado de las citas que has solicitado en las clinicas veterinarias.</p>
      </div>

      {requests.length === 0 ? (
        <div className="rounded-xl border border-border bg-white p-12 text-center shadow-sm">
          <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-sky-50">
            <Calendar className="h-8 w-8 text-[#27ADF5]" />
          </div>
          <h3 className="mb-2 text-xl font-semibold text-foreground">No tienes solicitudes pendientes</h3>
          <p className="mx-auto mb-6 max-w-sm text-muted-foreground">
            Busca una clinica en tu ciudad y solicita una cita para tu mascota.
          </p>
          <Link href="/portal/clinics">
            <Button className="bg-[#27ADF5] text-white hover:bg-[#149fe8]">
              <Building2 className="mr-2 h-4 w-4" />
              Explorar clinicas
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid gap-4">
          {requests.map((request) => (
            <div key={request.id} className="rounded-xl border border-border bg-white p-5 shadow-sm transition-shadow hover:shadow-md md:p-6">
              <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-center">
                <div>
                  <h3 className="flex items-center text-lg font-bold text-foreground">
                    {request.service}
                    <span className="ml-3 hidden h-1 w-1 rounded-full bg-border sm:inline-block" />
                    <span className="mt-1 ml-0 flex items-center font-medium text-[#27ADF5] sm:ml-3 sm:mt-0">
                      <PawPrint className="mr-1.5 h-4 w-4" />
                      {request.pet.name}
                    </span>
                  </h3>
                  <div className="mt-1.5 flex items-center text-sm text-muted-foreground">
                    <Building2 className="mr-1.5 h-4 w-4" />
                    {request.organization.name}
                    {request.organization.city ? ` (${request.organization.city})` : ""}
                  </div>
                </div>
                <div className="self-start md:self-auto">{getStatusBadge(request.status)}</div>
              </div>

              <div className="grid gap-6 rounded-lg border border-border bg-secondary p-4 md:grid-cols-2">
                <div className="space-y-4">
                  <div>
                    <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Fecha solicitada</p>
                    <p className="flex items-center font-medium text-foreground">
                      <Calendar className="mr-2 h-4 w-4 text-[#27ADF5]" />
                      {formatDateTime(request.requestedStart.toISOString())}
                    </p>
                  </div>

                  {request.requestedVeterinarian ? (
                    <div>
                      <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Veterinario solicitado</p>
                      <p className="font-medium text-foreground">Dr/a. {request.requestedVeterinarian.name}</p>
                    </div>
                  ) : null}

                  {request.reason ? (
                    <div>
                      <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Motivo</p>
                      <p className="text-sm leading-6 text-foreground">{request.reason}</p>
                    </div>
                  ) : null}
                </div>

                <div className="space-y-4 md:border-l md:border-border md:pl-6">
                  {request.proposedStart ? (
                    <div>
                      <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-[#27ADF5]">Fecha confirmada o propuesta</p>
                      <p className="flex items-center font-medium text-[#27ADF5]">
                        <Clock className="mr-2 h-4 w-4" />
                        {formatDateTime(request.proposedStart.toISOString())}
                      </p>
                    </div>
                  ) : null}

                  {request.reviewNote ? (
                    <div>
                      <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Nota de la clinica</p>
                      <div className="rounded border border-border bg-white p-3 text-sm italic text-foreground">
                        "{request.reviewNote}"
                      </div>
                    </div>
                  ) : null}

                  {!request.proposedStart && !request.reviewNote ? (
                    <div className="flex h-full items-center justify-center text-sm italic text-muted-foreground">
                      La clinica revisara tu solicitud pronto.
                    </div>
                  ) : null}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
