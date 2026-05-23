import { NextResponse } from "next/server";
import { processBoldNotification, verifyBoldWebhookSignature } from "@/lib/bold";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const rawBody = await request.text();
  const signature = request.headers.get("x-bold-signature");

  if (!verifyBoldWebhookSignature(rawBody, signature)) {
    console.warn("[bold:webhook] Invalid signature");
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    const notification = JSON.parse(rawBody) as unknown;
    const result = await processBoldNotification(notification as Parameters<typeof processBoldNotification>[0]);

    return NextResponse.json({ received: true, result });
  } catch (error) {
    console.error("[bold:webhook] Processing failed", error);
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 });
  }
}
