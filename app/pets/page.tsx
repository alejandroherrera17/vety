import Image from "next/image";
import Link from "next/link";
import { PawPrint } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { ClientFormModal } from "@/components/client-form-modal";
import { PetFormModal } from "@/components/pet-form-modal";
import { Button } from "@/components/ui/button";
import { Card, EmptyState } from "@/components/ui/card";
import { prisma } from "@/lib/prisma";
import { requirePremiumWorkspace } from "@/lib/session";
import { initials } from "@/lib/utils";

export default async function PetsPage() {
  const workspace = await requirePremiumWorkspace();
  const [pets, clients] = await Promise.all([
    prisma.pet.findMany({
      where: { organizationId: workspace.organizationId },
      include: { client: true },
      orderBy: { name: "asc" },
    }),
    prisma.client.findMany({
      where: { organizationId: workspace.organizationId },
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
  ]);

  return (
    <AppShell>
      <div className="mb-6 rounded-lg border border-border bg-white p-5 shadow-2xl shadow-black/10 backdrop-blur-xl sm:p-6">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <p className="text-sm font-semibold text-[#27ADF5]">Pacientes</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight">Mascotas</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
            Expedientes, propietarios y datos clinicos listos para accion.
          </p>
        </div>
        <div className="flex gap-3">
          <ClientFormModal trigger={<Button type="button" variant="secondary">Agregar Cliente</Button>} />
          <PetFormModal clients={clients} />
        </div>
        </div>
      </div>
      {pets.length === 0 ? (
        <EmptyState
          title="Aún no hay mascotas"
          description="Agrega un cliente, luego registra su mascota para comenzar consultas y seguimiento de vacunaciones."
          action={<PetFormModal clients={clients} />}
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {pets.map((pet) => (
            <Link key={pet.id} href={`/pets/${pet.id}`}>
              <Card className="h-full p-4 transition hover:-translate-y-0.5 hover:border-sky-200/30 hover:shadow-lg hover:shadow-sky-950/10">
                <div className="flex gap-4">
                  <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-white/10 ring-1 ring-white/10">
                    {pet.photoUrl ? (
                      <Image src={pet.photoUrl} alt={pet.name} fill className="object-cover" />
                    ) : (
                      <div className="grid h-full place-items-center bg-sky-300/10 text-lg font-bold text-[#27ADF5]">
                        {initials(pet.name)}
                      </div>
                    )}
                  </div>
                  <div className="min-w-0">
                    <h2 className="truncate text-lg font-bold">{pet.name}</h2>
                    <p className="text-sm text-muted-foreground">{pet.species}</p>
                      <p className="mt-3 flex items-center gap-2 text-sm font-medium text-muted-foreground">
                      <PawPrint className="h-4 w-4 text-[#27ADF5]" />
                      {pet.client.name}
                    </p>
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </AppShell>
  );
}
