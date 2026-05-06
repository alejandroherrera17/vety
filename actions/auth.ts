"use server";

import bcrypt from "bcryptjs";
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

  await prisma.veterinarian.create({
    data: {
      name: parsed.data.name,
      email: parsed.data.email,
      phone: parsed.data.phone,
      password,
    },
  });

  redirect("/login?registered=1");
}
