import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { PortalAppShell } from "@/components/portal/portal-app-shell";

export default async function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session || session.user?.role !== "client") {
    redirect("/portal/login");
  }

  return (
    <PortalAppShell user={session.user}>
      {children}
    </PortalAppShell>
  );
}
