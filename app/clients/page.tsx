import { AppShell } from "@/components/app-shell";
import { ClientFormModal } from "@/components/client-form-modal";
import { ClientTable } from "@/components/client-table";
import { prisma } from "@/lib/prisma";
import { requireWorkspace } from "@/lib/session";

export default async function ClientsPage() {
  const workspace = await requireWorkspace();
  const clients = await prisma.client.findMany({
    where: { organizationId: workspace.organizationId },
    include: { pets: { select: { id: true } } },
    orderBy: { name: "asc" },
  });

  return (
    <AppShell>
      <div className="mb-6 rounded-lg border border-border bg-white p-5 shadow-2xl shadow-black/10 backdrop-blur-xl sm:p-6">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <p className="text-sm font-semibold text-[#147fba]">Propietarios</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight">Clientes</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
            Gestiona relaciones, datos de contacto y el historial de cada familia.
          </p>
        </div>
        <ClientFormModal />
        </div>
      </div>
      <ClientTable clients={clients} />
    </AppShell>
  );
}
