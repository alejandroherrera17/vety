"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireVeterinarian } from "@/lib/session";
import { createAppointmentSchema, deleteSchema, updateAppointmentSchema } from "@/lib/validations";
import type { ActionResult } from "@/actions/clients";

async function assertPetOwnership(petId: string, veterinarianId: string) {
  return prisma.pet.findFirst({
    where: { id: petId, client: { veterinarianId } },
    select: { id: true, name: true, client: { select: { name: true } } },
  });
}

export async function createAppointment(input: unknown): Promise<ActionResult> {
  const veterinarian = await requireVeterinarian();
  const parsed = createAppointmentSchema.safeParse(input);

  if (!parsed.success) {
    return { ok: false, fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const pet = await assertPetOwnership(parsed.data.petId, veterinarian.id);
  if (!pet) {
    return { ok: false, error: "Mascota no encontrada" };
  }

  await prisma.appointment.create({
    data: {
      petId: pet.id,
      veterinarianId: veterinarian.id,
      title: parsed.data.title,
      notes: parsed.data.notes,
      startDate: new Date(parsed.data.startDate),
      endDate: new Date(parsed.data.endDate),
      status: parsed.data.status,
    },
  });

  revalidatePath("/appointments");
  revalidatePath("/dashboard");
  return { ok: true };
}

export async function updateAppointment(input: unknown): Promise<ActionResult> {
  const veterinarian = await requireVeterinarian();
  const parsed = updateAppointmentSchema.safeParse(input);

  if (!parsed.success) {
    return { ok: false, fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const appointment = await prisma.appointment.findFirst({
    where: { id: parsed.data.id, veterinarianId: veterinarian.id },
    select: { id: true },
  });
  if (!appointment) {
    return { ok: false, error: "Cita no encontrada" };
  }

  const pet = await assertPetOwnership(parsed.data.petId, veterinarian.id);
  if (!pet) {
    return { ok: false, error: "Mascota no encontrada" };
  }

  await prisma.appointment.update({
    where: { id: appointment.id },
    data: {
      petId: pet.id,
      title: parsed.data.title,
      notes: parsed.data.notes,
      startDate: new Date(parsed.data.startDate),
      endDate: new Date(parsed.data.endDate),
      status: parsed.data.status,
    },
  });

  revalidatePath("/appointments");
  revalidatePath("/dashboard");
  return { ok: true };
}

export async function deleteAppointment(input: unknown): Promise<ActionResult> {
  const veterinarian = await requireVeterinarian();
  const parsed = deleteSchema.safeParse(input);

  if (!parsed.success) {
    return { ok: false, error: "Cita invalida" };
  }

  const appointment = await prisma.appointment.findFirst({
    where: { id: parsed.data.id, veterinarianId: veterinarian.id },
    select: { id: true },
  });
  if (!appointment) {
    return { ok: false, error: "Cita no encontrada" };
  }

  await prisma.appointment.delete({ where: { id: appointment.id } });

  revalidatePath("/appointments");
  revalidatePath("/dashboard");
  return { ok: true };
}
