"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireWorkspace } from "@/lib/session";
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
  const workspace = await requireWorkspace();
  const parsed = normalizePet(input);

  if (!parsed.success) {
    return { ok: false, fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const client = await prisma.client.findFirst({
    where: { id: parsed.data.clientId, organizationId: workspace.organizationId },
    select: { id: true },
  });

  if (!client) {
    return { ok: false, error: "Selecciona un cliente válido" };
  }

  const pet = await prisma.pet.create({
    data: {
      ...parsed.data,
      organizationId: workspace.organizationId,
    },
    select: { id: true },
  });

  revalidatePath("/pets");
  revalidatePath("/dashboard");
  return { ok: true, data: pet };
}

export async function updatePet(input: unknown): Promise<ActionResult> {
  const workspace = await requireWorkspace();
  const parsed = normalizePet(input);

  if (!parsed.success) {
    return { ok: false, fieldErrors: parsed.error.flatten().fieldErrors };
  }

  if (!parsed.data.id) {
    return { ok: false, error: "El ID de la mascota es obligatorio" };
  }

  const pet = await prisma.pet.findFirst({
    where: {
      id: parsed.data.id,
      organizationId: workspace.organizationId,
    },
    select: { id: true },
  });

  if (!pet) {
    return { ok: false, error: "Mascota no encontrada" };
  }

  const client = await prisma.client.findFirst({
    where: { id: parsed.data.clientId, organizationId: workspace.organizationId },
    select: { id: true },
  });

  if (!client) {
    return { ok: false, error: "Selecciona un cliente válido" };
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
  const workspace = await requireWorkspace();
  const parsed = deleteSchema.safeParse(input);

  if (!parsed.success) {
    return { ok: false, error: "Mascota inválida" };
  }

  const pet = await prisma.pet.findFirst({
    where: {
      id: parsed.data.id,
      organizationId: workspace.organizationId,
    },
    select: { id: true },
  });

  if (!pet) {
    return { ok: false, error: "Mascota no encontrada" };
  }

  const records = await prisma.medicalRecord.findMany({
    where: { petId: pet.id, organizationId: workspace.organizationId },
    select: { id: true },
  });
  const recordIds = records.map((record) => record.id);

  await prisma.$transaction([
    prisma.prescription.deleteMany({ where: { consultation: { medicalRecordId: { in: recordIds } } } }),
    prisma.consultation.deleteMany({ where: { medicalRecordId: { in: recordIds } } }),
    prisma.medicalRecord.deleteMany({ where: { id: { in: recordIds } } }),
    prisma.appointment.deleteMany({ where: { petId: pet.id, organizationId: workspace.organizationId } }),
    prisma.vaccination.deleteMany({ where: { petId: pet.id } }),
    prisma.attachment.deleteMany({ where: { petId: pet.id } }),
    prisma.pet.delete({ where: { id: pet.id } }),
  ]);

  revalidatePath("/pets");
  revalidatePath("/dashboard");
  return { ok: true };
}
