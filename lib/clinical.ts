import {
  Activity,
  AlertTriangle,
  Bath,
  Beaker,
  Bone,
  CalendarClock,
  Camera,
  FileImage,
  FileText,
  HeartPulse,
  Hotel,
  Pill,
  Scissors,
  ShieldCheck,
  Stethoscope,
  Syringe,
} from "lucide-react";

export const eventTypes = [
  "consulta",
  "vacunacion",
  "cirugia",
  "hospitalizacion",
  "examen",
  "desparasitacion",
  "peluqueria",
  "bano",
  "receta",
  "laboratorio",
  "imagenes",
  "emergencia",
] as const;

export type ClinicalEventType = (typeof eventTypes)[number];
export type ClinicalStatus = "open" | "stable" | "critical" | "closed" | "scheduled";

export const eventMeta: Record<ClinicalEventType, { label: string; icon: typeof Stethoscope; tone: string }> = {
  consulta: { label: "Consulta", icon: Stethoscope, tone: "bg-sky-50 text-sky-700 ring-sky-200" },
  vacunacion: { label: "Vacunacion", icon: Syringe, tone: "bg-sky-50 text-sky-700 ring-sky-200" },
  cirugia: { label: "Cirugia", icon: Activity, tone: "bg-rose-50 text-rose-700 ring-rose-200" },
  hospitalizacion: { label: "Hospitalizacion", icon: Hotel, tone: "bg-violet-50 text-violet-700 ring-violet-200" },
  examen: { label: "Examen", icon: Beaker, tone: "bg-amber-50 text-amber-700 ring-amber-200" },
  desparasitacion: { label: "Desparasitacion", icon: ShieldCheck, tone: "bg-lime-50 text-lime-700 ring-lime-200" },
  peluqueria: { label: "Peluqueria", icon: Scissors, tone: "bg-fuchsia-50 text-fuchsia-700 ring-fuchsia-200" },
  bano: { label: "Bano", icon: Bath, tone: "bg-cyan-50 text-cyan-700 ring-cyan-200" },
  receta: { label: "Receta", icon: Pill, tone: "bg-indigo-50 text-indigo-700 ring-indigo-200" },
  laboratorio: { label: "Laboratorio", icon: FileText, tone: "bg-orange-50 text-orange-700 ring-orange-200" },
  imagenes: { label: "Imagenes", icon: FileImage, tone: "bg-sky-50 text-sky-700 ring-sky-200" },
  emergencia: { label: "Emergencia", icon: AlertTriangle, tone: "bg-red-50 text-red-700 ring-red-200" },
};

export const statusMeta: Record<ClinicalStatus, { label: string; className: string }> = {
  open: { label: "Abierto", className: "bg-sky-50 text-sky-700 ring-sky-200" },
  stable: { label: "Estable", className: "bg-sky-50 text-sky-700 ring-sky-200" },
  critical: { label: "Critico", className: "bg-red-50 text-red-700 ring-red-200" },
  closed: { label: "Cerrado", className: "bg-zinc-100 text-zinc-700 ring-zinc-200" },
  scheduled: { label: "Programado", className: "bg-amber-50 text-amber-700 ring-amber-200" },
};

export const commonSymptoms = [
  "Vomito",
  "Diarrea",
  "Anorexia",
  "Letargo",
  "Prurito",
  "Tos",
  "Cojera",
  "Fiebre",
  "Dolor",
  "Secrecion ocular",
  "Poliuria",
  "Convulsiones",
];

export function calculateAge(birthDate?: string | Date | null) {
  if (!birthDate) return "Sin fecha";
  const birth = new Date(birthDate);
  const now = new Date();
  let months = (now.getFullYear() - birth.getFullYear()) * 12 + now.getMonth() - birth.getMonth();
  if (now.getDate() < birth.getDate()) months -= 1;
  if (months < 1) return "Menos de 1 mes";
  const years = Math.floor(months / 12);
  const rest = months % 12;
  if (!years) return `${months} meses`;
  return rest ? `${years} anos ${rest} meses` : `${years} anos`;
}

export function getWeightTrend(values: { date: string; weight: number }[]) {
  const sorted = [...values].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  const max = Math.max(...sorted.map((item) => item.weight), 1);
  return sorted.map((item) => ({ ...item, height: Math.max(12, Math.round((item.weight / max) * 96)) }));
}

export const clinicalQuickStats = [
  { label: "Signos vitales", icon: HeartPulse },
  { label: "Agenda medica", icon: CalendarClock },
  { label: "Archivos", icon: Camera },
  { label: "Trauma/ortopedia", icon: Bone },
];
