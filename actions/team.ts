"use server";

import bcrypt from "bcryptjs";
import { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { assertCan } from "@/lib/permissions";
import { requireWorkspace } from "@/lib/session";
import { teamMemberSchema, updateTeamMemberSchema } from "@/lib/validations";
import type { ActionResult } from "@/actions/clients";

export async function createTeamMember(input: unknown): Promise<ActionResult> {
  const workspace = await requireWorkspace();
  assertCan(workspace.role, "users:manage");

  const parsed = teamMemberSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const password = await bcrypt.hash(parsed.data.password, 12);

  try {
    await prisma.$transaction(async (tx) => {
      const veterinarian = await tx.veterinarian.create({
        data: {
          organizationId: workspace.organizationId,
          name: parsed.data.name,
          email: parsed.data.email,
          phone: parsed.data.phone,
          password,
        },
        select: { id: true },
      });

      await tx.organizationUser.create({
        data: {
          organizationId: workspace.organizationId,
          veterinarianId: veterinarian.id,
          name: parsed.data.name,
          email: parsed.data.email,
          phone: parsed.data.phone,
          role: parsed.data.role,
          status: "active",
          invitedAt: new Date(),
          acceptedAt: new Date(),
        },
      });
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return { ok: false, error: "Ya existe una cuenta con este email" };
    }

    return { ok: false, error: "No se pudo crear el usuario" };
  }

  revalidatePath("/team");
  revalidatePath("/dashboard");
  return { ok: true };
}

export async function updateTeamMember(input: unknown): Promise<ActionResult> {
  const workspace = await requireWorkspace();
  assertCan(workspace.role, "users:manage");

  const parsed = updateTeamMemberSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const member = await prisma.organizationUser.findFirst({
    where: { id: parsed.data.id, organizationId: workspace.organizationId },
    select: { id: true, veterinarianId: true },
  });

  if (!member) {
    return { ok: false, error: "Usuario no encontrado" };
  }

  await prisma.organizationUser.update({
    where: { id: member.id },
    data: {
      role: parsed.data.role,
      status: parsed.data.status,
    },
  });

  revalidatePath("/team");
  revalidatePath("/dashboard");
  return { ok: true };
}
