import { AppShell } from "@/components/app-shell";
import { PremiumResultPanel } from "@/components/premium-result-panel";
import { requireWorkspace } from "@/lib/session";

export default async function PremiumResultPage({
  searchParams,
}: {
  searchParams: Promise<{ orderId?: string; "bold-order-id"?: string }>;
}) {
  await requireWorkspace();
  const params = await searchParams;
  const orderId = params.orderId ?? params["bold-order-id"];

  return (
    <AppShell>
      <div className="grid min-h-[calc(100dvh-8rem)] place-items-center">
        <PremiumResultPanel orderId={orderId} />
      </div>
    </AppShell>
  );
}
