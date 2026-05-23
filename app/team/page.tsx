import { ClipboardList, ShieldCheck, UserRoundCheck, type LucideIcon } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { TeamManagement } from "@/components/team-management";
import { Card } from "@/components/ui/card";
import { prisma } from "@/lib/prisma";
import { requireWorkspace } from "@/lib/session";

export default async function TeamPage() {
  const workspace = await requireWorkspace();
  const members = await prisma.organizationUser.findMany({
    where: { organizationId: workspace.organizationId },
    orderBy: [{ role: "asc" }, { name: "asc" }],
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      role: true,
      status: true,
    },
  });

  const activeVeterinarians = members.filter(
    (member) => member.status === "active" && ["admin", "veterinarian"].includes(member.role),
  ).length;
  const receptionists = members.filter((member) => member.status === "active" && member.role === "receptionist").length;

  return (
    <AppShell>
      <div className="mb-6 rounded-lg border border-white/10 bg-white/[0.06] p-5 shadow-2xl shadow-black/10 backdrop-blur-xl sm:p-6">
        <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
          <div>
            <p className="text-sm font-semibold text-cyan-100">Usuarios y permisos</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-foreground">Equipo de la clinica</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
              Gestiona veterinarios, recepcionistas y accesos segun el rol operativo.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            {([
              ["Miembros", members.length, ClipboardList],
              ["Veterinarios", activeVeterinarians, UserRoundCheck],
              ["Recepcion", receptionists, ShieldCheck],
            ] satisfies Array<[string, number, LucideIcon]>).map(([label, value, Icon]) => (
              <Card key={label} className="p-4">
                <Icon className="h-4 w-4 text-cyan-100" />
                <p className="mt-2 text-2xl font-bold">{value}</p>
                <p className="text-xs text-muted-foreground">{label}</p>
              </Card>
            ))}
          </div>
        </div>
      </div>
      <TeamManagement members={members} />
    </AppShell>
  );
}
