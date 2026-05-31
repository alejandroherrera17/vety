import { Suspense } from "react";
import Link from "next/link";
import { Activity, HeartPulse, ShieldCheck, Sparkles, Stethoscope } from "lucide-react";
import { LoginForm } from "@/components/auth-forms";

export default function LoginPage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-white text-foreground">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_18%,rgba(14,165,233,0.22),transparent_30%),radial-gradient(circle_at_84%_8%,rgba(39,173,245,0.18),transparent_28%),linear-gradient(135deg,rgba(255,255,255,0.05),transparent_38%)]" />
      <section className="relative mx-auto grid min-h-screen w-full max-w-6xl grid-cols-1 items-center gap-8 px-5 py-10 lg:grid-cols-[0.9fr_1.1fr] lg:px-8">
        <div className="hidden lg:block">
          <div className="flex items-center gap-3">
            <div className="grid h-12 w-12 place-items-center rounded-lg border border-sky-200/25 bg-sky-300/10 shadow-[0_0_42px_rgba(39,173,245,0.2)]">
              <Stethoscope className="h-6 w-6 text-[#27ADF5]" />
            </div>
            <div>
              <p className="text-xl font-semibold tracking-tight">VettiPets</p>
              <p className="text-xs uppercase tracking-[0.32em] text-sky-700/80">Gestion clinica</p>
            </div>
          </div>

          <div className="mt-16 max-w-xl">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-border bg-white px-3 py-1 text-xs font-semibold text-[#27ADF5] backdrop-blur-xl">
              <Sparkles className="h-3.5 w-3.5" />
              Operacion clinica en tiempo real
            </div>
            <h1 className="text-5xl font-semibold leading-[1.02] tracking-tight">
              Bienvenido de vuelta a tu clinica inteligente
            </h1>
            <p className="mt-5 max-w-lg text-base leading-7 text-muted-foreground">
              Retoma agenda, pacientes e historia clinica con una interfaz segura,
              rapida y lista para equipos veterinarios modernos.
            </p>
            <div className="mt-7 flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-xs font-semibold text-sky-700">
                Acceso de clinica
              </span>
              <Link
                href="/portal/login"
                className="inline-flex items-center rounded-full border border-border bg-white px-3 py-1 text-xs font-medium text-muted-foreground transition hover:border-sky-200 hover:text-foreground"
              >
                Ir al portal de cliente
              </Link>
            </div>
          </div>

          <div className="mt-10 grid max-w-xl grid-cols-2 gap-3">
            {[
              ["99.9%", "Disponibilidad del workspace", ShieldCheck],
              ["Live", "Agenda y pacientes sincronizados", Activity],
              ["360", "Vision clinica por paciente", HeartPulse],
              ["8", "Interfaz blanca y azul", Sparkles],
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
              <Stethoscope className="h-5 w-5 text-[#27ADF5]" />
            </div>
            <div>
              <p className="text-lg font-semibold">VettiPets</p>
              <p className="text-xs text-muted-foreground">Gestion clinica</p>
            </div>
          </div>

          <div className="rounded-lg border border-border bg-white p-5 shadow-2xl shadow-sky-950/10 backdrop-blur-2xl sm:p-8">
            <div className="mb-6">
              <p className="text-sm font-semibold text-[#27ADF5]">Acceso seguro</p>
              <h2 className="mt-2 text-3xl font-semibold tracking-tight">Iniciar sesion</h2>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
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
