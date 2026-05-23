"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireWorkspace } from "@/lib/session";
import { consultationSchema, vaccinationSchema } from "@/lib/validations";
import type { ActionResult } from "@/actions/clients";

async function assertPetOwnership(petId: string, organizationId: string) {
  return prisma.pet.findFirst({
    where: {
      id: petId,
      organizationId,
    },
    select: { id: true },
  });
}

export async function createConsultation(input: unknown): Promise<ActionResult> {
  const workspace = await requireWorkspace();
  const parsed = consultationSchema.safeParse(input);

  if (!parsed.success) {
    return { ok: false, fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const pet = await assertPetOwnership(parsed.data.petId, workspace.organizationId);
  if (!pet) {
    return { ok: false, error: "Mascota no encontrada" };
  }

  const medicalRecord =
    (await prisma.medicalRecord.findFirst({
      where: {
        petId: pet.id,
        organizationId: workspace.organizationId,
      },
      select: { id: true },
    })) ??
    (await prisma.medicalRecord.create({
      data: {
        organizationId: workspace.organizationId,
        petId: pet.id,
        veterinarianId: workspace.veterinarianId,
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
  const workspace = await requireWorkspace();
  const pet = await prisma.pet.findFirst({
    where: {
      id: petId,
      organizationId: workspace.organizationId,
    },
    include: {
      client: true,
      vaccinations: { orderBy: { date: "desc" } },
      attachments: true,
      medicalRecords: {
        where: { organizationId: workspace.organizationId },
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
  const workspace = await requireWorkspace();
  const parsed = vaccinationSchema.safeParse(input);

  if (!parsed.success) {
    return { ok: false, fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const pet = await assertPetOwnership(parsed.data.petId, workspace.organizationId);
  if (!pet) {
    return { ok: false, error: "Mascota no encontrada" };
  }

  await prisma.vaccination.create({
    data: {
      petId: pet.id,
      organizationId: workspace.organizationId,
      vaccine: parsed.data.vaccine,
      date: new Date(parsed.data.date),
      nextDose: parsed.data.nextDose ? new Date(parsed.data.nextDose) : undefined,
      lot: parsed.data.lot,
      manufacturer: parsed.data.manufacturer,
      expiresAt: parsed.data.expiresAt ? new Date(parsed.data.expiresAt) : undefined,
      veterinarianName: parsed.data.veterinarianName ?? workspace.name,
      status: parsed.data.status,
      notes: parsed.data.notes,
    },
  });

  revalidatePath(`/pets/${pet.id}`);
  return { ok: true };
}
