"use server";

import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { checkRateLimit } from "@/lib/rate-limit";
import { portalLookupSchema } from "@/lib/validations";
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
