"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireVeterinarian } from "@/lib/session";
import { clientSchema, deleteSchema } from "@/lib/validations";

export type ActionResult<T = void> = {
  ok: boolean;
  data?: T;
  error?: string;
  fieldErrors?: Record<string, string[] | undefined>;
};

export async function createClient(input: unknown): Promise<ActionResult> {
  const veterinarian = await requireVeterinarian();
  const parsed = clientSchema.omit({ id: true }).safeParse(input);

  if (!parsed.success) {
    return { ok: false, fieldErrors: parsed.error.flatten().fieldErrors };
  }

  await prisma.client.create({
    data: {
      ...parsed.data,
      email: parsed.data.email || undefined,
      veterinarianId: veterinarian.id,
    },
  });

  revalidatePath("/clients");
  revalidatePath("/dashboard");
  return { ok: true };
}

export async function updateClient(input: unknown): Promise<ActionResult> {
  const veterinarian = await requireVeterinarian();
  const parsed = clientSchema.required({ id: true }).safeParse(input);

  if (!parsed.success) {
    return { ok: false, fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const { id, ...data } = parsed.data;
  const client = await prisma.client.findFirst({
    where: { id, veterinarianId: veterinarian.id },
    select: { id: true },
  });

  if (!client) {
    return { ok: false, error: "Cliente no encontrado" };
  }

  await prisma.client.update({
    where: { id },
    data: {
      ...data,
      email: data.email || undefined,
    },
  });

  revalidatePath("/clients");
  revalidatePath("/dashboard");
  return { ok: true };
}

export async function deleteClient(input: unknown): Promise<ActionResult> {
  const veterinarian = await requireVeterinarian();
  const parsed = deleteSchema.safeParse(input);

  if (!parsed.success) {
    return { ok: false, error: "Cliente inválido" };
  }

  const client = await prisma.client.findFirst({
    where: { id: parsed.data.id, veterinarianId: veterinarian.id },
    include: { pets: { select: { id: true } } },
  });

  if (!client) {
    return { ok: false, error: "Cliente no encontrado" };
  }

  const petIds = client.pets.map((pet) => pet.id);
  const records = await prisma.medicalRecord.findMany({
    where: { petId: { in: petIds }, veterinarianId: veterinarian.id },
    select: { id: true },
  });
  const recordIds = records.map((record) => record.id);

  await prisma.$transaction([
    prisma.consultation.deleteMany({ where: { medicalRecordId: { in: recordIds } } }),
    prisma.medicalRecord.deleteMany({ where: { id: { in: recordIds } } }),
    prisma.vaccination.deleteMany({ where: { petId: { in: petIds } } }),
    prisma.attachment.deleteMany({ where: { petId: { in: petIds } } }),
    prisma.pet.deleteMany({ where: { id: { in: petIds } } }),
    prisma.client.delete({ where: { id: client.id } }),
  ]);

  revalidatePath("/clients");
  revalidatePath("/pets");
  revalidatePath("/dashboard");
  return { ok: true };
}
