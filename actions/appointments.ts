"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireWorkspace } from "@/lib/session";
import { createAppointmentSchema, deleteSchema, updateAppointmentSchema } from "@/lib/validations";
import { assertCan } from "@/lib/permissions";
import type { ActionResult } from "@/actions/clients";

async function assertPetOwnership(petId: string, organizationId: string) {
  return prisma.pet.findFirst({
    where: { id: petId, organizationId },
    select: { id: true, name: true, client: { select: { name: true } } },
  });
}

async function assertAssignableVeterinarian(veterinarianId: string | undefined, organizationId: string) {
  if (!veterinarianId) return null;

  return prisma.veterinarian.findFirst({
    where: {
      id: veterinarianId,
      organizationUsers: {
        some: {
          organizationId,
          status: "active",
          role: { in: ["admin", "veterinarian"] },
        },
      },
    },
    select: { id: true },
  });
}

async function hasAppointmentConflict({
  organizationId,
  assignedVeterinarianId,
  startDate,
  endDate,
  ignoreAppointmentId,
}: {
  organizationId: string;
  assignedVeterinarianId: string;
  startDate: Date;
  endDate: Date;
  ignoreAppointmentId?: string;
}) {
  const conflict = await prisma.appointment.findFirst({
    where: {
      organizationId,
      assignedVeterinarianId,
      id: ignoreAppointmentId ? { not: ignoreAppointmentId } : undefined,
      status: { notIn: ["cancelled", "no_show"] },
      startDate: { lt: endDate },
      endDate: { gt: startDate },
    },
    select: { id: true },
  });

  return Boolean(conflict);
}

export async function createAppointment(input: unknown): Promise<ActionResult> {
  const workspace = await requireWorkspace();
  assertCan(workspace.role, workspace.role === "veterinarian" ? "appointments:update_assigned" : "appointments:manage");
  const parsed = createAppointmentSchema.safeParse(input);

  if (!parsed.success) {
    return { ok: false, fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const pet = await assertPetOwnership(parsed.data.petId, workspace.organizationId);
  if (!pet) {
    return { ok: false, error: "Mascota no encontrada" };
  }

  const assignedVet = await assertAssignableVeterinarian(
    parsed.data.assignedVeterinarianId ?? workspace.veterinarianId,
    workspace.organizationId,
  );

  if (!assignedVet) {
    return { ok: false, error: "Veterinario no disponible en esta clinica" };
  }

  const startDate = new Date(parsed.data.startDate);
  const endDate = new Date(parsed.data.endDate);

  if (
    await hasAppointmentConflict({
      organizationId: workspace.organizationId,
      assignedVeterinarianId: assignedVet.id,
      startDate,
      endDate,
    })
  ) {
    return { ok: false, error: "El veterinario ya tiene una cita en ese horario" };
  }

  await prisma.appointment.create({
    data: {
      petId: pet.id,
      organizationId: workspace.organizationId,
      veterinarianId: workspace.veterinarianId,
      assignedVeterinarianId: assignedVet.id,
      title: parsed.data.title,
      notes: parsed.data.notes,
      startDate,
      endDate,
      status: parsed.data.status,
    },
  });

  revalidatePath("/appointments");
  revalidatePath("/dashboard");
  return { ok: true };
}

export async function updateAppointment(input: unknown): Promise<ActionResult> {
  const workspace = await requireWorkspace();
  assertCan(workspace.role, workspace.role === "veterinarian" ? "appointments:update_assigned" : "appointments:manage");
  const parsed = updateAppointmentSchema.safeParse(input);

  if (!parsed.success) {
    return { ok: false, fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const appointment = await prisma.appointment.findFirst({
    where: { id: parsed.data.id, organizationId: workspace.organizationId },
    select: { id: true, assignedVeterinarianId: true },
  });
  if (!appointment) {
    return { ok: false, error: "Cita no encontrada" };
  }

  const pet = await assertPetOwnership(parsed.data.petId, workspace.organizationId);
  if (!pet) {
    return { ok: false, error: "Mascota no encontrada" };
  }

  if (workspace.role === "veterinarian" && appointment.assignedVeterinarianId !== workspace.veterinarianId) {
    return { ok: false, error: "Solo puedes actualizar citas asignadas a ti" };
  }

  const assignedVet = await assertAssignableVeterinarian(
    parsed.data.assignedVeterinarianId ?? appointment.assignedVeterinarianId ?? workspace.veterinarianId,
    workspace.organizationId,
  );

  if (!assignedVet) {
    return { ok: false, error: "Veterinario no disponible en esta clinica" };
  }

  const startDate = new Date(parsed.data.startDate);
  const endDate = new Date(parsed.data.endDate);

  if (
    await hasAppointmentConflict({
      organizationId: workspace.organizationId,
      assignedVeterinarianId: assignedVet.id,
      startDate,
      endDate,
      ignoreAppointmentId: appointment.id,
    })
  ) {
    return { ok: false, error: "El veterinario ya tiene una cita en ese horario" };
  }

  await prisma.appointment.update({
    where: { id: appointment.id },
    data: {
      petId: pet.id,
      assignedVeterinarianId: assignedVet.id,
      title: parsed.data.title,
      notes: parsed.data.notes,
      startDate,
      endDate,
      status: parsed.data.status,
    },
  });

  revalidatePath("/appointments");
  revalidatePath("/dashboard");
  return { ok: true };
}

export async function deleteAppointment(input: unknown): Promise<ActionResult> {
  const workspace = await requireWorkspace();
  assertCan(workspace.role, "appointments:manage");
  const parsed = deleteSchema.safeParse(input);

  if (!parsed.success) {
    return { ok: false, error: "Cita invalida" };
  }

  const appointment = await prisma.appointment.findFirst({
    where: { id: parsed.data.id, organizationId: workspace.organizationId },
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
