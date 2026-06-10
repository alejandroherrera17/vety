import { PawPrint, ShieldCheck, Sparkles, Stethoscope } from "lucide-react";
import { cn } from "@/lib/utils";

type AuthModeBannerProps = {
  mode: "clinic" | "client";
  flow: "login" | "register";
  className?: string;
};

const configs = {
  clinic: {
    icon: Stethoscope,
    eyebrow: {
      login: "Acceso de clinica",
      register: "Registro de clinica",
    },
    title: {
      login: "Entra al panel privado de tu veterinaria",
      register: "Crea el workspace de tu clinica",
    },
    description: {
      login: "Agenda, pacientes, historia clinica y equipo en una sola pantalla.",
      register: "Configura tu veterinaria para operar con agenda, historias y clientes desde el primer dia.",
    },
    chips: {
      login: ["Agenda activa", "Pacientes", "Historias"],
      register: ["Workspace", "Equipo", "Seguridad"],
    },
  },
  client: {
    icon: PawPrint,
    eyebrow: {
      login: "Acceso de cliente",
      register: "Registro de cliente",
    },
    title: {
      login: "Entra a tu portal personal",
      register: "Crea tu acceso gratuito",
    },
    description: {
      login: "Revisa mascotas, solicitudes y respuestas de la clinica sin confusiones.",
      register: "Registra tu cuenta y empieza a seguir la salud de tus mascotas en un solo lugar.",
    },
    chips: {
      login: ["Mascotas", "Citas", "Historial"],
      register: ["Gratis", "Solicitudes", "Seguimiento"],
    },
  },
} as const;

export function AuthModeBanner({ mode, flow, className }: AuthModeBannerProps) {
  const config = configs[mode];
  const Icon = config.icon;
  const chips = config.chips[flow];

  return (
    <div
      className={cn(
        "rounded-2xl border border-border bg-white p-4 shadow-2xl shadow-sky-950/10",
        mode === "clinic" ? "ring-1 ring-[#27ADF5]/10" : "ring-1 ring-sky-200/20",
        className,
      )}
    >
      <div className="flex items-start gap-3">
        <div
          className={cn(
            "grid h-12 w-12 shrink-0 place-items-center rounded-xl border",
            mode === "clinic"
              ? "border-sky-200/25 bg-sky-300/10 text-[#27ADF5]"
              : "border-sky-200/25 bg-sky-50 text-[#27ADF5]",
          )}
        >
          <Icon className="h-6 w-6" />
        </div>
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#27ADF5]/80">
            {config.eyebrow[flow]}
          </p>
          <h1 className="mt-1 text-xl font-semibold leading-tight text-foreground">{config.title[flow]}</h1>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">{config.description[flow]}</p>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {chips.map((chip) => (
          <span
            key={chip}
            className="inline-flex items-center rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-[11px] font-semibold text-sky-700"
          >
            <ShieldCheck className="mr-1 h-3 w-3" />
            {chip}
          </span>
        ))}
      </div>
    </div>
  );
}
