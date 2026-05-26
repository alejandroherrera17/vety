import "server-only";

import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import type { OrganizationRole } from "@/lib/permissions";

export type WorkspaceSession = {
  userId: string;
  veterinarianId: string;
  organizationId: string;
  organizationName: string;
  organizationLogoUrl: string | null;
  isPremium: boolean;
  premiumExpiresAt: Date | null;
  role: OrganizationRole;
  name: string;
  email: string;
};

export async function getCurrentWorkspace(): Promise<WorkspaceSession | null> {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return null;
  }

  const veterinarian = await prisma.veterinarian.findUnique({
    where: { id: session.user.id },
    include: {
      organization: { select: { id: true, name: true, logoUrl: true, isPremium: true, premiumExpiresAt: true } },
      organizationUsers: {
        where: { status: "active" },
        orderBy: { createdAt: "asc" },
        take: 1,
        select: { role: true, organizationId: true },
      },
    },
  });

  if (!veterinarian?.organizationId || !veterinarian.organization) {
    return null;
  }

  const membership = veterinarian.organizationUsers[0];
  const premiumIsActive =
    veterinarian.organization.isPremium &&
    (!veterinarian.organization.premiumExpiresAt || veterinarian.organization.premiumExpiresAt > new Date());

  return {
    userId: veterinarian.id,
    veterinarianId: veterinarian.id,
    organizationId: membership?.organizationId ?? veterinarian.organizationId,
    organizationName: veterinarian.organization.name,
    organizationLogoUrl: veterinarian.organization.logoUrl,
    isPremium: premiumIsActive,
    premiumExpiresAt: veterinarian.organization.premiumExpiresAt,
    role: (membership?.role ?? "admin") as OrganizationRole,
    name: veterinarian.name,
    email: veterinarian.email,
  };
}

export async function requireWorkspace() {
  const workspace = await getCurrentWorkspace();

  if (!workspace) {
    redirect("/login");
  }

  return workspace;
}

export async function getCurrentVeterinarian() {
  const workspace = await getCurrentWorkspace();

  if (!workspace) {
    return null;
  }

  return {
    id: workspace.veterinarianId,
    organizationId: workspace.organizationId,
    role: workspace.role,
    name: workspace.name,
    email: workspace.email,
  };
}

export async function requireVeterinarian() {
  const veterinarian = await getCurrentVeterinarian();

  if (!veterinarian) {
    redirect("/login");
  }

  return veterinarian;
}
