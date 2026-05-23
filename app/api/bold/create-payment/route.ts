import { NextResponse } from "next/server";
import { createBoldPremiumPayment } from "@/lib/bold";
import { getCurrentWorkspace } from "@/lib/session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const workspace = await getCurrentWorkspace();

    if (!workspace) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const checkout = await createBoldPremiumPayment({
      organizationId: workspace.organizationId,
      userId: workspace.userId,
      userEmail: workspace.email,
      userName: workspace.name,
      requestUrl: request.url,
    });

    console.info("[bold:create-payment] Created premium checkout", {
      orderId: checkout.orderId,
      organizationId: workspace.organizationId,
      amount: checkout.amount,
      currency: checkout.currency,
    });

    return NextResponse.json({ checkout });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to create Bold payment";
    console.error("[bold:create-payment] Failed", error);

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
