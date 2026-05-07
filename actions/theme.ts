"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ThemeName } from "@/lib/themes/themes";

export async function updateUserTheme(theme: ThemeName) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  await prisma.veterinarian.update({
    where: { id: session.user.id },
    data: { theme }
  });

  return { success: true };
}