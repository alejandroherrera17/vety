import { prisma } from "@/lib/prisma";
import { Building2, MapPin, Search } from "lucide-react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { ClinicDirectoryClient } from "@/components/portal/clinic-directory-client";

export default async function PortalClinicsPage() {
  const clinics = await prisma.organization.findMany({
    orderBy: { name: "asc" },
    select: {
      id: true,
      name: true,
      city: true,
      address: true,
      specialties: true,
      logoUrl: true,
      users: {
        where: {
          status: "active",
          role: { in: ["admin", "veterinarian"] },
          veterinarianId: { not: null },
        },
        take: 10,
        select: { veterinarianId: true, name: true },
      },
    },
  });

  const serializedClinics = clinics.map(c => ({
    ...c,
    veterinarians: c.users
  }));

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Directorio de Clínicas</h1>
        <p className="text-slate-500 mt-1">Encuentra la mejor atención veterinaria en tu ciudad y solicita citas fácilmente.</p>
      </div>

      <ClinicDirectoryClient clinics={serializedClinics} />
    </div>
  );
}
