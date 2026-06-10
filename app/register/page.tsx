import {
  Activity,
  CalendarDays,
  CircleDollarSign,
  HeartPulse,
  ShieldCheck,
  Sparkles,
  Stethoscope,
} from "lucide-react";
import Link from "next/link";
import { AuthModeBanner } from "@/components/auth-mode-banner";
import { RegisterForm } from "@/components/auth-forms";

const metrics = [
  { label: "Citas hoy", value: "32", icon: CalendarDays },
  { label: "Historias", value: "1.284", icon: HeartPulse },
  { label: "Facturado", value: "$18.6M", icon: CircleDollarSign },
];

const clinicHighlights = [
  "Agenda activa",
  "Pacientes",
  "Historias",
  "Facturacion",
  "Recordatorios",
  "Equipo clinico",
  "Turnos",
  "Panel seguro",
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
                <Stethoscope className="h-6 w-6 text-[#27ADF5]" />
              </div>
            <div>
              <p className="text-xl font-semibold tracking-tight">VettiPets</p>
              <p className="text-xs uppercase tracking-[0.32em] text-sky-700/80">
                Gestion clinica
              </p>
              </div>
            </div>

            <div className="mt-20 max-w-2xl">
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-border bg-white px-3 py-1 text-xs font-semibold text-[#27ADF5] backdrop-blur-xl">
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
              <div className="mt-7 flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-xs font-semibold text-sky-700">
                  Registro de clinica
                </span>
                <Link
                  href="/portal/register"
                  className="inline-flex items-center rounded-full border border-border bg-white px-3 py-1 text-xs font-medium text-muted-foreground transition hover:border-sky-200 hover:text-foreground"
                >
                  Registrarme como cliente
                </Link>
              </div>
            </div>
          </div>

          <div className="relative mb-4 mt-12">
            <div className="absolute -left-8 -top-8 h-40 w-40 rounded-full bg-sky-400/10 blur-3xl" />
            <div className="absolute -right-6 bottom-6 h-48 w-48 rounded-full bg-sky-400/10 blur-3xl" />

            <div className="relative rounded-lg border border-border bg-white p-4 shadow-xl shadow-sky-950/5 backdrop-blur-2xl">
              <div className="flex items-center justify-between border-b border-border pb-4">
                <div>
                  <p className="text-sm font-semibold text-foreground">Dashboard clinico</p>
                  <p className="text-xs text-muted-foreground">Clinica Norte - Jornada activa</p>
                </div>
                <div className="rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-xs font-semibold text-sky-700">
                  En vivo
                </div>
              </div>

              <div className="mt-4 grid grid-cols-3 gap-3">
                {metrics.map((metric) => {
                  const Icon = metric.icon;
                  return (
                    <div
                      key={metric.label}
                      className="rounded-lg border border-border bg-white p-3 shadow-sm"
                    >
                      <Icon className="mb-5 h-4 w-4 text-[#27ADF5]" />
                      <p className="text-2xl font-semibold tracking-tight">{metric.value}</p>
                      <p className="mt-1 text-xs text-muted-foreground">{metric.label}</p>
                    </div>
                  );
                })}
              </div>

              <div className="mt-3 grid grid-cols-[1fr_0.8fr] gap-3">
                <div className="rounded-lg border border-border bg-white p-4 shadow-sm">
                  <div className="mb-4 flex items-center justify-between">
                    <p className="text-sm font-semibold">Flujo de pacientes</p>
                    <Activity className="h-4 w-4 text-[#27ADF5]" />
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

                <div className="rounded-lg border border-border bg-white p-4 shadow-sm">
                  <p className="text-sm font-semibold">Workspace de clinica</p>
                  <div className="mt-4 grid grid-cols-2 gap-2">
                    {clinicHighlights.slice(0, 6).map((highlight) => (
                      <span
                        key={highlight}
                        className="rounded-md border border-sky-200 bg-sky-50 px-2 py-2 text-[11px] font-medium text-sky-700"
                      >
                        {highlight}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="absolute -right-5 -top-5 w-56 rounded-lg border border-sky-200 bg-white p-4 shadow-xl shadow-sky-950/10 backdrop-blur-xl">
              <div className="flex items-start gap-3">
                <div className="grid h-9 w-9 place-items-center rounded-lg bg-sky-50 text-[#27ADF5]">
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
            <AuthModeBanner mode="clinic" flow="register" className="mb-5 lg:hidden" />

            <div className="rounded-lg border border-border bg-white p-5 shadow-2xl shadow-sky-950/10 backdrop-blur-2xl sm:p-8">
              <RegisterForm />
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
