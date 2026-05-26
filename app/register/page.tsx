import {
  Activity,
  CalendarDays,
  CircleDollarSign,
  HeartPulse,
  ShieldCheck,
  Sparkles,
  Stethoscope,
} from "lucide-react";
import { RegisterForm } from "@/components/auth-forms";

const metrics = [
  { label: "Citas hoy", value: "32", icon: CalendarDays },
  { label: "Historias", value: "1.284", icon: HeartPulse },
  { label: "Facturado", value: "$18.6M", icon: CircleDollarSign },
];

const themeNames = [
  "Azul clinico",
  "Blanco y azul clinico",
  "Morado premium",
  "Dark graphite",
  "Minimal blanco",
  "Emerald tech",
  "Ocean blue",
  "Midnight neon",
];

export default function RegisterPage() {
  return (
    <main className="min-h-screen overflow-hidden bg-white text-foreground">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_18%,rgba(14,165,233,0.22),transparent_30%),radial-gradient(circle_at_84%_8%,rgba(39,173,245,0.18),transparent_28%),linear-gradient(135deg,rgba(255,255,255,0.05),transparent_38%)]" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-sky-200/40 to-transparent" />

      <section className="relative mx-auto grid min-h-screen w-full max-w-7xl grid-cols-1 lg:grid-cols-[1.08fr_0.92fr]">
        <aside className="relative hidden min-h-screen flex-col justify-between border-r border-border px-10 py-9 lg:flex">
          <div>
            <div className="flex items-center gap-3">
              <div className="grid h-12 w-12 place-items-center rounded-lg border border-sky-200/25 bg-sky-300/10 shadow-[0_0_42px_rgba(39,173,245,0.2)]">
                <Stethoscope className="h-6 w-6 text-[#147fba]" />
              </div>
              <div>
                <p className="text-xl font-semibold tracking-tight">VettiPets</p>
                <p className="text-xs uppercase tracking-[0.32em] text-[#147fba]/70">
                  Gestion clinica
                </p>
              </div>
            </div>

            <div className="mt-20 max-w-2xl">
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-border bg-white px-3 py-1 text-xs font-semibold text-[#147fba] backdrop-blur-xl">
                <Sparkles className="h-3.5 w-3.5" />
                SaaS inteligente para equipos veterinarios
              </div>
              <h2 className="max-w-xl text-5xl font-semibold leading-[1.02] tracking-tight text-foreground">
                La plataforma inteligente para clinicas veterinarias modernas
              </h2>
              <p className="mt-5 max-w-lg text-base leading-7 text-muted-foreground">
                Agenda, pacientes, historia clinica y operaciones en un entorno
                rapido, seguro y personalizable para clinicas reales.
              </p>
            </div>
          </div>

          <div className="relative mb-4 mt-12">
            <div className="absolute -left-8 -top-8 h-40 w-40 rounded-full bg-sky-400/10 blur-3xl" />
            <div className="absolute -right-6 bottom-6 h-48 w-48 rounded-full bg-sky-400/10 blur-3xl" />

            <div className="relative rounded-lg border border-border bg-white p-4 shadow-2xl shadow-sky-950/10 backdrop-blur-2xl">
              <div className="flex items-center justify-between border-b border-border pb-4">
                <div>
                  <p className="text-sm font-semibold text-foreground">Dashboard clinico</p>
                  <p className="text-xs text-muted-foreground">Clinica Norte - Jornada activa</p>
                </div>
                <div className="rounded-full border border-sky-300/25 bg-sky-300/10 px-3 py-1 text-xs font-semibold text-[#147fba]">
                  En vivo
                </div>
              </div>

              <div className="mt-4 grid grid-cols-3 gap-3">
                {metrics.map((metric) => {
                  const Icon = metric.icon;
                  return (
                    <div
                      key={metric.label}
                      className="rounded-lg border border-border bg-[#06111f]/80 p-3"
                    >
                      <Icon className="mb-5 h-4 w-4 text-[#147fba]" />
                      <p className="text-2xl font-semibold tracking-tight">{metric.value}</p>
                      <p className="mt-1 text-xs text-muted-foreground">{metric.label}</p>
                    </div>
                  );
                })}
              </div>

              <div className="mt-3 grid grid-cols-[1fr_0.8fr] gap-3">
                <div className="rounded-lg border border-border bg-[#06111f]/80 p-4">
                  <div className="mb-4 flex items-center justify-between">
                    <p className="text-sm font-semibold">Flujo de pacientes</p>
                    <Activity className="h-4 w-4 text-[#147fba]" />
                  </div>
                  <div className="flex h-28 items-end gap-2">
                    {[48, 72, 44, 86, 62, 95, 76, 88].map((height, index) => (
                      <div
                        key={index}
                        className="w-full rounded-t bg-gradient-to-t from-sky-400/30 to-sky-200"
                        style={{ height: `${height}%` }}
                      />
                    ))}
                  </div>
                </div>

                <div className="rounded-lg border border-border bg-[#06111f]/80 p-4">
                  <p className="text-sm font-semibold">Tema verde veterinario</p>
                  <div className="mt-4 grid grid-cols-2 gap-2">
                    {themeNames.slice(0, 6).map((theme, index) => (
                      <span
                        key={theme}
                        className="h-7 rounded-md border border-border bg-secondary px-2 py-1 text-[10px] text-muted-foreground"
                      >
                        {index + 1}. {theme}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="absolute -right-5 -top-5 w-56 rounded-lg border border-sky-200/20 bg-[#071321]/90 p-4 shadow-2xl shadow-sky-950/40 backdrop-blur-xl">
              <div className="flex items-start gap-3">
                <div className="grid h-9 w-9 place-items-center rounded-lg bg-sky-300/12 text-[#147fba]">
                  <ShieldCheck className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-sm font-semibold">Acceso protegido</p>
                  <p className="mt-1 text-xs leading-5 text-muted-foreground">
                    Datos clinicos aislados por workspace.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </aside>

        <div className="flex min-h-screen items-center px-5 py-8 sm:px-8 lg:px-12">
          <div className="mx-auto w-full max-w-[520px]">
            <div className="mb-8 flex items-center gap-3 lg:hidden">
              <div className="grid h-11 w-11 place-items-center rounded-lg border border-sky-200/25 bg-sky-300/10">
                <Stethoscope className="h-5 w-5 text-[#147fba]" />
              </div>
              <div>
                <p className="text-lg font-semibold">VettiPets</p>
                <p className="text-xs text-muted-foreground">Gestion clinica</p>
              </div>
            </div>

            <div className="rounded-lg border border-border bg-white p-5 shadow-2xl shadow-sky-950/10 backdrop-blur-2xl sm:p-8">
              <RegisterForm />
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
