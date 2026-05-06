import { AppShell } from "@/components/app-shell";
import { ClientFormModal } from "@/components/client-form-modal";
import { ClientTable } from "@/components/client-table";
import { prisma } from "@/lib/prisma";
import { requireVeterinarian } from "@/lib/session";

export default async function ClientsPage() {
  const veterinarian = await requireVeterinarian();
  const clients = await prisma.client.findMany({
    where: { veterinarianId: veterinarian.id },
    include: { pets: { select: { id: true } } },
    orderBy: { name: "asc" },
  });

  return (
    <AppShell>
      <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <p className="text-sm font-semibold text-black">Propietarios</p>
          <h1 className="text-3xl font-bold tracking-tight">Clientes</h1>
        </div>
        <ClientFormModal />
      </div>
      <ClientTable clients={clients} />
    </AppShell>
  );
}
