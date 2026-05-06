import Link from "next/link";
import { CalendarPlus, PawPrint, Plus, Stethoscope, Users } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { ClientFormModal } from "@/components/client-form-modal";
import { PetFormModal } from "@/components/pet-form-modal";
import { Button } from "@/components/ui/button";
import { Card, EmptyState } from "@/components/ui/card";
import { prisma } from "@/lib/prisma";
import { requireVeterinarian } from "@/lib/session";
import { formatDate } from "@/lib/utils";

export default async function DashboardPage() {
  const veterinarian = await requireVeterinarian();
  const [totalClients, totalPets, recentConsultations, clients] = await Promise.all([
    prisma.client.count({ where: { veterinarianId: veterinarian.id } }),
    prisma.pet.count({ where: { client: { veterinarianId: veterinarian.id } } }),
    prisma.consultation.findMany({
      where: { medicalRecord: { veterinarianId: veterinarian.id } },
      orderBy: { date: "desc" },
      take: 5,
      include: { medicalRecord: { include: { pet: { include: { client: true } } } } },
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
          <p className="text-sm font-semibold text-emerald-700">Today</p>
          <h1 className="text-3xl font-bold tracking-tight text-slate-950">
            Good to see you, {veterinarian.name}
          </h1>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link href="/pets">
            <Button type="button" variant="secondary">
              <CalendarPlus className="h-4 w-4" />
              New Consultation
            </Button>
          </Link>
          <ClientFormModal />
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-500">Total clients</span>
            <Users className="h-5 w-5 text-emerald-600" />
          </div>
          <p className="mt-4 text-3xl font-bold">{totalClients}</p>
        </Card>
        <Card>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-500">Total pets</span>
            <PawPrint className="h-5 w-5 text-sky-600" />
          </div>
          <p className="mt-4 text-3xl font-bold">{totalPets}</p>
        </Card>
        <Card>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-500">Recent consultations</span>
            <Stethoscope className="h-5 w-5 text-teal-600" />
          </div>
          <p className="mt-4 text-3xl font-bold">{recentConsultations.length}</p>
        </Card>
      </div>
      <section className="mt-6 grid gap-4 lg:grid-cols-[1fr_360px]">
        <Card>
          <h2 className="text-lg font-bold">Recent consultations</h2>
          <div className="mt-4 grid gap-3">
            {recentConsultations.length ? (
              recentConsultations.map((consultation) => (
                <Link
                  href={`/pets/${consultation.medicalRecord.pet.id}`}
                  key={consultation.id}
                  className="rounded-2xl border border-slate-100 p-4 hover:border-emerald-200 hover:bg-emerald-50"
                >
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="font-semibold">{consultation.medicalRecord.pet.name}</p>
                      <p className="text-sm text-slate-500">
                        {consultation.medicalRecord.pet.client.name}
                      </p>
                    </div>
                    <span className="text-sm text-slate-500">{formatDate(consultation.date)}</span>
                  </div>
                </Link>
              ))
            ) : (
              <EmptyState
                title="No consultations yet"
                description="Open a pet profile and start a fast clinical note when the next patient arrives."
              />
            )}
          </div>
        </Card>
        <Card>
          <h2 className="text-lg font-bold">Quick intake</h2>
          <p className="mt-1 text-sm text-slate-500">Add a patient after creating or selecting an owner.</p>
          <div className="mt-4 grid gap-3">
            <ClientFormModal
              trigger={
                <Button type="button" variant="secondary" className="w-full">
                  <Plus className="h-4 w-4" />
                  Add Client
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
