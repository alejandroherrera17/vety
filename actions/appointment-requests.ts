"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { assertCan } from "@/lib/permissions";
import { requireWorkspace } from "@/lib/session";
import {
  appointmentRequestDecisionSchema,
  portalAppointmentRequestSchema,
  portalPetLookupSchema,
} from "@/lib/validations";
import type { ActionResult } from "@/actions/clients";

function normalizeDocument(value: string) {
  return value.trim();
}

function defaultRequestEnd(start: Date) {
  const end = new Date(start);
  end.setMinutes(end.getMinutes() + 30);
  return end;
}

async function findRequestForWorkspace(id: string, organizationId: string) {
  return prisma.appointmentRequest.findFirst({
    where: { id, organizationId },
    include: {
      client: true,
      pet: true,
      requestedVeterinarian: true,
      assignedVeterinarian: true,
    },
  });
}

export async function createPortalAppointmentRequest(input: unknown): Promise<ActionResult> {
  const parsed = portalAppointmentRequestSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const client = await prisma.client.findFirst({
    where: {
      organizationId: parsed.data.organizationId,
      document: normalizeDocument(parsed.data.clientDocument),
    },
    select: { id: true },
  });

  if (!client) {
    return { ok: false, error: "No encontramos un cliente con ese documento en la clinica seleccionada" };
  }

  const pet = await prisma.pet.findFirst({
    where: {
      id: parsed.data.petId,
      clientId: client.id,
      organizationId: parsed.data.organizationId,
    },
    select: { id: true },
  });

  if (!pet) {
    return { ok: false, error: "La mascota no pertenece al propietario en esta clinica" };
  }

  if (parsed.data.requestedVeterinarianId) {
    const veterinarian = await prisma.veterinarian.findFirst({
      where: {
        id: parsed.data.requestedVeterinarianId,
        organizationUsers: {
          some: {
            organizationId: parsed.data.organizationId,
            status: "active",
            role: { in: ["admin", "veterinarian"] },
          },
        },
      },
      select: { id: true },
    });

    if (!veterinarian) {
      return { ok: false, error: "El veterinario seleccionado no esta disponible en esta clinica" };
    }
  }

  const requestedStart = new Date(parsed.data.requestedStart);

  await prisma.appointmentRequest.create({
    data: {
      organizationId: parsed.data.organizationId,
      clientId: client.id,
      petId: pet.id,
      requestedVeterinarianId: parsed.data.requestedVeterinarianId,
      service: parsed.data.service,
      reason: parsed.data.reason,
      requestedStart,
      requestedEnd: parsed.data.requestedEnd
        ? new Date(parsed.data.requestedEnd)
        : defaultRequestEnd(requestedStart),
      status: "pending",
    },
  });

  revalidatePath("/appointments");
  revalidatePath("/dashboard");
  return { ok: true };
}

export async function lookupRequestPets(input: unknown): Promise<ActionResult<{ pets: { id: string; name: string }[] }>> {
  const parsed = portalPetLookupSchema.safeParse(input);

  if (!parsed.success) {
    return { ok: false, fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const client = await prisma.client.findFirst({
    where: {
      organizationId: parsed.data.organizationId,
      document: normalizeDocument(parsed.data.clientDocument),
    },
    select: {
      pets: {
        orderBy: { name: "asc" },
        select: { id: true, name: true },
      },
    },
  });

  return { ok: true, data: { pets: client?.pets ?? [] } };
}

export async function approveAppointmentRequest(input: unknown): Promise<ActionResult> {
  const workspace = await requireWorkspace();
  assertCan(workspace.role, "appointment_requests:approve");

  const parsed = appointmentRequestDecisionSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const request = await findRequestForWorkspace(parsed.data.id, workspace.organizationId);
  if (!request) {
    return { ok: false, error: "Solicitud no encontrada" };
  }

  const assignedVeterinarianId =
    parsed.data.assignedVeterinarianId ??
    request.requestedVeterinarianId ??
    workspace.veterinarianId;

  const assignedVet = await prisma.veterinarian.findFirst({
    where: {
      id: assignedVeterinarianId,
      organizationUsers: {
        some: {
          organizationId: workspace.organizationId,
          status: "active",
          role: { in: ["admin", "veterinarian"] },
        },
      },
    },
    select: { id: true },
  });

  if (!assignedVet) {
    return { ok: false, error: "Selecciona un veterinario activo" };
  }

  const startDate = parsed.data.proposedStart
    ? new Date(parsed.data.proposedStart)
    : request.proposedStart ?? request.requestedStart;
  const endDate = parsed.data.proposedEnd
    ? new Date(parsed.data.proposedEnd)
    : request.proposedEnd ?? request.requestedEnd ?? defaultRequestEnd(startDate);

  const conflict = await prisma.appointment.findFirst({
    where: {
      organizationId: workspace.organizationId,
      assignedVeterinarianId: assignedVet.id,
      status: { notIn: ["cancelled", "no_show"] },
      startDate: { lt: endDate },
      endDate: { gt: startDate },
    },
    select: { id: true },
  });

  if (conflict) {
    return { ok: false, error: "El veterinario ya tiene una cita en ese horario" };
  }

  await prisma.$transaction(async (tx) => {
    const appointment = await tx.appointment.create({
      data: {
        organizationId: workspace.organizationId,
        petId: request.petId,
        veterinarianId: workspace.veterinarianId,
        assignedVeterinarianId: assignedVet.id,
        title: request.service,
        notes: request.reason,
        startDate,
        endDate,
        status: "confirmed",
      },
      select: { id: true },
    });

    await tx.appointmentRequest.update({
      where: { id: request.id },
      data: {
        appointmentId: appointment.id,
        assignedVeterinarianId: assignedVet.id,
        proposedStart: startDate,
        proposedEnd: endDate,
        status: "approved",
        reviewNote: parsed.data.reviewNote,
        reviewedById: await getReviewerId(tx, workspace.organizationId, workspace.veterinarianId),
        reviewedAt: new Date(),
      },
    });

    await tx.notification.create({
      data: {
        organizationId: workspace.organizationId,
        clientId: request.clientId,
        type: "appointment_approved",
        title: "Cita aprobada",
        body: `${request.service} fue aprobada para ${request.pet.name}.`,
        data: { appointmentId: appointment.id, appointmentRequestId: request.id },
      },
    });
  });

  revalidatePath("/appointments");
  revalidatePath("/dashboard");
  return { ok: true };
}

export async function rejectAppointmentRequest(input: unknown): Promise<ActionResult> {
  const workspace = await requireWorkspace();
  assertCan(workspace.role, "appointment_requests:approve");

  const parsed = appointmentRequestDecisionSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const request = await findRequestForWorkspace(parsed.data.id, workspace.organizationId);
  if (!request) {
    return { ok: false, error: "Solicitud no encontrada" };
  }

  await prisma.appointmentRequest.update({
    where: { id: request.id },
    data: {
      status: "rejected",
      reviewNote: parsed.data.reviewNote,
      reviewedById: await getReviewerId(prisma, workspace.organizationId, workspace.veterinarianId),
      reviewedAt: new Date(),
    },
  });

  await prisma.notification.create({
    data: {
      organizationId: workspace.organizationId,
      clientId: request.clientId,
      type: "appointment_rejected",
      title: "Solicitud de cita rechazada",
      body: parsed.data.reviewNote ?? "La clinica no pudo aprobar esta solicitud.",
      data: { appointmentRequestId: request.id },
    },
  });

  revalidatePath("/appointments");
  revalidatePath("/dashboard");
  return { ok: true };
}

async function getReviewerId(
  db: Pick<typeof prisma, "organizationUser">,
  organizationId: string,
  veterinarianId: string,
) {
  const reviewer = await db.organizationUser.findFirst({
    where: { organizationId, veterinarianId, status: "active" },
    select: { id: true },
  });

  return reviewer?.id;
}
