import "server-only";

import type { Prisma } from "@prisma/client";

export const FREE_TRIAL_DAYS = 15;
export const PAID_PREMIUM_DAYS = 30;
const DAY_IN_MS = 24 * 60 * 60 * 1000;

type TrialSettings = {
  freeTrialStartedAt?: string | null;
  freeTrialEndsAt?: string | null;
};

export type SubscriptionAccessSource = "premium" | "trial" | "expired";

export type SubscriptionState = {
  hasPaidPremium: boolean;
  premiumIsActive: boolean;
  premiumSince: Date | null;
  premiumExpiresAt: Date | null;
  trialStartedAt: Date | null;
  trialExpiresAt: Date | null;
  trialIsActive: boolean;
  trialDaysRemaining: number;
  accessIsActive: boolean;
  accessSource: SubscriptionAccessSource;
  trialSettingsToPersist: TrialSettings | null;
};

function parseDate(value: string | null | undefined) {
  if (!value) return null;

  const date = new Date(value);

  return Number.isNaN(date.getTime()) ? null : date;
}

function addDays(date: Date, days: number) {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

export function buildFreeTrialSettings(startedAt = new Date()): TrialSettings {
  const endsAt = addDays(startedAt, FREE_TRIAL_DAYS);

  return {
    freeTrialStartedAt: startedAt.toISOString(),
    freeTrialEndsAt: endsAt.toISOString(),
  };
}

function readTrialSettings(settings: Prisma.JsonValue | null | undefined): TrialSettings {
  if (!settings || typeof settings !== "object" || Array.isArray(settings)) {
    return {};
  }

  const value = settings as Record<string, unknown>;

  return {
    freeTrialStartedAt: typeof value.freeTrialStartedAt === "string" ? value.freeTrialStartedAt : null,
    freeTrialEndsAt: typeof value.freeTrialEndsAt === "string" ? value.freeTrialEndsAt : null,
  };
}

function getFallbackTrialStart(createdAt: Date, now: Date) {
  const ageInDays = (now.getTime() - createdAt.getTime()) / DAY_IN_MS;

  return ageInDays <= FREE_TRIAL_DAYS ? createdAt : now;
}

export function computeSubscriptionState(input: {
  settings: Prisma.JsonValue | null | undefined;
  isPremium: boolean;
  premiumSince: Date | null;
  premiumExpiresAt: Date | null;
  createdAt: Date;
  now?: Date;
}): SubscriptionState {
  const now = input.now ?? new Date();
  const trialSettings = readTrialSettings(input.settings);
  const trialStartedAt = parseDate(trialSettings.freeTrialStartedAt);
  const trialExpiresAt = parseDate(trialSettings.freeTrialEndsAt);
  const hasStoredTrialWindow = Boolean(trialStartedAt && trialExpiresAt);
  const hasEverPaid = Boolean(input.isPremium || input.premiumSince || input.premiumExpiresAt);
  const premiumIsActive = input.isPremium && (!input.premiumExpiresAt || input.premiumExpiresAt > now);

  const fallbackTrialStart =
    !hasStoredTrialWindow && !hasEverPaid ? getFallbackTrialStart(input.createdAt, now) : null;
  const effectiveTrialStartedAt = trialStartedAt ?? fallbackTrialStart;
  const effectiveTrialExpiresAt = trialExpiresAt ?? (fallbackTrialStart ? addDays(fallbackTrialStart, FREE_TRIAL_DAYS) : null);
  const trialIsActive =
    !premiumIsActive &&
    Boolean(effectiveTrialStartedAt && effectiveTrialExpiresAt && effectiveTrialExpiresAt > now);

  const trialDaysRemaining =
    trialIsActive && effectiveTrialExpiresAt
      ? Math.max(1, Math.ceil((effectiveTrialExpiresAt.getTime() - now.getTime()) / DAY_IN_MS))
      : 0;

  return {
    hasPaidPremium: premiumIsActive,
    premiumIsActive,
    premiumSince: input.premiumSince,
    premiumExpiresAt: input.premiumExpiresAt,
    trialStartedAt: effectiveTrialStartedAt,
    trialExpiresAt: effectiveTrialExpiresAt,
    trialIsActive,
    trialDaysRemaining,
    accessIsActive: premiumIsActive || trialIsActive,
    accessSource: premiumIsActive ? "premium" : trialIsActive ? "trial" : "expired",
    trialSettingsToPersist:
      !hasStoredTrialWindow && !premiumIsActive && effectiveTrialStartedAt && effectiveTrialExpiresAt
        ? {
            freeTrialStartedAt: effectiveTrialStartedAt.toISOString(),
            freeTrialEndsAt: effectiveTrialExpiresAt.toISOString(),
          }
        : null,
  };
}
