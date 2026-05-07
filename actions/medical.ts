"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireVeterinarian } from "@/lib/session";
import { consultationSchema, vaccinationSchema } from "@/lib/validations";
import type { ActionResult } from "@/actions/clients";

async function assertPetOwnership(petId: string, veterinarianId: string) {
  return prisma.pet.findFirst({
    where: {
      id: petId,
      client: { veterinarianId },
    },
    select: { id: true },
  });
}

export async function createConsultation(input: unknown): Promise<ActionResult> {
  const veterinarian = await requireVeterinarian();
  const parsed = consultationSchema.safeParse(input);

  if (!parsed.success) {
    return { ok: false, fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const pet = await assertPetOwnership(parsed.data.petId, veterinarian.id);
  if (!pet) {
    return { ok: false, error: "Mascota no encontrada" };
  }

  const medicalRecord =
    (await prisma.medicalRecord.findFirst({
      where: {
        petId: pet.id,
        veterinarianId: veterinarian.id,
      },
      select: { id: true },
    })) ??
    (await prisma.medicalRecord.create({
      data: {
        petId: pet.id,
        veterinarianId: veterinarian.id,
      },
      select: { id: true },
    }));

  await prisma.consultation.create({
    data: {
      medicalRecordId: medicalRecord.id,
      date: new Date(parsed.data.date),
      reason: parsed.data.reason,
      anamnesis: parsed.data.anamnesis,
      symptoms: parsed.data.symptoms,
      commonSymptoms: parsed.data.commonSymptoms,
      temperature: parsed.data.temperature,
      heartRate: parsed.data.heartRate,
      respiratoryRate: parsed.data.respiratoryRate,
      weight: parsed.data.weight,
      physicalExam: parsed.data.physicalExam,
      presumptiveDiagnosis: parsed.data.presumptiveDiagnosis,
      diagnosis: parsed.data.diagnosis,
      definitiveDiagnosis: parsed.data.definitiveDiagnosis,
      treatment: parsed.data.treatment,
      recommendations: parsed.data.recommendations,
      evolution: parsed.data.evolution,
      observations: parsed.data.observations,
      status: parsed.data.status,
      templateName: parsed.data.templateName,
    },
  });

  revalidatePath(`/pets/${pet.id}`);
  revalidatePath("/dashboard");
  return { ok: true };
}

export async function getPetHistory(petId: string) {
  const veterinarian = await requireVeterinarian();
  const pet = await prisma.pet.findFirst({
    where: {
      id: petId,
      client: { veterinarianId: veterinarian.id },
    },
    include: {
      client: true,
      vaccinations: { orderBy: { date: "desc" } },
      attachments: true,
      medicalRecords: {
        where: { veterinarianId: veterinarian.id },
        include: {
          consultations: {
            orderBy: { date: "desc" },
            include: { prescriptions: { orderBy: { createdAt: "desc" } } },
          },
        },
      },
    },
  });

  if (!pet) {
    return null;
  }

  return pet;
}

export async function addVaccination(input: unknown): Promise<ActionResult> {
  const veterinarian = await requireVeterinarian();
  const parsed = vaccinationSchema.safeParse(input);

  if (!parsed.success) {
    return { ok: false, fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const pet = await assertPetOwnership(parsed.data.petId, veterinarian.id);
  if (!pet) {
    return { ok: false, error: "Mascota no encontrada" };
  }

  await prisma.vaccination.create({
    data: {
      petId: pet.id,
      vaccine: parsed.data.vaccine,
      date: new Date(parsed.data.date),
      nextDose: parsed.data.nextDose ? new Date(parsed.data.nextDose) : undefined,
      lot: parsed.data.lot,
      manufacturer: parsed.data.manufacturer,
      expiresAt: parsed.data.expiresAt ? new Date(parsed.data.expiresAt) : undefined,
      veterinarianName: parsed.data.veterinarianName ?? veterinarian.name,
      status: parsed.data.status,
      notes: parsed.data.notes,
    },
  });

  revalidatePath(`/pets/${pet.id}`);
  return { ok: true };
}
