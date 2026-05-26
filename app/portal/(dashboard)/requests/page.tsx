import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Calendar, Clock, CheckCircle2, XCircle, AlertCircle, Building2, PawPrint } from "lucide-react";
import { formatDateTime } from "@/lib/utils";
import Link from "next/link";
import { Button } from "@/components/ui/button";

function getStatusBadge(status: string) {
  switch (status) {
    case "pending":
      return <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-500/20"><Clock className="h-3.5 w-3.5" /> Pendiente</span>;
    case "approved":
      return <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-sky-50 dark:bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-200 dark:border-sky-500/20"><CheckCircle2 className="h-3.5 w-3.5" /> Aprobada</span>;
    case "rejected":
      return <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-500/20"><XCircle className="h-3.5 w-3.5" /> Rechazada</span>;
    case "rescheduled":
      return <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-500/20"><AlertCircle className="h-3.5 w-3.5" /> Reprogramada</span>;
    default:
      return <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">{status}</span>;
  }
}

export default async function PortalRequestsPage() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.id) {
    return null;
  }

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
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-foreground">Mis Solicitudes de Citas</h1>
        <p className="text-slate-500 mt-1">Sigue el estado de las citas que has solicitado en las clínicas veterinarias.</p>
      </div>

      {requests.length === 0 ? (
        <div className="bg-white dark:bg-surface border border-slate-200 dark:border-border rounded-xl p-12 text-center shadow-sm">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-sky-100 dark:bg-sky-500/10 mb-4">
            <Calendar className="h-8 w-8 text-sky-600 dark:text-sky-400" />
          </div>
          <h3 className="text-xl font-semibold text-slate-900 dark:text-foreground mb-2">No tienes solicitudes pendientes</h3>
          <p className="text-slate-500 max-w-sm mx-auto mb-6">
            Busca una clínica en tu ciudad y solicita una cita para tu mascota.
          </p>
          <Link href="/portal/clinics">
            <Button className="bg-sky-600 hover:bg-sky-700 text-foreground">
              <Building2 className="h-4 w-4 mr-2" />
              Explorar Clínicas
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid gap-4">
          {requests.map((request) => (
            <div key={request.id} className="bg-white dark:bg-surface border border-slate-200 dark:border-border rounded-xl p-5 md:p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-foreground flex items-center">
                    {request.service}
                    <span className="ml-3 hidden sm:inline-block h-1 w-1 rounded-full bg-slate-300 dark:bg-slate-700"></span>
                    <span className="sm:ml-3 text-sky-600 dark:text-sky-400 font-medium flex items-center mt-1 sm:mt-0">
                      <PawPrint className="h-4 w-4 mr-1.5" />
                      {request.pet.name}
                    </span>
                  </h3>
                  <div className="flex items-center text-sm text-slate-500 mt-1.5">
                    <Building2 className="h-4 w-4 mr-1.5 text-slate-400" />
                    {request.organization.name}
                    {request.organization.city && ` (${request.organization.city})`}
                  </div>
                </div>
                <div className="self-start md:self-auto">
                  {getStatusBadge(request.status)}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50 dark:bg-surface-hover rounded-lg p-4 border border-slate-100 dark:border-border">
                <div className="space-y-4">
                  <div>
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Fecha Solicitada</p>
                    <p className="font-medium text-slate-900 dark:text-foreground flex items-center">
                      <Calendar className="h-4 w-4 mr-2 text-slate-400" />
                      {formatDateTime(request.requestedStart.toISOString())}
                    </p>
                  </div>
                  
                  {request.requestedVeterinarian && (
                    <div>
                      <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Veterinario Solicitado</p>
                      <p className="font-medium text-slate-900 dark:text-foreground">Dr/a. {request.requestedVeterinarian.name}</p>
                    </div>
                  )}

                  {request.reason && (
                    <div>
                      <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Motivo</p>
                      <p className="text-sm text-slate-700 dark:text-slate-300">{request.reason}</p>
                    </div>
                  )}
                </div>

                <div className="space-y-4 md:border-l md:border-slate-200 dark:border-slate-800 md:pl-6">
                  {request.proposedStart && (
                    <div>
                      <p className="text-xs font-semibold text-sky-600 dark:text-sky-400 uppercase tracking-wider mb-1">Fecha Confirmada/Propuesta</p>
                      <p className="font-medium text-sky-700 dark:text-[#27ADF5] flex items-center">
                        <Clock className="h-4 w-4 mr-2 text-sky-500" />
                        {formatDateTime(request.proposedStart.toISOString())}
                      </p>
                    </div>
                  )}
                  
                  {request.reviewNote && (
                    <div>
                      <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Nota de la clínica</p>
                      <div className="bg-white dark:bg-surface border border-slate-200 dark:border-border rounded p-3 text-sm text-slate-700 dark:text-slate-300 italic">
                        "{request.reviewNote}"
                      </div>
                    </div>
                  )}

                  {!request.proposedStart && !request.reviewNote && (
                    <div className="flex h-full items-center justify-center text-sm text-slate-400 italic">
                      La clínica revisará tu solicitud pronto.
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
