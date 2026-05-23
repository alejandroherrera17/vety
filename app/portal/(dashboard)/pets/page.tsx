import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PortalPetFormModal } from "@/components/portal/portal-pet-form-modal";

export default async function PortalPetsPage() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.id) {
    return null;
  }

  const pets = await prisma.pet.findMany({
    where: { clientId: session.user.id },
    include: {
      vaccinations: true,
      appointments: {
        where: { startDate: { gte: new Date() } },
        orderBy: { startDate: "asc" },
        take: 1
      }
    }
  });

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Mis Mascotas</h1>
          <p className="text-slate-500 mt-1">Gestiona el perfil, vacunas y citas de tus peludos.</p>
        </div>
        <PortalPetFormModal />
      </div>

      {pets.length === 0 ? (
        <div className="bg-white dark:bg-surface border border-slate-200 dark:border-border rounded-xl p-12 text-center shadow-sm">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-500/10 mb-4">
            <Info className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
          </div>
          <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">Aún no tienes mascotas registradas</h3>
          <p className="text-slate-500 max-w-sm mx-auto mb-6">
            Añade a tu primera mascota para empezar a llevar su control médico y solicitar citas en nuestras clínicas afiliadas.
          </p>
          <PortalPetFormModal />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {pets.map((pet) => (
            <div key={pet.id} className="bg-white dark:bg-surface border border-slate-200 dark:border-border rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow group">
              <div className="h-32 bg-emerald-100 dark:bg-emerald-900/20 relative">
                {/* Fallback pattern for pet image */}
                <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,theme(colors.emerald.500)_1px,transparent_1px)]" style={{ backgroundSize: '12px 12px' }} />
                {pet.photoUrl && (
                  <img src={pet.photoUrl} alt={pet.name} className="w-full h-full object-cover" />
                )}
              </div>
              <div className="p-5 relative">
                <div className="absolute -top-10 left-5 h-20 w-20 bg-white dark:bg-surface rounded-full p-1 border-4 border-white dark:border-surface shadow-md flex items-center justify-center overflow-hidden">
                  {pet.photoUrl ? (
                    <img src={pet.photoUrl} alt={pet.name} className="w-full h-full object-cover rounded-full" />
                  ) : (
                    <span className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{pet.name.charAt(0)}</span>
                  )}
                </div>
                
                <div className="mt-10">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-xl font-semibold text-slate-900 dark:text-white">{pet.name}</h3>
                      <p className="text-sm text-slate-500 capitalize">{pet.species} {pet.breed ? `• ${pet.breed}` : ""}</p>
                    </div>
                    <span className="inline-flex items-center rounded-full bg-emerald-50 dark:bg-emerald-500/10 px-2.5 py-0.5 text-xs font-medium text-emerald-700 dark:text-emerald-400">
                      {pet.sex}
                    </span>
                  </div>

                  <div className="mt-6 space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500">Próxima cita:</span>
                      <span className="font-medium text-slate-900 dark:text-white">
                        {pet.appointments.length > 0 
                          ? new Date(pet.appointments[0].startDate).toLocaleDateString()
                          : "Ninguna programada"}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500">Vacunas:</span>
                      <span className="font-medium text-slate-900 dark:text-white">{pet.vaccinations.length} registradas</span>
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-slate-100 dark:border-border">
                    <Button variant="outline" className="w-full border-emerald-200 dark:border-emerald-500/20 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400">
                      Ver Historial
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
