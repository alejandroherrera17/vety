import { Building2, CalendarClock, MapPin, Stethoscope, Users, type LucideIcon } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { ClinicProfileForm } from "@/components/clinic-profile-form";
import { Card } from "@/components/ui/card";
import { prisma } from "@/lib/prisma";
import { requirePremiumWorkspace } from "@/lib/session";

function openingHoursText(value: unknown) {
  if (!value || typeof value !== "object" || !("notes" in value)) return "";
  return String((value as { notes?: unknown }).notes ?? "");
}

export default async function ClinicPage() {
  const workspace = await requirePremiumWorkspace();
  const [organization, stats] = await Promise.all([
    prisma.organization.findUniqueOrThrow({
      where: { id: workspace.organizationId },
      select: {
        name: true,
        logoUrl: true,
        address: true,
        city: true,
        phone: true,
        openingHours: true,
        specialties: true,
      },
    }),
    Promise.all([
      prisma.organizationUser.count({ where: { organizationId: workspace.organizationId, status: "active" } }),
      prisma.client.count({ where: { organizationId: workspace.organizationId } }),
      prisma.pet.count({ where: { organizationId: workspace.organizationId } }),
      prisma.schedule.count({ where: { organizationId: workspace.organizationId } }),
    ]),
  ]);

  return (
    <AppShell>
      <div className="mb-6 rounded-lg border border-border bg-white p-5 shadow-2xl shadow-black/10 backdrop-blur-xl sm:p-6">
        <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
          <div>
            <p className="text-sm font-semibold text-[#27ADF5]">Configuracion de organizacion</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-foreground">Clinica veterinaria</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
              Perfil, disponibilidad, especialidades y datos visibles para el portal de propietarios.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {([
              ["Equipo", stats[0], Users],
              ["Clientes", stats[1], Building2],
              ["Mascotas", stats[2], Stethoscope],
              ["Bloques", stats[3], CalendarClock],
            ] satisfies Array<[string, number, LucideIcon]>).map(([label, value, Icon]) => (
              <Card key={label as string} className="p-3">
                <Icon className="h-4 w-4 text-[#27ADF5]" />
                <p className="mt-2 text-2xl font-bold">{value}</p>
                <p className="text-xs text-muted-foreground">{label}</p>
              </Card>
            ))}
          </div>
        </div>
      </div>
      <div className="grid gap-5 lg:grid-cols-[1fr_360px]">
        <ClinicProfileForm
          initialValues={{
            name: organization.name,
            logoUrl: organization.logoUrl ?? "",
            address: organization.address ?? "",
            city: organization.city ?? "",
            phone: organization.phone ?? "",
            openingHours: openingHoursText(organization.openingHours),
            specialties: organization.specialties.join(", "),
          }}
        />
        <Card className="p-5">
          <h2 className="text-lg font-bold text-foreground">Ficha publica</h2>
          <div className="mt-5 grid gap-4">
            <div className="rounded-lg border border-border bg-secondary p-4">
              <p className="font-semibold text-foreground">{organization.name}</p>
              <p className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4" />
                {[organization.city, organization.address].filter(Boolean).join(" - ") || "Ubicacion pendiente"}
              </p>
            </div>
            <div>
              <p className="text-sm font-semibold text-muted-foreground">Especialidades</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {(organization.specialties.length ? organization.specialties : ["Medicina general"]).map((specialty) => (
                  <span key={specialty} className="rounded-full border border-border bg-secondary px-3 py-1 text-xs font-semibold text-muted-foreground">
                    {specialty}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </Card>
      </div>
    </AppShell>
  );
}
