import "server-only";

import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { computeSubscriptionState } from "@/lib/subscription";
import type { OrganizationRole } from "@/lib/permissions";

export type WorkspaceSession = {
  userId: string;
  veterinarianId: string;
  organizationId: string;
  organizationName: string;
  organizationLogoUrl: string | null;
  isPremium: boolean;
  hasPaidPremium: boolean;
  accessSource: "premium" | "trial" | "expired";
  trialIsActive: boolean;
  trialStartedAt: Date | null;
  trialExpiresAt: Date | null;
  trialDaysRemaining: number;
  premiumSince: Date | null;
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
      organization: {
        select: {
          id: true,
          name: true,
          logoUrl: true,
          settings: true,
          isPremium: true,
          premiumSince: true,
          premiumExpiresAt: true,
          createdAt: true,
        },
      },
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
  const subscriptionState = computeSubscriptionState({
    settings: veterinarian.organization.settings,
    isPremium: veterinarian.organization.isPremium,
    premiumSince: veterinarian.organization.premiumSince,
    premiumExpiresAt: veterinarian.organization.premiumExpiresAt,
    createdAt: veterinarian.organization.createdAt,
  });

  if (subscriptionState.trialSettingsToPersist) {
    await prisma.organization.update({
      where: { id: veterinarian.organization.id },
      data: {
        settings: {
          ...(veterinarian.organization.settings &&
          typeof veterinarian.organization.settings === "object" &&
          !Array.isArray(veterinarian.organization.settings)
            ? (veterinarian.organization.settings as Record<string, unknown>)
            : {}),
          ...subscriptionState.trialSettingsToPersist,
        },
      },
    });
  }

  return {
    userId: veterinarian.id,
    veterinarianId: veterinarian.id,
    organizationId: membership?.organizationId ?? veterinarian.organizationId,
    organizationName: veterinarian.organization.name,
    organizationLogoUrl: veterinarian.organization.logoUrl,
    isPremium: subscriptionState.accessIsActive,
    hasPaidPremium: subscriptionState.hasPaidPremium,
    accessSource: subscriptionState.accessSource,
    trialIsActive: subscriptionState.trialIsActive,
    trialStartedAt: subscriptionState.trialStartedAt,
    trialExpiresAt: subscriptionState.trialExpiresAt,
    trialDaysRemaining: subscriptionState.trialDaysRemaining,
    premiumSince: veterinarian.organization.premiumSince,
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

export async function getCurrentPremiumWorkspace(): Promise<WorkspaceSession | null> {
  const workspace = await getCurrentWorkspace();

  if (!workspace?.isPremium) {
    return null;
  }

  return workspace;
}

export async function requirePremiumWorkspace() {
  const workspace = await getCurrentPremiumWorkspace();

  if (!workspace) {
    redirect("/premium");
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
