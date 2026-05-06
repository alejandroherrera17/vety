import Image from "next/image";
import { notFound } from "next/navigation";
import { Download, FileText, Pencil, Syringe, UserRound } from "lucide-react";
import { deletePet } from "@/actions/pets";
import { AppShell } from "@/components/app-shell";
import { ConfirmButton } from "@/components/confirm-button";
import { ConsultationForm } from "@/components/consultation-form";
import { PetFormModal } from "@/components/pet-form-modal";
import { Tabs } from "@/components/tabs";
import { VaccinationForm } from "@/components/vaccination-form";
import { Button } from "@/components/ui/button";
import { Card, EmptyState } from "@/components/ui/card";
import { getPetHistory } from "@/actions/medical";
import { prisma } from "@/lib/prisma";
import { requireVeterinarian } from "@/lib/session";
import { formatDate, initials } from "@/lib/utils";

export default async function PetDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const veterinarian = await requireVeterinarian();
  const { id } = await params;
  const [pet, clients] = await Promise.all([
    getPetHistory(id),
    prisma.client.findMany({
      where: { veterinarianId: veterinarian.id },
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
  ]);

  if (!pet) notFound();

  const consultations = pet.medicalRecords.flatMap((record) => record.consultations);

  return (
    <AppShell>
      <div className="mb-6 flex flex-col gap-4 rounded-2xl border border-black/15 bg-white p-5 shadow-md lg:flex-row lg:items-center lg:justify-between">
        <div className="flex gap-4">
          <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-2xl bg-black/10">
            {pet.photoUrl ? (
              <Image src={pet.photoUrl} alt={pet.name} fill className="object-cover" />
            ) : (
              <div className="grid h-full place-items-center text-2xl font-bold text-black">
                {initials(pet.name)}
              </div>
            )}
          </div>
          <div>
            <p className="text-sm font-semibold text-black">{pet.species}</p>
            <h1 className="text-3xl font-bold tracking-tight">{pet.name}</h1>
            <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-black/60">
              <span>{pet.breed ?? "Sin raza"}</span>
              <span>{pet.sex}</span>
              <span>{pet.weight ? `${pet.weight} kg` : "Sin peso"}</span>
              <span>Nacido {formatDate(pet.birthDate)}</span>
            </div>
            <p className="mt-2 flex items-center gap-2 text-sm font-medium text-black/70">
              <UserRound className="h-4 w-4 text-black" />
              {pet.client.name}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-3">
          <a href={`/api/pets/${pet.id}/history-pdf`} target="_blank">
            <Button type="button" variant="secondary" className="hover:bg-black hover:text-white">
              <Download className="h-4 w-4" />
              Exportar PDF
            </Button>
          </a>
          <PetFormModal
            clients={clients}
            pet={{
              id: pet.id,
              name: pet.name,
              species: pet.species,
              breed: pet.breed ?? "",
              sex: pet.sex,
              birthDate: pet.birthDate ? pet.birthDate.toISOString().slice(0, 10) : "",
              weight: pet.weight ?? undefined,
              photoUrl: pet.photoUrl ?? "",
              clientId: pet.clientId,
            }}
            trigger={
              <Button type="button" variant="secondary" className="hover:bg-black hover:text-white">
                <Pencil className="h-4 w-4" />
                Editar
              </Button>
            }
          />
          <ConfirmButton id={pet.id} action={deletePet} label="Eliminar" />
        </div>
      </div>
      <Tabs
        tabs={[
          {
            id: "overview",
            label: "Resumen",
            content: (
              <div className="grid gap-4 md:grid-cols-3">
                <Card>
                  <p className="text-sm font-medium text-black/70">Teléfono del propietario</p>
                  <p className="mt-2 text-lg font-semibold">{pet.client.phone}</p>
                </Card>
                <Card>
                  <p className="text-sm font-medium text-black/70">Consultas</p>
                  <p className="mt-2 text-lg font-semibold">{consultations.length}</p>
                </Card>
                <Card>
                  <p className="text-sm font-medium text-black/70">Vacunaciones</p>
                  <p className="mt-2 text-lg font-semibold">{pet.vaccinations.length}</p>
                </Card>
              </div>
            ),
          },
          {
            id: "consultations",
            label: "Consultas",
            content: (
              <div className="grid gap-5 lg:grid-cols-[1fr_420px]">
                <Card>
                  <h2 className="text-lg font-bold">Historial</h2>
                  <div className="mt-4 grid gap-3">
                    {consultations.length ? (
                      consultations.map((consultation) => (
                        <div key={consultation.id} className="rounded-2xl border border-black/15 p-4 hover:bg-black/5">
                          <div className="mb-3 flex items-center justify-between">
                            <p className="font-semibold text-black">{formatDate(consultation.date)}</p>
                            <FileText className="h-4 w-4 text-black/50" />
                          </div>
                          <p className="text-sm text-black/70">Síntomas</p>
                          <p className="mb-3 text-sm text-black">{consultation.symptoms}</p>
                          <p className="text-sm text-black/70">Diagnóstico</p>
                          <p className="mb-3 text-sm text-black">{consultation.diagnosis}</p>
                          <p className="text-sm text-black/70">Tratamiento</p>
                          <p className="text-sm text-black">{consultation.treatment}</p>
                        </div>
                      ))
                    ) : (
                      <EmptyState
                        title="Sin consultas"
                        description="Usa el formulario de nota rápida para crear la primera entrada de registro médico."
                      />
                    )}
                  </div>
                </Card>
                <Card>
                  <h2 className="text-lg font-bold">Nueva consulta</h2>
                  <p className="mb-4 mt-1 text-sm text-black/60">Campos grandes, enfoque automático, un guardado.</p>
                  <ConsultationForm petId={pet.id} />
                </Card>
              </div>
            ),
          },
          {
            id: "vaccination",
            label: "Vacunación",
            content: (
              <Card>
                <VaccinationForm petId={pet.id} />
                <div className="mt-5 grid gap-3">
                  {pet.vaccinations.map((vaccination) => (
                    <div key={vaccination.id} className="flex flex-col justify-between gap-2 rounded-2xl border border-black/15 p-4 hover:bg-black/5 sm:flex-row sm:items-center">
                      <div>
                        <p className="font-semibold text-black">{vaccination.vaccine}</p>
                        <p className="text-sm text-black/60">{formatDate(vaccination.date)}</p>
                      </div>
                      <span className="inline-flex items-center gap-2 rounded-full border border-black/15 bg-lemon-chiffon px-3 py-1 text-sm font-medium text-black">
                        <Syringe className="h-4 w-4" />
                        Próxima: {formatDate(vaccination.nextDose)}
                      </span>
                    </div>
                  ))}
                </div>
              </Card>
            ),
          },
          {
            id: "files",
            label: "Archivos",
            content: (
              <Card>
                <h2 className="text-lg font-bold text-black">Archivos</h2>
                <p className="mt-1 text-sm text-black/60">El endpoint de carga está listo para registros e imágenes.</p>
                <form action="/api/uploads" method="post" encType="multipart/form-data" className="mt-4 grid gap-3 sm:grid-cols-[1fr_auto]">
                  <input type="hidden" name="petId" value={pet.id} />
                  <input className="rounded-xl border border-black/15 bg-white px-3 py-2 text-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black/20" type="file" name="file" />
                  <Button type="submit" variant="secondary" className="hover:bg-black hover:text-white">Subir</Button>
                </form>
                <div className="mt-5 grid gap-3">
                  {pet.attachments.length ? (
                    pet.attachments.map((file) => (
                    <a
                      key={file.id}
                      href={file.fileUrl}
                      download
                      className="rounded-2xl border border-black/15 p-4 text-sm font-medium hover:bg-black/5 text-black"
                    >
                      {file.type} - {file.fileUrl}
                    </a>
                    ))
                  ) : (
                    <EmptyState title="Sin archivos" description="Sube resultados de laboratorio, imágenes o documentos firmados." />
                  )}
                </div>
              </Card>
            ),
          },
        ]}
      />
    </AppShell>
  );
}
