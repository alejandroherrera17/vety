import "server-only";

import crypto from "crypto";
import { PaymentStatus, Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export const BOLD_PREMIUM_AMOUNT = 5000;
export const BOLD_PREMIUM_CURRENCY = "COP";
export const BOLD_PREMIUM_DESCRIPTION = "VettiPets Premium 5 dias";
export const BOLD_CHECKOUT_SCRIPT = "https://checkout.bold.co/library/boldPaymentButton.js";

export const PREMIUM_DAYS = 5;

type BoldAmount = {
  total?: number;
  total_amount?: number;
  currency?: string;
};

type BoldNotification = {
  id?: string;
  type?: string;
  subject?: string;
  data?: {
    payment_id?: string;
    transaction_id?: string;
    bold_code?: string;
    amount?: BoldAmount;
    metadata?: {
      reference?: string | null;
    };
  };
};

type BoldPaymentStatus = {
  transaction_id?: string;
  reference_id?: string;
  payment_status?: string;
  status?: string;
  total?: number;
  amount?: BoldAmount;
};

export type BoldCheckoutPayload = {
  orderId: string;
  amount: string;
  currency: string;
  apiKey: string;
  integritySignature: string;
  description: string;
  redirectionUrl: string;
  originUrl: string;
  renderMode: "embedded";
  customerData: string;
};

export function getBoldPublicKey() {
  return process.env.NEXT_PUBLIC_BOLD_KEY ?? process.env.BOLD_IDENTITY_KEY ?? "";
}

export function getBoldIdentityKey() {
  return process.env.BOLD_IDENTITY_KEY ?? process.env.NEXT_PUBLIC_BOLD_KEY ?? "";
}

export function getBoldSecretKey() {
  return process.env.BOLD_SECRET_KEY ?? "";
}

export function createBoldIntegritySignature(orderId: string, amount: number, currency: string) {
  const secretKey = getBoldSecretKey();

  if (!secretKey) {
    throw new Error("BOLD_SECRET_KEY is required to create fixed-amount Bold payments");
  }

  return crypto.createHash("sha256").update(`${orderId}${amount}${currency}${secretKey}`).digest("hex");
}

export function verifyBoldWebhookSignature(rawBody: string, signature: string | null) {
  const secretKey = getBoldSecretKey();

  if (!secretKey || !signature) {
    return false;
  }

  const encodedBody = Buffer.from(rawBody, "utf8").toString("base64");
  const digest = crypto.createHmac("sha256", secretKey).update(encodedBody).digest("hex");

  return timingSafeEqual(digest, signature);
}

export function buildBoldOrderId(organizationId: string) {
  const orgPrefix = organizationId.replace(/[^a-zA-Z0-9_-]/g, "").slice(0, 8).toUpperCase();
  const entropy = crypto.randomBytes(6).toString("hex").toUpperCase();

  return `VP-${orgPrefix}-${Date.now()}-${entropy}`.slice(0, 60);
}

export function buildAppUrl(path: string, requestUrl?: string) {
  const baseUrl =
    process.env.NEXT_PUBLIC_APP_URL ??
    process.env.NEXTAUTH_URL ??
    (requestUrl ? new URL(requestUrl).origin : "http://localhost:3000");

  return new URL(path, baseUrl).toString();
}

export async function createBoldPremiumPayment(input: {
  organizationId: string;
  userId: string;
  userEmail: string;
  userName: string;
  requestUrl: string;
}) {
  const apiKey = getBoldPublicKey();

  if (!apiKey) {
    throw new Error("NEXT_PUBLIC_BOLD_KEY is required");
  }

  const orderId = buildBoldOrderId(input.organizationId);
  const integritySignature = createBoldIntegritySignature(
    orderId,
    BOLD_PREMIUM_AMOUNT,
    BOLD_PREMIUM_CURRENCY,
  );
  const redirectionUrl = buildAppUrl(`/premium/resultado?orderId=${orderId}`, input.requestUrl);
  const originUrl = buildAppUrl("/premium", input.requestUrl);

  await prisma.payment.create({
    data: {
      organizationId: input.organizationId,
      userId: input.userId,
      userEmail: input.userEmail,
      orderId,
      amount: BOLD_PREMIUM_AMOUNT,
      currency: BOLD_PREMIUM_CURRENCY,
      description: BOLD_PREMIUM_DESCRIPTION,
      metadata: {
        checkout: "button",
        product: "premium_5_days",
        userName: input.userName,
      },
    },
  });

  return {
    orderId,
    amount: String(BOLD_PREMIUM_AMOUNT),
    currency: BOLD_PREMIUM_CURRENCY,
    apiKey,
    integritySignature,
    description: BOLD_PREMIUM_DESCRIPTION,
    redirectionUrl,
    originUrl,
    renderMode: "embedded" as const,
    customerData: JSON.stringify({
      email: input.userEmail,
      fullName: input.userName,
      dialCode: "+57",
    }),
  } satisfies BoldCheckoutPayload;
}

export async function processBoldNotification(notification: BoldNotification) {
  const data = notification.data ?? {};
  const orderId = data.metadata?.reference ?? undefined;

  if (!orderId) {
    console.warn("[bold:webhook] Missing metadata.reference", { id: notification.id, type: notification.type });
    return { ok: false, reason: "missing_reference" };
  }

  const payment = await prisma.payment.findUnique({ where: { orderId } });

  if (!payment) {
    console.warn("[bold:webhook] Unknown orderId", { orderId, id: notification.id });
    return { ok: false, reason: "unknown_order" };
  }

  const amount = data.amount?.total ?? data.amount?.total_amount;
  const currency = data.amount?.currency ?? payment.currency;
  const providerPaymentId = data.payment_id ?? notification.subject;
  const providerTransactionId = data.transaction_id ?? data.bold_code ?? providerPaymentId;
  const status = normalizeWebhookStatus(notification.type);

  if (status === "approved") {
    const amountMatches = amount === payment.amount;
    const currencyMatches = currency === payment.currency;

    if (!amountMatches || !currencyMatches) {
      console.warn("[bold:webhook] Amount validation failed", {
        orderId,
        expectedAmount: payment.amount,
        amount,
        expectedCurrency: payment.currency,
        currency,
      });

      await markPaymentRejected({
        orderId,
        reason: "amount_or_currency_mismatch",
        rawPayload: notification,
        providerPaymentId,
        providerTransactionId,
      });

      return { ok: false, reason: "amount_or_currency_mismatch" };
    }

    await approvePayment({
      orderId,
      providerPaymentId,
      providerTransactionId,
      rawPayload: notification,
    });

    return { ok: true, status: "approved" };
  }

  if (status === "rejected") {
    await markPaymentRejected({
      orderId,
      reason: notification.type ?? "SALE_REJECTED",
      rawPayload: notification,
      providerPaymentId,
      providerTransactionId,
    });

    return { ok: true, status: "rejected" };
  }

  await prisma.payment.update({
    where: { orderId },
    data: {
      rawPayload: notification as Prisma.InputJsonValue,
      boldPaymentId: providerPaymentId,
      boldTransactionId: providerTransactionId,
    },
  });

  return { ok: true, status: "pending" };
}

export async function verifyBoldPaymentByOrderId(orderId: string) {
  const payment = await prisma.payment.findUnique({
    where: { orderId },
    include: { organization: true },
  });

  if (!payment) {
    return { status: "not_found" as const };
  }

  if (payment.status === "approved") {
    return { status: "approved" as const, payment };
  }

  const fallback = await fetchBoldFallbackNotification(orderId);
  const notification = fallback?.notifications[0];

  if (notification) {
    await processBoldNotification(notification);
  } else {
    const statusResponse = await fetchBoldPaymentStatus(orderId);
    if (statusResponse) {
      await processBoldStatusResponse(statusResponse);
    }
  }

  const refreshed = await prisma.payment.findUnique({
    where: { orderId },
    include: { organization: true },
  });

  return { status: refreshed?.status ?? "not_found", payment: refreshed };
}

async function fetchBoldFallbackNotification(orderId: string): Promise<{ notifications: BoldNotification[] } | null> {
  const identityKey = getBoldIdentityKey();

  if (!identityKey) {
    return null;
  }

  const url = new URL(
    `https://integrations.api.bold.co/payments/webhook/notifications/${encodeURIComponent(orderId)}`,
  );
  url.searchParams.set("is_external_reference", "true");

  const response = await boldFetch(url.toString(), identityKey);

  if (!response || !Array.isArray(response.notifications)) {
    return null;
  }

  return { notifications: response.notifications as BoldNotification[] };
}

async function fetchBoldPaymentStatus(orderId: string) {
  const identityKey = getBoldIdentityKey();

  if (!identityKey) {
    return null;
  }

  const response = await boldFetch(
    `https://payments.api.bold.co/v2/payment-voucher/${encodeURIComponent(orderId)}`,
    identityKey,
  );

  return (response?.payload ?? response) as BoldPaymentStatus | null;
}

async function boldFetch(url: string, identityKey: string) {
  try {
    const response = await fetch(url, {
      headers: {
        Authorization: `x-api-key ${identityKey}`,
        Accept: "application/json",
      },
      cache: "no-store",
    });

    if (!response.ok) {
      console.warn("[bold:verify] Bold status lookup failed", { status: response.status, url });
      return null;
    }

    return (await response.json()) as Record<string, unknown>;
  } catch (error) {
    console.warn("[bold:verify] Bold status lookup error", error);
    return null;
  }
}

async function processBoldStatusResponse(statusResponse: BoldPaymentStatus) {
  const orderId = statusResponse.reference_id;

  if (!orderId) return;

  const status = normalizePaymentStatus(statusResponse.payment_status ?? statusResponse.status);
  const payment = await prisma.payment.findUnique({ where: { orderId } });

  if (!payment) return;

  if (status === "approved") {
    const amount = statusResponse.amount?.total_amount ?? statusResponse.amount?.total ?? statusResponse.total;
    const currency = statusResponse.amount?.currency ?? payment.currency;

    if (amount !== payment.amount || currency !== payment.currency) {
      await markPaymentRejected({
        orderId,
        reason: "amount_or_currency_mismatch",
        rawPayload: statusResponse,
        providerTransactionId: statusResponse.transaction_id,
      });
      return;
    }

    await approvePayment({
      orderId,
      providerTransactionId: statusResponse.transaction_id,
      rawPayload: statusResponse,
    });
  } else if (status === "rejected") {
    await markPaymentRejected({
      orderId,
      reason: statusResponse.payment_status ?? statusResponse.status ?? "REJECTED",
      rawPayload: statusResponse,
      providerTransactionId: statusResponse.transaction_id,
    });
  }
}

async function approvePayment(input: {
  orderId: string;
  providerPaymentId?: string;
  providerTransactionId?: string;
  rawPayload: unknown;
}) {
  await prisma.$transaction(async (tx) => {
    const payment = await tx.payment.findUnique({ where: { orderId: input.orderId } });

    if (!payment) {
      throw new Error(`Payment ${input.orderId} not found`);
    }

    if (payment.status === PaymentStatus.approved) {
      return;
    }

    const now = new Date();
    const currentOrganization = await tx.organization.findUnique({
      where: { id: payment.organizationId },
      select: { premiumExpiresAt: true },
    });
    const startsFrom =
      currentOrganization?.premiumExpiresAt && currentOrganization.premiumExpiresAt > now
        ? currentOrganization.premiumExpiresAt
        : now;
    const premiumExpiresAt = new Date(startsFrom);
    premiumExpiresAt.setDate(premiumExpiresAt.getDate() + PREMIUM_DAYS);

    await tx.payment.update({
      where: { orderId: input.orderId },
      data: {
        status: PaymentStatus.approved,
        paidAt: now,
        boldPaymentId: input.providerPaymentId,
        boldTransactionId: input.providerTransactionId,
        rawPayload: input.rawPayload as Prisma.InputJsonValue,
      },
    });

    await tx.organization.update({
      where: { id: payment.organizationId },
      data: {
        isPremium: true,
        premiumSince: now,
        premiumExpiresAt,
        boldTransactionId: input.providerTransactionId,
      },
    });
  });
}

async function markPaymentRejected(input: {
  orderId: string;
  reason: string;
  rawPayload: unknown;
  providerPaymentId?: string;
  providerTransactionId?: string;
}) {
  await prisma.payment.update({
    where: { orderId: input.orderId },
    data: {
      status: PaymentStatus.rejected,
      failureReason: input.reason,
      rawPayload: input.rawPayload as Prisma.InputJsonValue,
      boldPaymentId: input.providerPaymentId,
      boldTransactionId: input.providerTransactionId,
    },
  });
}

function normalizeWebhookStatus(type?: string) {
  if (type === "SALE_APPROVED") return "approved";
  if (type === "SALE_REJECTED" || type === "VOID_APPROVED") return "rejected";

  return "pending";
}

function normalizePaymentStatus(status?: string) {
  const normalized = status?.toUpperCase();

  if (normalized === "APPROVED") return "approved";
  if (normalized === "REJECTED" || normalized === "FAILED" || normalized === "DECLINED") {
    return "rejected";
  }

  return "pending";
}

function timingSafeEqual(left: string, right: string) {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);

  if (leftBuffer.length !== rightBuffer.length) {
    return false;
  }

  return crypto.timingSafeEqual(leftBuffer, rightBuffer);
}
