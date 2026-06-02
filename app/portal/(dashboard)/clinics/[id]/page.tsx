import Link from "next/link";
import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { ArrowLeft, Building2, Clock, MapPin, Phone, Stethoscope } from "lucide-react";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PortalClinicRequestForm } from "@/components/portal/portal-clinic-request-form";

export default async function ClinicDetailPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) return null;

  const clinic = await prisma.organization.findUnique({
    where: { id: params.id },
    include: {
      users: {
        where: {
          status: "active",
          role: { in: ["admin", "veterinarian"] },
          veterinarianId: { not: null },
        },
        select: { veterinarianId: true, name: true },
      },
    },
  });

  if (!clinic) notFound();

  const myPets = await prisma.pet.findMany({
    where: { clientId: session.user.id },
    select: { id: true, name: true, species: true },
  });

  const veterinarians = clinic.users.map((user) => ({ id: user.veterinarianId as string, name: user.name }));

  return (
    <div className="mx-auto max-w-5xl space-y-6 p-6 md:p-8">
      <Link href="/portal/clinics" className="inline-flex items-center text-sm font-medium text-muted-foreground transition-colors hover:text-[#27ADF5]">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Volver al directorio
      </Link>

      <div className="overflow-hidden rounded-2xl border border-border bg-white shadow-sm">
        <div className="relative h-48 bg-sky-50 md:h-64">
          <div
            className="absolute inset-0 opacity-10"
            style={{ backgroundImage: "radial-gradient(circle at center, #27ADF5 1px, transparent 1px)", backgroundSize: "16px 16px" }}
          />
        </div>

        <div className="relative px-6 pb-10 md:px-10">
          <div className="-mt-16 mb-8 flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <div className="flex items-end gap-6">
              <div className="flex h-32 w-32 shrink-0 items-center justify-center overflow-hidden rounded-2xl border-4 border-white bg-white shadow-md">
                {clinic.logoUrl ? (
                  <img src={clinic.logoUrl} alt={clinic.name} className="h-full w-full object-cover" />
                ) : (
                  <Building2 className="h-16 w-16 text-[#27ADF5]" />
                )}
              </div>
              <div className="pb-2">
                <h1 className="text-3xl font-bold tracking-tight text-foreground md:text-4xl">{clinic.name}</h1>
                <p className="mt-1 flex items-center text-lg font-medium text-[#27ADF5]">
                  <MapPin className="mr-1 h-5 w-5" />
                  {clinic.city || "Ciudad no especificada"}
                </p>
              </div>
            </div>

          </div>

          <div className="grid gap-8 md:grid-cols-3">
            <div className="space-y-8 md:col-span-2">
              <section>
                <h2 className="mb-4 text-xl font-bold text-foreground">Sobre la clinica</h2>
                <div className="max-w-none text-muted-foreground">
                  <p>
                    {clinic.name} es una clinica veterinaria comprometida con el bienestar de tus mascotas. Ofrecemos servicios integrales de salud animal con un equipo de profesionales altamente calificados.
                  </p>
                </div>
              </section>

              <section>
                <h2 className="mb-4 text-xl font-bold text-foreground">Especialidades</h2>
                <div className="flex flex-wrap gap-2">
                  {(clinic.specialties.length > 0 ? clinic.specialties : ["Medicina General", "Vacunacion", "Cirugia"]).map((specialty) => (
                    <span key={specialty} className="inline-flex items-center rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-sm font-medium text-sky-700">
                      {specialty}
                    </span>
                  ))}
                </div>
              </section>

              <section>
                <h2 className="mb-4 text-xl font-bold text-foreground">Equipo medico</h2>
                {veterinarians.length > 0 ? (
                  <div className="grid gap-4 sm:grid-cols-2">
                    {veterinarians.map((vet) => (
                      <div key={vet.id} className="flex items-center gap-3 rounded-lg border border-border bg-secondary p-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-sky-50">
                          <Stethoscope className="h-5 w-5 text-[#27ADF5]" />
                        </div>
                        <div>
                          <p className="font-medium text-foreground">{vet.name}</p>
                          <p className="text-xs text-muted-foreground">Veterinario</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground">El equipo medico no esta publicado actualmente.</p>
                )}
              </section>
            </div>

            <div className="space-y-6">
              <PortalClinicRequestForm clinicId={clinic.id} clinicName={clinic.name} pets={myPets} veterinarians={veterinarians} />

              <div className="rounded-xl border border-border bg-secondary p-6">
                <h3 className="mb-4 flex items-center font-semibold text-foreground">
                  <MapPin className="mr-2 h-5 w-5 text-[#27ADF5]" />
                  Ubicacion
                </h3>
                <p className="text-sm text-foreground">{clinic.address || "Direccion no especificada"}</p>
                {clinic.city ? <p className="mt-1 text-sm text-muted-foreground">{clinic.city}</p> : null}
              </div>

              <div className="rounded-xl border border-border bg-secondary p-6">
                <h3 className="mb-4 flex items-center font-semibold text-foreground">
                  <Phone className="mr-2 h-5 w-5 text-[#27ADF5]" />
                  Contacto
                </h3>
                <p className="text-sm text-foreground">{clinic.phone || "No disponible"}</p>
              </div>

              <div className="rounded-xl border border-border bg-secondary p-6">
                <h3 className="mb-4 flex items-center font-semibold text-foreground">
                  <Clock className="mr-2 h-5 w-5 text-[#27ADF5]" />
                  Horarios
                </h3>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <div className="flex justify-between">
                    <span>Lunes - Viernes</span>
                    <span className="font-medium text-foreground">8:00 AM - 6:00 PM</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Sabados</span>
                    <span className="font-medium text-foreground">9:00 AM - 2:00 PM</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>Domingos</span>
                    <span>Cerrado</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
