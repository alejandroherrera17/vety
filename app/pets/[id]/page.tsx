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
      <div className="mb-6 flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm lg:flex-row lg:items-center lg:justify-between">
        <div className="flex gap-4">
          <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-2xl bg-emerald-50">
            {pet.photoUrl ? (
              <Image src={pet.photoUrl} alt={pet.name} fill className="object-cover" />
            ) : (
              <div className="grid h-full place-items-center text-2xl font-bold text-emerald-700">
                {initials(pet.name)}
              </div>
            )}
          </div>
          <div>
            <p className="text-sm font-semibold text-emerald-700">{pet.species}</p>
            <h1 className="text-3xl font-bold tracking-tight">{pet.name}</h1>
            <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-slate-500">
              <span>{pet.breed ?? "No breed"}</span>
              <span>{pet.sex}</span>
              <span>{pet.weight ? `${pet.weight} kg` : "No weight"}</span>
              <span>Born {formatDate(pet.birthDate)}</span>
            </div>
            <p className="mt-2 flex items-center gap-2 text-sm font-medium text-slate-700">
              <UserRound className="h-4 w-4 text-emerald-600" />
              {pet.client.name}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-3">
          <a href={`/api/pets/${pet.id}/history-pdf`} target="_blank">
            <Button type="button" variant="secondary">
              <Download className="h-4 w-4" />
              Export PDF
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
              <Button type="button" variant="secondary">
                <Pencil className="h-4 w-4" />
                Edit
              </Button>
            }
          />
          <ConfirmButton id={pet.id} action={deletePet} label="Delete" />
        </div>
      </div>
      <Tabs
        tabs={[
          {
            id: "overview",
            label: "Overview",
            content: (
              <div className="grid gap-4 md:grid-cols-3">
                <Card>
                  <p className="text-sm font-medium text-slate-500">Owner phone</p>
                  <p className="mt-2 text-lg font-semibold">{pet.client.phone}</p>
                </Card>
                <Card>
                  <p className="text-sm font-medium text-slate-500">Consultations</p>
                  <p className="mt-2 text-lg font-semibold">{consultations.length}</p>
                </Card>
                <Card>
                  <p className="text-sm font-medium text-slate-500">Vaccinations</p>
                  <p className="mt-2 text-lg font-semibold">{pet.vaccinations.length}</p>
                </Card>
              </div>
            ),
          },
          {
            id: "consultations",
            label: "Consultations",
            content: (
              <div className="grid gap-5 lg:grid-cols-[1fr_420px]">
                <Card>
                  <h2 className="text-lg font-bold">History</h2>
                  <div className="mt-4 grid gap-3">
                    {consultations.length ? (
                      consultations.map((consultation) => (
                        <div key={consultation.id} className="rounded-2xl border border-slate-100 p-4">
                          <div className="mb-3 flex items-center justify-between">
                            <p className="font-semibold">{formatDate(consultation.date)}</p>
                            <FileText className="h-4 w-4 text-slate-400" />
                          </div>
                          <p className="text-sm text-slate-500">Symptoms</p>
                          <p className="mb-3 text-sm">{consultation.symptoms}</p>
                          <p className="text-sm text-slate-500">Diagnosis</p>
                          <p className="mb-3 text-sm">{consultation.diagnosis}</p>
                          <p className="text-sm text-slate-500">Treatment</p>
                          <p className="text-sm">{consultation.treatment}</p>
                        </div>
                      ))
                    ) : (
                      <EmptyState
                        title="No consultations"
                        description="Use the fast note form to create the first medical record entry."
                      />
                    )}
                  </div>
                </Card>
                <Card>
                  <h2 className="text-lg font-bold">New consultation</h2>
                  <p className="mb-4 mt-1 text-sm text-slate-500">Large fields, autofocus, one save.</p>
                  <ConsultationForm petId={pet.id} />
                </Card>
              </div>
            ),
          },
          {
            id: "vaccination",
            label: "Vaccination",
            content: (
              <Card>
                <VaccinationForm petId={pet.id} />
                <div className="mt-5 grid gap-3">
                  {pet.vaccinations.map((vaccination) => (
                    <div
                      key={vaccination.id}
                      className="flex flex-col justify-between gap-2 rounded-2xl border border-slate-100 p-4 sm:flex-row sm:items-center"
                    >
                      <div>
                        <p className="font-semibold">{vaccination.vaccine}</p>
                        <p className="text-sm text-slate-500">{formatDate(vaccination.date)}</p>
                      </div>
                      <span className="inline-flex items-center gap-2 rounded-full bg-sky-50 px-3 py-1 text-sm font-medium text-sky-700">
                        <Syringe className="h-4 w-4" />
                        Next: {formatDate(vaccination.nextDose)}
                      </span>
                    </div>
                  ))}
                </div>
              </Card>
            ),
          },
          {
            id: "files",
            label: "Files",
            content: (
              <Card>
                <h2 className="text-lg font-bold">Files</h2>
                <p className="mt-1 text-sm text-slate-500">Upload endpoint is ready for records and images.</p>
                <form action="/api/uploads" method="post" encType="multipart/form-data" className="mt-4 grid gap-3 sm:grid-cols-[1fr_auto]">
                  <input type="hidden" name="petId" value={pet.id} />
                  <input className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm" type="file" name="file" />
                  <Button type="submit" variant="secondary">Upload</Button>
                </form>
                <div className="mt-5 grid gap-3">
                  {pet.attachments.length ? (
                    pet.attachments.map((file) => (
                    <a
                      key={file.id}
                      href={file.fileUrl}
                      download
                      className="rounded-2xl border border-slate-100 p-4 text-sm font-medium hover:bg-slate-50"
                    >
                      {file.type} - {file.fileUrl}
                    </a>
                    ))
                  ) : (
                    <EmptyState title="No files" description="Upload lab results, images, or signed documents." />
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
