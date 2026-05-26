import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { Building2, MapPin, Phone, Clock, Stethoscope, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { PortalAppointmentRequestModal } from "@/components/portal/portal-appointment-request-modal";

export default async function ClinicDetailPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.id) {
    return null;
  }

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

  if (!clinic) {
    notFound();
  }

  const myPets = await prisma.pet.findMany({
    where: { clientId: session.user.id },
    select: { id: true, name: true, species: true },
  });

  const veterinarians = clinic.users.map(u => ({ id: u.veterinarianId as string, name: u.name }));

  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto space-y-6">
      <Link href="/portal/clinics" className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-sky-600 transition-colors">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Volver al directorio
      </Link>

      <div className="bg-white dark:bg-surface border border-slate-200 dark:border-border rounded-2xl overflow-hidden shadow-sm">
        <div className="h-48 md:h-64 bg-sky-100 dark:bg-sky-900/30 relative">
           <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,#27ADF5_1px,transparent_1px)] opacity-10" style={{ backgroundSize: '16px 16px' }} />
        </div>
        
        <div className="px-6 md:px-10 pb-10 relative">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 -mt-16 relative z-10 mb-8">
            <div className="flex items-end gap-6">
              <div className="h-32 w-32 rounded-2xl bg-white dark:bg-surface border-4 border-white dark:border-surface shadow-md flex items-center justify-center overflow-hidden shrink-0">
                {clinic.logoUrl ? (
                  <img src={clinic.logoUrl} alt={clinic.name} className="w-full h-full object-cover" />
                ) : (
                  <Building2 className="h-16 w-16 text-sky-600 dark:text-sky-400" />
                )}
              </div>
              <div className="pb-2">
                <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-900 dark:text-foreground">{clinic.name}</h1>
                <p className="text-lg text-sky-600 dark:text-sky-400 font-medium flex items-center mt-1">
                  <MapPin className="h-5 w-5 mr-1" />
                  {clinic.city || "Ciudad no especificada"}
                </p>
              </div>
            </div>
            
            <div className="flex-shrink-0 w-full md:w-auto">
              <PortalAppointmentRequestModal 
                clinicId={clinic.id} 
                clinicName={clinic.name} 
                pets={myPets}
                veterinarians={veterinarians}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-2 space-y-8">
              <section>
                <h2 className="text-xl font-bold text-slate-900 dark:text-foreground mb-4">Sobre la Clínica</h2>
                <div className="prose dark:prose-invert max-w-none text-slate-600 dark:text-slate-300">
                  <p>
                    {clinic.name} es una clínica veterinaria comprometida con el bienestar de tus mascotas. 
                    Ofrecemos servicios integrales de salud animal con un equipo de profesionales altamente calificados.
                  </p>
                </div>
              </section>

              <section>
                <h2 className="text-xl font-bold text-slate-900 dark:text-foreground mb-4">Especialidades</h2>
                <div className="flex flex-wrap gap-2">
                  {(clinic.specialties.length > 0 ? clinic.specialties : ["Medicina General", "Vacunación", "Cirugía"]).map((spec, i) => (
                    <span key={i} className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-sky-50 dark:bg-sky-500/10 text-sky-700 dark:text-sky-400 border border-sky-100 dark:border-sky-500/20">
                      {spec}
                    </span>
                  ))}
                </div>
              </section>
              
              <section>
                <h2 className="text-xl font-bold text-slate-900 dark:text-foreground mb-4">Equipo Médico</h2>
                {veterinarians.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {veterinarians.map(vet => (
                      <div key={vet.id} className="flex items-center gap-3 p-3 rounded-lg border border-slate-100 dark:border-border bg-slate-50 dark:bg-surface-hover">
                        <div className="h-10 w-10 rounded-full bg-sky-100 dark:bg-sky-900/30 flex items-center justify-center shrink-0">
                          <Stethoscope className="h-5 w-5 text-sky-600 dark:text-sky-400" />
                        </div>
                        <div>
                          <p className="font-medium text-slate-900 dark:text-foreground">{vet.name}</p>
                          <p className="text-xs text-slate-500">Veterinario</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-slate-500">El equipo médico no está publicado actualmente.</p>
                )}
              </section>
            </div>

            <div className="space-y-6">
              <div className="bg-slate-50 dark:bg-surface-hover rounded-xl p-6 border border-slate-100 dark:border-border">
                <h3 className="font-semibold text-slate-900 dark:text-foreground mb-4 flex items-center">
                  <MapPin className="h-5 w-5 mr-2 text-sky-500" />
                  Ubicación
                </h3>
                <p className="text-slate-600 dark:text-slate-300 text-sm">
                  {clinic.address || "Dirección no especificada"}
                </p>
                {clinic.city && (
                  <p className="text-slate-500 text-sm mt-1">{clinic.city}</p>
                )}
              </div>

              <div className="bg-slate-50 dark:bg-surface-hover rounded-xl p-6 border border-slate-100 dark:border-border">
                <h3 className="font-semibold text-slate-900 dark:text-foreground mb-4 flex items-center">
                  <Phone className="h-5 w-5 mr-2 text-sky-500" />
                  Contacto
                </h3>
                <p className="text-slate-600 dark:text-slate-300 text-sm">
                  {clinic.phone || "No disponible"}
                </p>
              </div>

              <div className="bg-slate-50 dark:bg-surface-hover rounded-xl p-6 border border-slate-100 dark:border-border">
                <h3 className="font-semibold text-slate-900 dark:text-foreground mb-4 flex items-center">
                  <Clock className="h-5 w-5 mr-2 text-sky-500" />
                  Horarios
                </h3>
                <div className="space-y-2 text-sm text-slate-600 dark:text-slate-300">
                  <div className="flex justify-between">
                    <span>Lunes - Viernes</span>
                    <span className="font-medium">8:00 AM - 6:00 PM</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Sábados</span>
                    <span className="font-medium">9:00 AM - 2:00 PM</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
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
