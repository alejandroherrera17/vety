import { notFound } from "next/navigation";
import { getPetHistory } from "@/actions/medical";
import { AppShell } from "@/components/app-shell";
import { ClinicalRecordWorkspace, type ClinicalRecordData } from "@/components/clinical-record-workspace";
import { calculateAge } from "@/lib/clinical";

function toIso(date: Date | null | undefined) {
  return date ? date.toISOString() : null;
}

function commonSymptoms(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];
}

export default async function PetDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const pet = await getPetHistory(id);

  if (!pet) notFound();

  const consultations = pet.medicalRecords
    .flatMap((record) => record.consultations)
    .sort((a, b) => b.date.getTime() - a.date.getTime());

  const data: ClinicalRecordData = {
    pet: {
      id: pet.id,
      name: pet.name,
      species: pet.species,
      breed: pet.breed,
      sex: pet.sex,
      color: pet.color,
      birthDate: toIso(pet.birthDate),
      age: calculateAge(pet.birthDate),
      weight: pet.weight,
      photoUrl: pet.photoUrl,
      reproductiveStatus: pet.reproductiveStatus,
      microchip: pet.microchip,
      allergies: pet.allergies,
      previousDiseases: pet.previousDiseases,
      frequentMedications: pet.frequentMedications,
      generalObservations: pet.generalObservations,
    },
    owner: {
      name: pet.client.name,
      phone: pet.client.phone,
      email: pet.client.email,
      address: pet.client.address,
      city: pet.client.city,
      document: pet.client.document,
      emergencyContact: pet.client.emergencyContact,
    },
    consultations: consultations.map((consultation) => ({
      id: consultation.id,
      date: consultation.date.toISOString(),
      reason: consultation.reason,
      anamnesis: consultation.anamnesis,
      symptoms: consultation.symptoms,
      commonSymptoms: commonSymptoms(consultation.commonSymptoms),
      temperature: consultation.temperature,
      heartRate: consultation.heartRate,
      respiratoryRate: consultation.respiratoryRate,
      weight: consultation.weight,
      physicalExam: consultation.physicalExam,
      presumptiveDiagnosis: consultation.presumptiveDiagnosis,
      diagnosis: consultation.diagnosis,
      definitiveDiagnosis: consultation.definitiveDiagnosis,
      treatment: consultation.treatment,
      recommendations: consultation.recommendations,
      evolution: consultation.evolution,
      observations: consultation.observations,
      status: consultation.status,
      prescriptions: consultation.prescriptions.map((prescription) => ({
        id: prescription.id,
        medication: prescription.medication,
        dosage: prescription.dosage,
        frequency: prescription.frequency,
        duration: prescription.duration,
        route: prescription.route,
        observations: prescription.observations,
        instructions: prescription.instructions,
      })),
    })),
    vaccinations: pet.vaccinations.map((vaccination) => ({
      id: vaccination.id,
      vaccine: vaccination.vaccine,
      date: vaccination.date.toISOString(),
      nextDose: toIso(vaccination.nextDose),
      lot: vaccination.lot,
      manufacturer: vaccination.manufacturer,
      expiresAt: toIso(vaccination.expiresAt),
      veterinarianName: vaccination.veterinarianName,
      status: vaccination.status,
      notes: vaccination.notes,
    })),
    attachments: pet.attachments.map((attachment) => ({
      id: attachment.id,
      fileUrl: attachment.fileUrl,
      type: attachment.type,
      fileName: attachment.fileName,
      category: attachment.category,
      createdAt: attachment.createdAt.toISOString(),
    })),
    pdfUrl: `/api/pets/${pet.id}/history-pdf`,
  };

  return (
    <AppShell>
      <ClinicalRecordWorkspace data={data} />
    </AppShell>
  );
}
