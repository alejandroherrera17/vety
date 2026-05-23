"use server";

import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { z } from "zod";

const registerSchema = z.object({
  name: z.string().min(2, "El nombre es muy corto"),
  email: z.string().email("Correo electrónico inválido"),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
  phone: z.string().min(7, "El teléfono es requerido"),
  document: z.string().optional(),
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

export async function createAppointmentRequest(input: any) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.id || session.user.role !== "client") {
    return { ok: false, error: "No autorizado" };
  }

  try {
    const request = await prisma.appointmentRequest.create({
      data: {
        clientId: session.user.id,
        petId: input.petId,
        organizationId: input.organizationId,
        service: input.service,
        reason: input.reason || null,
        requestedStart: new Date(input.requestedStart),
        requestedVeterinarianId: input.requestedVeterinarianId || null,
        status: "pending",
      },
    });

    revalidatePath("/portal/requests");
    revalidatePath("/dashboard/requests");
    return { ok: true, data: request };
  } catch (error) {
    console.error("Error creating appointment request:", error);
    return { ok: false, error: "Error al crear la solicitud" };
  }
}
