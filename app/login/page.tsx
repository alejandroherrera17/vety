import { Suspense } from "react";
import { Activity, HeartPulse, ShieldCheck, Sparkles, Stethoscope } from "lucide-react";
import { LoginForm } from "@/components/auth-forms";

export default function LoginPage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#030711] text-white">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_18%,rgba(14,165,233,0.22),transparent_30%),radial-gradient(circle_at_84%_8%,rgba(16,185,129,0.18),transparent_28%),linear-gradient(135deg,rgba(255,255,255,0.05),transparent_38%)]" />
      <section className="relative mx-auto grid min-h-screen w-full max-w-6xl grid-cols-1 items-center gap-8 px-5 py-10 lg:grid-cols-[0.9fr_1.1fr] lg:px-8">
        <div className="hidden lg:block">
          <div className="flex items-center gap-3">
            <div className="grid h-12 w-12 place-items-center rounded-lg border border-emerald-200/25 bg-emerald-300/10 shadow-[0_0_42px_rgba(52,211,153,0.2)]">
              <Stethoscope className="h-6 w-6 text-emerald-100" />
            </div>
            <div>
              <p className="text-xl font-semibold tracking-tight">VetyCare</p>
              <p className="text-xs uppercase tracking-[0.32em] text-emerald-100/70">Veterinary OS</p>
            </div>
          </div>

          <div className="mt-16 max-w-xl">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.06] px-3 py-1 text-xs font-semibold text-emerald-100 backdrop-blur-xl">
              <Sparkles className="h-3.5 w-3.5" />
              Operacion clinica en tiempo real
            </div>
            <h1 className="text-5xl font-semibold leading-[1.02] tracking-tight">
              Bienvenido de vuelta a tu clinica inteligente
            </h1>
            <p className="mt-5 max-w-lg text-base leading-7 text-slate-300">
              Retoma agenda, pacientes e historia clinica con una interfaz segura,
              rapida y lista para equipos veterinarios modernos.
            </p>
          </div>

          <div className="mt-10 grid max-w-xl grid-cols-2 gap-3">
            {[
              ["99.9%", "Disponibilidad del workspace", ShieldCheck],
              ["Live", "Agenda y pacientes sincronizados", Activity],
              ["360", "Vision clinica por paciente", HeartPulse],
              ["8", "Interfaz verde veterinaria", Sparkles],
            ].map(([value, label, Icon]) => (
              <div key={label as string} className="rounded-lg border border-white/10 bg-white/[0.06] p-4 backdrop-blur-xl">
                <Icon className="h-4 w-4 text-emerald-100" />
                <p className="mt-5 text-2xl font-semibold">{value as string}</p>
                <p className="mt-1 text-xs text-slate-400">{label as string}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="mx-auto w-full max-w-[500px]">
          <div className="mb-8 flex items-center gap-3 lg:hidden">
            <div className="grid h-11 w-11 place-items-center rounded-lg border border-emerald-200/25 bg-emerald-300/10">
              <Stethoscope className="h-5 w-5 text-emerald-100" />
            </div>
            <div>
              <p className="text-lg font-semibold">VetyCare</p>
              <p className="text-xs text-slate-400">Veterinary OS</p>
            </div>
          </div>

          <div className="rounded-lg border border-white/12 bg-white/[0.075] p-5 shadow-2xl shadow-black/35 backdrop-blur-2xl sm:p-8">
            <div className="mb-6">
              <p className="text-sm font-semibold text-emerald-100">Acceso seguro</p>
              <h2 className="mt-2 text-3xl font-semibold tracking-tight">Iniciar sesion</h2>
              <p className="mt-2 text-sm leading-6 text-slate-300">
                Entra al workspace privado de tu clinica.
              </p>
            </div>
            <Suspense>
              <LoginForm />
            </Suspense>
          </div>
        </div>
      </section>
    </main>
  );
}
