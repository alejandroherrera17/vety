"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { checkRateLimit } from "@/lib/rate-limit";
import { portalClientRegistrationSchema, portalLookupSchema } from "@/lib/validations";
import type { ActionResult } from "@/actions/clients";

function publicDate(value: Date | null | undefined) {
  return value ? value.toISOString() : null;
}

function normalizeDocument(value: string) {
  return value.trim();
}

export async function lookupPortal(input: unknown): Promise<ActionResult<{ pets: unknown[] }>> {
  const headersList = await headers();
  const ip =
    headersList.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    headersList.get("x-real-ip") ??
    "local";
  const limit = checkRateLimit(`portal:${ip}`, 8, 10 * 60 * 1000);

  if (!limit.allowed) {
    return {
      ok: false,
      error: `Demasiados intentos. Intenta de nuevo en ${limit.retryAfter} segundos.`,
    };
  }

  const parsed = portalLookupSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const clients = await prisma.client.findMany({
    where: { document: normalizeDocument(parsed.data.document) },
    select: {
      id: true,
      name: true,
      phone: true,
      pets: {
        orderBy: { name: "asc" },
        select: {
          id: true,
          name: true,
          species: true,
          breed: true,
          sex: true,
          birthDate: true,
          vaccinations: {
            orderBy: { date: "desc" },
            select: { id: true, vaccine: true, date: true, nextDose: true },
          },
          appointments: {
            where: { startDate: { gte: new Date() }, status: { in: ["pending", "confirmed"] } },
            orderBy: { startDate: "asc" },
            take: 8,
            select: { id: true, title: true, notes: true, startDate: true, endDate: true, status: true },
          },
          appointmentRequests: {
            orderBy: { createdAt: "desc" },
            take: 12,
            select: {
              id: true,
              service: true,
              reason: true,
              requestedStart: true,
              requestedEnd: true,
              proposedStart: true,
              proposedEnd: true,
              status: true,
              reviewNote: true,
              organization: { select: { name: true } },
            },
          },
          medicalRecords: {
            orderBy: { createdAt: "desc" },
            select: {
              consultations: {
                orderBy: { date: "desc" },
                take: 10,
                select: {
                  id: true,
                  date: true,
                  diagnosis: true,
                  treatment: true,
                  observations: true,
                  prescriptions: {
                    orderBy: { createdAt: "desc" },
                    select: {
                      id: true,
                      medication: true,
                      dosage: true,
                      duration: true,
                      instructions: true,
                      createdAt: true,
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  });

  const pets = clients.flatMap((client) =>
    client.pets.map((pet) => ({
      id: pet.id,
      name: pet.name,
      species: pet.species,
      breed: pet.breed,
      sex: pet.sex,
      birthDate: publicDate(pet.birthDate),
      owner: { name: client.name, phone: client.phone },
      vaccinations: pet.vaccinations.map((vaccination) => ({
        ...vaccination,
        date: publicDate(vaccination.date),
        nextDose: publicDate(vaccination.nextDose),
      })),
      appointments: pet.appointments.map((appointment) => ({
        ...appointment,
        startDate: publicDate(appointment.startDate),
        endDate: publicDate(appointment.endDate),
      })),
      appointmentRequests: pet.appointmentRequests.map((request) => ({
        ...request,
        requestedStart: publicDate(request.requestedStart),
        requestedEnd: publicDate(request.requestedEnd),
        proposedStart: publicDate(request.proposedStart),
        proposedEnd: publicDate(request.proposedEnd),
        clinicName: request.organization.name,
      })),
      consultations: pet.medicalRecords.flatMap((record) =>
        record.consultations.map((consultation) => ({
          ...consultation,
          date: publicDate(consultation.date),
          prescriptions: consultation.prescriptions.map((prescription) => ({
            ...prescription,
            createdAt: publicDate(prescription.createdAt),
          })),
        })),
      ),
    })),
  );

  await new Promise((resolve) => setTimeout(resolve, pets.length ? 250 : 500));

  if (!pets.length) {
    return { ok: true, data: { pets: [] } };
  }

  return { ok: true, data: { pets } };
}

export async function registerPortalClient(input: unknown): Promise<ActionResult<{ document: string }>> {
  const parsed = portalClientRegistrationSchema.safeParse(input);

  if (!parsed.success) {
    return { ok: false, fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const organization = await prisma.organization.findUnique({
    where: { id: parsed.data.organizationId },
    select: {
      id: true,
      users: {
        where: {
          status: "active",
          veterinarianId: { not: null },
          role: { in: ["admin", "veterinarian"] },
        },
        orderBy: [{ role: "asc" }, { createdAt: "asc" }],
        take: 1,
        select: { veterinarianId: true },
      },
    },
  });

  const veterinarianId = organization?.users[0]?.veterinarianId;

  if (!organization || !veterinarianId) {
    return { ok: false, error: "La clinica seleccionada aun no tiene equipo disponible" };
  }

  const existingClient = await prisma.client.findFirst({
    where: {
      organizationId: parsed.data.organizationId,
      document: normalizeDocument(parsed.data.document),
    },
    select: { id: true },
  });

  const clientId = existingClient?.id
    ? (
        await prisma.client.update({
          where: { id: existingClient.id },
          data: {
            name: parsed.data.name,
            phone: parsed.data.phone,
            email: parsed.data.email || undefined,
            address: parsed.data.address,
            city: parsed.data.city,
          },
          select: { id: true },
        })
      ).id
    : (
        await prisma.client.create({
          data: {
            organizationId: parsed.data.organizationId,
            veterinarianId,
            name: parsed.data.name,
            document: normalizeDocument(parsed.data.document),
            phone: parsed.data.phone,
            email: parsed.data.email || undefined,
            address: parsed.data.address,
            city: parsed.data.city,
          },
          select: { id: true },
        })
      ).id;

  const existingPet = await prisma.pet.findFirst({
    where: {
      organizationId: parsed.data.organizationId,
      clientId,
      name: parsed.data.petName,
    },
    select: { id: true },
  });

  if (!existingPet) {
    await prisma.pet.create({
      data: {
        organizationId: parsed.data.organizationId,
        clientId,
        name: parsed.data.petName,
        species: parsed.data.petSpecies,
        breed: parsed.data.petBreed,
        sex: parsed.data.petSex,
        birthDate: parsed.data.petBirthDate ? new Date(parsed.data.petBirthDate) : undefined,
      },
    });
  }

  revalidatePath("/clients");
  revalidatePath("/pets");
  revalidatePath("/dashboard");
  return { ok: true, data: { document: normalizeDocument(parsed.data.document) } };
}
