import Image from "next/image";
import Link from "next/link";
import { PawPrint } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { ClientFormModal } from "@/components/client-form-modal";
import { PetFormModal } from "@/components/pet-form-modal";
import { Button } from "@/components/ui/button";
import { Card, EmptyState } from "@/components/ui/card";
import { prisma } from "@/lib/prisma";
import { requireVeterinarian } from "@/lib/session";
import { initials } from "@/lib/utils";

export default async function PetsPage() {
  const veterinarian = await requireVeterinarian();
  const [pets, clients] = await Promise.all([
    prisma.pet.findMany({
      where: { client: { veterinarianId: veterinarian.id } },
      include: { client: true },
      orderBy: { name: "asc" },
    }),
    prisma.client.findMany({
      where: { veterinarianId: veterinarian.id },
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
  ]);

  return (
    <AppShell>
      <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <p className="text-sm font-semibold text-black">Pacientes</p>
          <h1 className="text-3xl font-bold tracking-tight">Mascotas</h1>
        </div>
        <div className="flex gap-3">
          <ClientFormModal trigger={<Button type="button" variant="secondary" className="hover:bg-black hover:text-white">Agregar Cliente</Button>} />
          <PetFormModal clients={clients} />
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
              <Card className="h-full transition hover:-translate-y-0.5 hover:border-black hover:shadow-lg hover:shadow-black/10">
                <div className="flex gap-4">
                  <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-2xl bg-black/10">
                    {pet.photoUrl ? (
                      <Image src={pet.photoUrl} alt={pet.name} fill className="object-cover" />
                    ) : (
                      <div className="grid h-full place-items-center bg-black/10 text-lg font-bold text-black">
                        {initials(pet.name)}
                      </div>
                    )}
                  </div>
                  <div className="min-w-0">
                    <h2 className="truncate text-lg font-bold">{pet.name}</h2>
                    <p className="text-sm text-black/60">{pet.species}</p>
                      <p className="mt-3 flex items-center gap-2 text-sm font-medium text-black/70">
                      <PawPrint className="h-4 w-4 text-black" />
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
