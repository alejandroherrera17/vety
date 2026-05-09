"use server";

import bcrypt from "bcryptjs";
import { Prisma } from "@prisma/client";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { registerSchema } from "@/lib/validations";
import type { ActionResult } from "@/actions/clients";

export async function registerVeterinarian(input: unknown): Promise<ActionResult> {
  const parsed = registerSchema.safeParse(input);

  if (!parsed.success) {
    return { ok: false, fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const existing = await prisma.veterinarian.findUnique({
    where: { email: parsed.data.email },
    select: { id: true },
  });

  if (existing) {
    return { ok: false, error: "Ya existe una cuenta con este email" };
  }

  const password = await bcrypt.hash(parsed.data.password, 12);

  try {
    await prisma.veterinarian.create({
      data: {
        name: parsed.data.name,
        email: parsed.data.email,
        phone: parsed.data.phone,
        password,
      },
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2002") {
        return { ok: false, error: "Ya existe una cuenta con este email" };
      }

      if (error.code === "P2022") {
        return {
          ok: false,
          error: "La base de datos no esta sincronizada. Ejecuta npx prisma db push.",
        };
      }
    }

    return { ok: false, error: "No se pudo crear la cuenta. Intenta de nuevo." };
  }

  redirect("/login?registered=1");
}
