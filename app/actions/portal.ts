"use server";

import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { z } from "zod";
import type { ActionResult } from "@/actions/clients";

const registerSchema = z.object({
  name: z.string().min(2, "El nombre es muy corto"),
  email: z.string().email("Correo electrónico inválido"),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
  phone: z.string().min(7, "El teléfono es requerido"),
  document: z.string().optional(),
});

const clinicAppointmentRequestSchema = z
  .object({
    organizationId: z.string().uuid("Selecciona una clinica"),
    petId: z.string().uuid("Selecciona una mascota"),
    service: z.string().trim().min(2, "Selecciona o escribe un servicio"),
    reason: z.string().trim().optional(),
    requestedVeterinarianId: z.string().trim().optional(),
    requestedStart: z.string().min(1, "Selecciona fecha y hora"),
    requestedEnd: z.string().trim().optional(),
  })
  .refine((value) => !value.requestedEnd || new Date(value.requestedEnd) > new Date(value.requestedStart), {
    message: "La hora final debe ser posterior",
    path: ["requestedEnd"],
  });

export async function registerClient(formData: FormData) {
  try {
    const data = Object.fromEntries(formData.entries());
    const parsed = registerSchema.safeParse(data);
    
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0].message };
    }
    
    // Check if email already exists in Client or Veterinarian
    const existingClient = await prisma.client.findFirst({ where: { email: parsed.data.email } });
    if (existingClient) {
      return { success: false, error: "El correo ya está registrado" };
    }
    
    const existingVet = await prisma.veterinarian.findFirst({ where: { email: parsed.data.email } });
    if (existingVet) {
      return { success: false, error: "El correo ya está registrado como veterinario" };
    }
    
    const hashedPassword = await bcrypt.hash(parsed.data.password, 10);
    
    await prisma.client.create({
      data: {
        name: parsed.data.name,
        email: parsed.data.email,
        password: hashedPassword,
        phone: parsed.data.phone,
        document: parsed.data.document,
      }
    });
    
    return { success: true };
  } catch (error) {
    console.error("Error registering client:", error);
    return { success: false, error: "Ocurrió un error al registrar. Intenta de nuevo." };
  }
}

import { petSchema } from "@/lib/validations";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function createPortalPet(input: unknown) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.id || session.user.role !== "client") {
    return { ok: false, error: "No autorizado" };
  }

  const parsed = petSchema.safeParse(input);

  if (!parsed.success) {
    return { ok: false, error: "Datos inválidos" };
  }

  try {
    const pet = await prisma.pet.create({
      data: {
        ...parsed.data,
        birthDate: parsed.data.birthDate ? new Date(parsed.data.birthDate) : undefined,
        weight: parsed.data.weight ? Number(parsed.data.weight) : undefined,
        clientId: session.user.id,
      },
    });

    revalidatePath("/portal/pets");
    return { ok: true, data: pet };
  } catch (error) {
    console.error("Error creating pet:", error);
    return { ok: false, error: "Error al crear la mascota" };
  }
}

export async function createAppointmentRequest(input: any): Promise<ActionResult<{ id: string }>> {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.id || session.user.role !== "client") {
    return { ok: false, error: "No autorizado" };
  }

  const parsed = clinicAppointmentRequestSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const clinic = await prisma.organization.findUnique({
    where: { id: parsed.data.organizationId },
    select: { id: true, name: true },
  });

  if (!clinic) {
    return { ok: false, error: "La clinica seleccionada no existe" };
  }

  const pet = await prisma.pet.findFirst({
    where: {
      id: parsed.data.petId,
      clientId: session.user.id,
      organizationId: parsed.data.organizationId,
    },
    select: { id: true, name: true },
  });

  if (!pet) {
    return { ok: false, error: "La mascota no pertenece a esta cuenta en la clinica seleccionada" };
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

  try {
    const requestedStart = new Date(parsed.data.requestedStart);
    const requestedEnd = parsed.data.requestedEnd ? new Date(parsed.data.requestedEnd) : null;

    const request = await prisma.$transaction(async (tx) => {
      const createdRequest = await tx.appointmentRequest.create({
        data: {
          clientId: session.user.id,
          petId: pet.id,
          organizationId: parsed.data.organizationId,
          service: parsed.data.service,
          reason: parsed.data.reason || null,
          requestedStart,
          requestedEnd,
          requestedVeterinarianId: parsed.data.requestedVeterinarianId || null,
          status: "pending",
        },
      });

      await tx.notification.create({
        data: {
          organizationId: parsed.data.organizationId,
          type: "appointment_request",
          title: "Nueva solicitud de cita",
          body: `${session.user.name ?? "Un propietario"} solicitó ${parsed.data.service} para ${pet.name}.`,
          data: {
            appointmentRequestId: createdRequest.id,
            clientId: session.user.id,
            clientName: session.user.name ?? null,
            petId: pet.id,
            petName: pet.name,
          },
        },
      });

      return createdRequest;
    });

    revalidatePath(`/portal/clinics/${parsed.data.organizationId}`);
    revalidatePath("/portal/requests");
    revalidatePath("/dashboard/requests");
    return { ok: true, data: { id: request.id } };
  } catch (error) {
    console.error("Error creating appointment request:", error);
    return { ok: false, error: "Error al crear la solicitud" };
  }
}
