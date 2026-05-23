"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireWorkspace } from "@/lib/session";
import { prescriptionSchema } from "@/lib/validations";
import type { ActionResult } from "@/actions/clients";

export async function createPrescription(input: unknown): Promise<ActionResult> {
  const workspace = await requireWorkspace();
  const parsed = prescriptionSchema.safeParse(input);

  if (!parsed.success) {
    return { ok: false, fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const consultation = await prisma.consultation.findFirst({
    where: {
      id: parsed.data.consultationId,
      medicalRecord: { organizationId: workspace.organizationId },
    },
    select: {
      id: true,
      medicalRecord: { select: { petId: true } },
    },
  });

  if (!consultation) {
    return { ok: false, error: "Consulta no encontrada" };
  }

  await prisma.prescription.create({
    data: parsed.data,
  });

  revalidatePath(`/pets/${consultation.medicalRecord.petId}`);
  return { ok: true };
}
