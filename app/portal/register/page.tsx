import { Suspense } from "react";
import { HeartPulse, Sparkles, Activity, ShieldCheck, PawPrint } from "lucide-react";
import { PortalRegisterForm } from "@/components/portal/auth-forms";

export default function PortalRegisterPage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-white text-foreground">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_18%,rgba(39,173,245,0.15),transparent_30%),radial-gradient(circle_at_84%_8%,rgba(39,173,245,0.1),transparent_28%),linear-gradient(135deg,rgba(255,255,255,0.03),transparent_38%)]" />
      <section className="relative mx-auto grid min-h-screen w-full max-w-6xl grid-cols-1 items-center gap-8 px-5 py-10 lg:grid-cols-[0.9fr_1.1fr] lg:px-8">
        <div className="hidden lg:block">
          <div className="flex items-center gap-3">
            <div className="grid h-12 w-12 place-items-center rounded-lg border border-sky-200/25 bg-sky-300/10 shadow-[0_0_42px_rgba(39,173,245,0.2)]">
              <PawPrint className="h-6 w-6 text-[#27ADF5]" />
            </div>
            <div>
              <p className="text-xl font-semibold tracking-tight">VettiPets Portal</p>
              <p className="text-xs uppercase tracking-[0.32em] text-[#147fba]/70">Para Dueños</p>
            </div>
          </div>

          <div className="mt-16 max-w-xl">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-border bg-white px-3 py-1 text-xs font-semibold text-[#147fba] backdrop-blur-xl">
              <Sparkles className="h-3.5 w-3.5" />
              Únete a la red
            </div>
            <h1 className="text-5xl font-semibold leading-[1.02] tracking-tight">
              Crea tu cuenta gratuita
            </h1>
            <p className="mt-5 max-w-lg text-base leading-7 text-muted-foreground">
              Registra a tus mascotas, solicita citas y mantén su historia clínica al día.
            </p>
          </div>

          <div className="mt-10 grid max-w-xl grid-cols-2 gap-3">
            {[
              ["Historial", "Accede a las vacunas de tu mascota", ShieldCheck],
              ["Citas", "Reserva fácilmente en línea", Activity],
              ["Clínicas", "Encuentra la mejor atención", HeartPulse],
              ["100%", "Gratis para siempre", Sparkles],
            ].map(([value, label, Icon]) => (
              <div key={label as string} className="rounded-lg border border-border bg-white p-4 backdrop-blur-xl">
                <Icon className="h-4 w-4 text-[#27ADF5]" />
                <p className="mt-5 text-2xl font-semibold">{value as string}</p>
                <p className="mt-1 text-xs text-muted-foreground">{label as string}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="mx-auto w-full max-w-[500px]">
          <div className="mb-8 flex items-center gap-3 lg:hidden">
            <div className="grid h-11 w-11 place-items-center rounded-lg border border-sky-200/25 bg-sky-300/10">
              <PawPrint className="h-5 w-5 text-[#27ADF5]" />
            </div>
            <div>
              <p className="text-lg font-semibold">VettiPets Portal</p>
              <p className="text-xs text-muted-foreground">Para Dueños</p>
            </div>
          </div>

          <div className="rounded-lg border border-border bg-white p-5 shadow-2xl shadow-sky-950/10 backdrop-blur-2xl sm:p-8">
            <div className="mb-6">
              <p className="text-sm font-semibold text-[#27ADF5]">Registro</p>
              <h2 className="mt-2 text-3xl font-semibold tracking-tight">Crear Cuenta</h2>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Únete a la plataforma para gestionar a tus mascotas.
              </p>
            </div>
            <Suspense>
              <PortalRegisterForm />
            </Suspense>
          </div>
        </div>
      </section>
    </main>
  );
}
