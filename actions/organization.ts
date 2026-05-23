"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { assertCan } from "@/lib/permissions";
import { requireWorkspace } from "@/lib/session";
import { organizationProfileSchema } from "@/lib/validations";
import type { ActionResult } from "@/actions/clients";

function splitSpecialties(value: string | undefined) {
  return value
    ? value
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean)
    : [];
}

export async function updateOrganizationProfile(input: unknown): Promise<ActionResult> {
  const workspace = await requireWorkspace();
  assertCan(workspace.role, "clinic:update");

  const parsed = organizationProfileSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, fieldErrors: parsed.error.flatten().fieldErrors };
  }

  await prisma.organization.update({
    where: { id: workspace.organizationId },
    data: {
      name: parsed.data.name,
      logoUrl: parsed.data.logoUrl,
      address: parsed.data.address,
      city: parsed.data.city,
      phone: parsed.data.phone,
      openingHours: parsed.data.openingHours ? { notes: parsed.data.openingHours } : undefined,
      specialties: splitSpecialties(parsed.data.specialties),
    },
  });

  revalidatePath("/clinic");
  revalidatePath("/dashboard");
  return { ok: true };
}
