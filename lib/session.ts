import "server-only";

import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";

export async function getCurrentVeterinarian() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return null;
  }

  return {
    id: session.user.id,
    name: session.user.name ?? "Veterinarian",
    email: session.user.email ?? "",
  };
}

export async function requireVeterinarian() {
  const veterinarian = await getCurrentVeterinarian();

  if (!veterinarian) {
    redirect("/login");
  }

  return veterinarian;
}
