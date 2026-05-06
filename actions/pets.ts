"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireVeterinarian } from "@/lib/session";
import { deleteSchema, petSchema } from "@/lib/validations";
import type { ActionResult } from "@/actions/clients";

function normalizePet(input: unknown) {
  const parsed = petSchema.safeParse(input);
  if (!parsed.success) return parsed;

  return {
    success: true as const,
    data: {
      ...parsed.data,
      birthDate: parsed.data.birthDate ? new Date(parsed.data.birthDate) : undefined,
      weight: parsed.data.weight || undefined,
    },
  };
}

export async function createPet(input: unknown): Promise<ActionResult<{ id: string }>> {
  const veterinarian = await requireVeterinarian();
  const parsed = normalizePet(input);

  if (!parsed.success) {
    return { ok: false, fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const client = await prisma.client.findFirst({
    where: { id: parsed.data.clientId, veterinarianId: veterinarian.id },
    select: { id: true },
  });

  if (!client) {
    return { ok: false, error: "Select a valid client" };
  }

  const pet = await prisma.pet.create({
    data: parsed.data,
    select: { id: true },
  });

  revalidatePath("/pets");
  revalidatePath("/dashboard");
  return { ok: true, data: pet };
}

export async function updatePet(input: unknown): Promise<ActionResult> {
  const veterinarian = await requireVeterinarian();
  const parsed = normalizePet(input);

  if (!parsed.success) {
    return { ok: false, fieldErrors: parsed.error.flatten().fieldErrors };
  }

  if (!parsed.data.id) {
    return { ok: false, error: "Pet id is required" };
  }

  const pet = await prisma.pet.findFirst({
    where: {
      id: parsed.data.id,
      client: { veterinarianId: veterinarian.id },
    },
    select: { id: true },
  });

  if (!pet) {
    return { ok: false, error: "Pet not found" };
  }

  const client = await prisma.client.findFirst({
    where: { id: parsed.data.clientId, veterinarianId: veterinarian.id },
    select: { id: true },
  });

  if (!client) {
    return { ok: false, error: "Select a valid client" };
  }

  const { id, ...data } = parsed.data;
  await prisma.pet.update({
    where: { id },
    data,
  });

  revalidatePath("/pets");
  revalidatePath(`/pets/${id}`);
  return { ok: true };
}

export async function deletePet(input: unknown): Promise<ActionResult> {
  const veterinarian = await requireVeterinarian();
  const parsed = deleteSchema.safeParse(input);

  if (!parsed.success) {
    return { ok: false, error: "Invalid pet" };
  }

  const pet = await prisma.pet.findFirst({
    where: {
      id: parsed.data.id,
      client: { veterinarianId: veterinarian.id },
    },
    select: { id: true },
  });

  if (!pet) {
    return { ok: false, error: "Pet not found" };
  }

  const records = await prisma.medicalRecord.findMany({
    where: { petId: pet.id, veterinarianId: veterinarian.id },
    select: { id: true },
  });
  const recordIds = records.map((record) => record.id);

  await prisma.$transaction([
    prisma.consultation.deleteMany({ where: { medicalRecordId: { in: recordIds } } }),
    prisma.medicalRecord.deleteMany({ where: { id: { in: recordIds } } }),
    prisma.vaccination.deleteMany({ where: { petId: pet.id } }),
    prisma.attachment.deleteMany({ where: { petId: pet.id } }),
    prisma.pet.delete({ where: { id: pet.id } }),
  ]);

  revalidatePath("/pets");
  revalidatePath("/dashboard");
  return { ok: true };
}
