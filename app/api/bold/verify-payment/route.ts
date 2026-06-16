import { NextResponse } from "next/server";
import { verifyBoldPaymentByOrderId } from "@/lib/bold";
import { getCurrentWorkspace } from "@/lib/session";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const workspace = await getCurrentWorkspace();

  if (!workspace) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const orderId = searchParams.get("orderId");

  if (!orderId) {
    return NextResponse.json({ error: "orderId is required" }, { status: 400 });
  }

  const payment = await prisma.payment.findUnique({
    where: { orderId },
    select: { organizationId: true },
  });

  if (!payment || payment.organizationId !== workspace.organizationId) {
    return NextResponse.json({ error: "Payment not found" }, { status: 404 });
  }

  const result = await verifyBoldPaymentByOrderId(orderId);
  const freshWorkspace = await getCurrentWorkspace();

  return NextResponse.json({
    status: result.status,
    orderId,
    isPremium: result.payment?.organization.isPremium ?? false,
    premiumExpiresAt: result.payment?.organization.premiumExpiresAt ?? null,
    accessSource: freshWorkspace?.accessSource ?? workspace.accessSource,
    trialIsActive: freshWorkspace?.trialIsActive ?? workspace.trialIsActive,
    trialDaysRemaining: freshWorkspace?.trialDaysRemaining ?? workspace.trialDaysRemaining,
  });
}

export async function POST(request: Request) {
  return GET(request);
}
