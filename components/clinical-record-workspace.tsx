"use client";

import Image from "next/image";
import {
  AlertTriangle,
  ChevronDown,
  Download,
  FileText,
  Filter,
  HeartPulse,
  Mail,
  MapPin,
  Phone,
  QrCode,
  Search,
  ShieldAlert,
  Sparkles,
  UserRound,
} from "lucide-react";
import { useMemo, useState } from "react";
import { ConsultationForm } from "@/components/consultation-form";
import { PrescriptionFormModal } from "@/components/prescription-form-modal";
import { VaccinationForm } from "@/components/vaccination-form";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { eventMeta, eventTypes, getWeightTrend, statusMeta, type ClinicalEventType, type ClinicalStatus } from "@/lib/clinical";
import { cn, formatDate, formatDateTime, initials } from "@/lib/utils";

type ConsultationItem = {
  id: string;
  date: string;
  reason?: string | null;
  anamnesis?: string | null;
  symptoms: string;
  commonSymptoms: string[];
  temperature?: number | null;
  heartRate?: number | null;
  respiratoryRate?: number | null;
  weight?: number | null;
  physicalExam?: string | null;
  presumptiveDiagnosis?: string | null;
  diagnosis: string;
  definitiveDiagnosis?: string | null;
  treatment: string;
  recommendations?: string | null;
  evolution?: string | null;
  observations?: string | null;
  status: ClinicalStatus;
  prescriptions: {
    id: string;
    medication: string;
    dosage: string;
    frequency?: string | null;
    duration: string;
    route?: string | null;
    observations?: string | null;
    instructions?: string | null;
  }[];
};

type VaccinationItem = {
  id: string;
  vaccine: string;
  date: string;
  nextDose?: string | null;
  lot?: string | null;
  manufacturer?: string | null;
  expiresAt?: string | null;
  veterinarianName?: string | null;
  status: ClinicalStatus;
  notes?: string | null;
};

type AttachmentItem = {
  id: string;
  fileUrl: string;
  type: string;
  fileName?: string | null;
  category?: string | null;
  createdAt: string;
};

export type ClinicalRecordData = {
  pet: {
    id: string;
    name: string;
    species: string;
    breed?: string | null;
    sex: string;
    color?: string | null;
    birthDate?: string | null;
    age: string;
    weight?: number | null;
    photoUrl?: string | null;
    reproductiveStatus?: string | null;
    microchip?: string | null;
    allergies?: string | null;
    previousDiseases?: string | null;
    frequentMedications?: string | null;
    generalObservations?: string | null;
  };
  owner: {
    name: string;
    phone: string;
    email?: string | null;
    address?: string | null;
    city?: string | null;
    document?: string | null;
    emergencyContact?: string | null;
  };
  consultations: ConsultationItem[];
  vaccinations: VaccinationItem[];
  attachments: AttachmentItem[];
  pdfUrl: string;
};

type TimelineEvent = {
  id: string;
  type: ClinicalEventType;
  date: string;
  vet: string;
  title: string;
  summary: string;
  status: ClinicalStatus;
  details: string[];
};

export function ClinicalRecordWorkspace({ data }: { data: ClinicalRecordData }) {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<"all" | ClinicalEventType>("all");
  const [expanded, setExpanded] = useState<string | null>(null);

  const events = useMemo<TimelineEvent[]>(() => {
    const consultations = data.consultations.map((item): TimelineEvent => ({
      id: `consultation-${item.id}`,
      type: item.status === "critical" ? "emergencia" : "consulta",
      date: item.date,
      vet: "Equipo clinico",
      title: item.reason || item.diagnosis,
      summary: item.symptoms,
      status: item.status,
      details: [
        item.anamnesis ? `Anamnesis: ${item.anamnesis}` : "",
        item.physicalExam ? `Examen fisico: ${item.physicalExam}` : "",
        item.presumptiveDiagnosis ? `Dx presuntivo: ${item.presumptiveDiagnosis}` : "",
        item.definitiveDiagnosis ? `Dx definitivo: ${item.definitiveDiagnosis}` : `Dx: ${item.diagnosis}`,
        item.treatment ? `Tratamiento: ${item.treatment}` : "",
        item.recommendations ? `Recomendaciones: ${item.recommendations}` : "",
      ].filter(Boolean),
    }));

    const vaccines = data.vaccinations.map((item): TimelineEvent => ({
      id: `vaccination-${item.id}`,
      type: "vacunacion",
      date: item.date,
      vet: item.veterinarianName || "Equipo clinico",
      title: item.vaccine,
      summary: item.nextDose ? `Proxima dosis ${formatDate(item.nextDose)}` : "Dosis registrada",
      status: item.status,
      details: [
        item.manufacturer ? `Fabricante: ${item.manufacturer}` : "",
        item.lot ? `Lote: ${item.lot}` : "",
        item.expiresAt ? `Vence: ${formatDate(item.expiresAt)}` : "",
        item.notes ? `Notas: ${item.notes}` : "",
      ].filter(Boolean),
    }));

    const files = data.attachments.map((item): TimelineEvent => ({
      id: `file-${item.id}`,
      type: item.type.startsWith("image/") ? "imagenes" : "laboratorio",
      date: item.createdAt,
      vet: "Archivo clinico",
      title: item.fileName || item.category || "Archivo adjunto",
      summary: item.type,
      status: "closed",
      details: ["Adjunto disponible en la galeria del expediente."],
    }));

    return [...consultations, ...vaccines, ...files].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [data]);

  const filteredEvents = events.filter((event) => {
    const matchesType = typeFilter === "all" || event.type === typeFilter;
    const text = `${event.title} ${event.summary} ${event.vet} ${event.details.join(" ")}`.toLowerCase();
    return matchesType && text.includes(query.toLowerCase());
  });

  const weightTrend = getWeightTrend([
    ...(data.pet.weight ? [{ date: new Date().toISOString(), weight: data.pet.weight }] : []),
    ...data.consultations
      .filter((item) => item.weight)
      .map((item) => ({ date: item.date, weight: item.weight ?? 0 })),
  ]);

  const upcomingVaccines = data.vaccinations.filter((item) => item.nextDose && new Date(item.nextDose) >= new Date()).slice(0, 3);
  const latestConsultation = data.consultations[0];

  return (
    <div className="text-foreground">
      <section className="relative overflow-hidden rounded-lg border border-border bg-white text-foreground shadow-2xl shadow-black/20 backdrop-blur-xl">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(20,184,166,0.22),transparent_34%),radial-gradient(circle_at_80%_10%,rgba(56,189,248,0.16),transparent_30%)]" />
        <div className="relative grid gap-6 p-5 md:p-7 lg:grid-cols-[1fr_auto] lg:items-end">
          <div className="flex flex-col gap-5 sm:flex-row">
            <div className="relative h-28 w-28 shrink-0 overflow-hidden rounded-2xl bg-white/10 ring-1 ring-white/20">
              {data.pet.photoUrl ? (
                <Image src={data.pet.photoUrl} alt={data.pet.name} fill className="object-cover" />
              ) : (
                <div className="grid h-full place-items-center text-3xl font-bold">{initials(data.pet.name)}</div>
              )}
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold ring-1 ring-white/15">{data.pet.species}</span>
                <span className="rounded-full bg-sky-300/15 px-3 py-1 text-xs font-semibold text-[#147fba] ring-1 ring-sky-200/20">Expediente activo</span>
              </div>
              <h1 className="mt-3 text-3xl font-bold tracking-tight md:text-5xl">{data.pet.name}</h1>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">
                {data.pet.breed || "Sin raza"} · {data.pet.sex} · {data.pet.age} · {data.pet.weight ? `${data.pet.weight} kg` : "Peso no registrado"}
              </p>
              <div className="mt-4 flex flex-wrap gap-2 text-xs font-medium text-muted-foreground">
                <span className="rounded-full bg-white/10 px-3 py-1">Microchip: {data.pet.microchip || "No registrado"}</span>
                <span className="rounded-full bg-white/10 px-3 py-1">Reproductivo: {data.pet.reproductiveStatus || "Sin dato"}</span>
                <span className="rounded-full bg-white/10 px-3 py-1">Color: {data.pet.color || "Sin dato"}</span>
              </div>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 lg:justify-end">
            <a href={`${data.pdfUrl}?type=summary`} target="_blank">
              <Button type="button" variant="secondary" className="border-white/20 bg-white/10 text-foreground hover:bg-white/20">
                <FileText className="h-4 w-4" />
                Resumen
              </Button>
            </a>
            <a href={`${data.pdfUrl}?type=vaccines`} target="_blank">
              <Button type="button" variant="secondary" className="border-white/20 bg-white/10 text-foreground hover:bg-white/20">
                <QrCode className="h-4 w-4" />
                Carnet
              </Button>
            </a>
            <a href={data.pdfUrl} target="_blank">
              <Button type="button" className="bg-white text-zinc-950 hover:bg-white/90">
                <Download className="h-4 w-4" />
                PDF completo
              </Button>
            </a>
          </div>
        </div>
      </section>

      <div className="mt-5 grid gap-5 lg:grid-cols-[280px_1fr]">
        <aside className="grid gap-4 self-start lg:sticky lg:top-5">
          <Panel className="p-4">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-zinc-500">Propietario</p>
            <div className="mt-4 flex items-center gap-3">
              <span className="grid h-11 w-11 place-items-center rounded-xl bg-zinc-950 text-sm font-bold text-foreground">{initials(data.owner.name)}</span>
              <div className="min-w-0">
                <p className="truncate font-semibold">{data.owner.name}</p>
                <p className="text-sm text-zinc-500">{data.owner.document || "Sin documento"}</p>
              </div>
            </div>
            <InfoLine icon={Phone} value={data.owner.phone} />
            <InfoLine icon={Mail} value={data.owner.email || "Sin email"} />
            <InfoLine icon={MapPin} value={[data.owner.address, data.owner.city].filter(Boolean).join(", ") || "Sin direccion"} />
            <InfoLine icon={UserRound} value={data.owner.emergencyContact || "Sin emergencia"} />
          </Panel>

          <Panel className="p-2">
            {[
              ["dashboard", "Dashboard"],
              ["timeline", "Timeline"],
              ["consultations", "Consultas"],
              ["vaccines", "Vacunas"],
              ["files", "Archivos"],
            ].map(([id, label]) => (
              <button
                key={id}
                type="button"
                onClick={() => setActiveTab(id)}
                className={cn(
                  "flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-sm font-semibold transition",
                  activeTab === id ? "bg-zinc-950 text-foreground shadow-sm" : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-950",
                )}
              >
                {label}
                <span className="text-xs opacity-60">{id === "timeline" ? events.length : ""}</span>
              </button>
            ))}
          </Panel>
        </aside>

        <main className="grid gap-5">
          {activeTab === "dashboard" ? (
            <DashboardSection
              allergies={data.pet.allergies}
              previousDiseases={data.pet.previousDiseases}
              frequentMedications={data.pet.frequentMedications}
              observations={data.pet.generalObservations}
              latestConsultation={latestConsultation}
              upcomingVaccines={upcomingVaccines}
              weightTrend={weightTrend}
              counts={{ consultations: data.consultations.length, vaccines: data.vaccinations.length, files: data.attachments.length }}
            />
          ) : null}

          {activeTab === "timeline" ? (
            <TimelineSection
              query={query}
              setQuery={setQuery}
              typeFilter={typeFilter}
              setTypeFilter={setTypeFilter}
              events={filteredEvents}
              expanded={expanded}
              setExpanded={setExpanded}
            />
          ) : null}

          {activeTab === "consultations" ? (
            <section className="grid gap-5 xl:grid-cols-[1fr_440px]">
              <Panel className="p-5">
                <SectionTitle eyebrow="Historia medica" title="Consultas completas" description="Registro SOAP extendido, signos vitales, diagnosticos, plan terapeutico y evolucion." />
                <div className="mt-5 grid gap-4">
                  {data.consultations.length ? data.consultations.map((item) => <ConsultationCard key={item.id} item={item} />) : (
                    <EmptyState title="Sin consultas" description="Crea la primera nota medica estructurada para iniciar el expediente." />
                  )}
                </div>
              </Panel>
              <Panel className="p-5">
                <SectionTitle eyebrow="Nueva entrada" title="Consulta profesional" description="Preparado para plantillas, dictado por voz e IA clinica futura." />
                <div className="mt-5">
                  <ConsultationForm petId={data.pet.id} />
                </div>
              </Panel>
            </section>
          ) : null}

          {activeTab === "vaccines" ? (
            <Panel className="p-5">
              <SectionTitle eyebrow="Inmunizacion" title="Carnet y proximas dosis" description="Lotes, fabricante, vencimiento, responsable y alertas automaticas." />
              <div className="mt-5">
                <VaccinationForm petId={data.pet.id} />
              </div>
              <div className="mt-5 grid gap-3 lg:grid-cols-2">
                {data.vaccinations.map((item) => (
                  <div key={item.id} className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold">{item.vaccine}</p>
                        <p className="text-sm text-zinc-500">{formatDate(item.date)} · {item.manufacturer || "Fabricante sin registrar"}</p>
                      </div>
                      <Badge status={item.status} />
                    </div>
                    <div className="mt-4 grid gap-2 text-sm text-zinc-600 sm:grid-cols-2">
                      <span>Lote: {item.lot || "N/A"}</span>
                      <span>Vence: {formatDate(item.expiresAt)}</span>
                      <span>Proxima: {formatDate(item.nextDose)}</span>
                      <span>Vet: {item.veterinarianName || "Clinica"}</span>
                    </div>
                  </div>
                ))}
              </div>
            </Panel>
          ) : null}

          {activeTab === "files" ? (
            <Panel className="p-5">
              <SectionTitle eyebrow="Examenes y archivos" title="Galeria clinica" description="Imagenes, PDFs, laboratorios, radiografias y ecografias en una vista visual." />
              <form action="/api/uploads" method="post" encType="multipart/form-data" className="mt-5 grid gap-3 rounded-2xl border border-dashed border-zinc-300 bg-zinc-50 p-4 sm:grid-cols-[1fr_auto]">
                <input type="hidden" name="petId" value={data.pet.id} />
                <Input type="file" name="file" className="bg-white" />
                <Button type="submit" variant="secondary">Subir archivo</Button>
              </form>
              <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {data.attachments.length ? data.attachments.map((file) => (
                  <a key={file.id} href={file.fileUrl} target="_blank" className="group overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg">
                    <div className="relative grid aspect-[4/3] place-items-center bg-zinc-100">
                      {file.type.startsWith("image/") ? (
                        <Image src={file.fileUrl} alt={file.fileName || "Archivo"} fill className="object-cover" />
                      ) : (
                        <FileText className="h-10 w-10 text-zinc-400" />
                      )}
                    </div>
                    <div className="p-4">
                      <p className="truncate font-semibold">{file.fileName || file.category || "Archivo clinico"}</p>
                      <p className="mt-1 text-sm text-zinc-500">{formatDate(file.createdAt)} · {file.type}</p>
                    </div>
                  </a>
                )) : (
                  <div className="sm:col-span-2 xl:col-span-3">
                    <EmptyState title="Sin archivos" description="Sube resultados de laboratorio, imagenes diagnosticas o documentos firmados." />
                  </div>
                )}
              </div>
            </Panel>
          ) : null}
        </main>
      </div>
    </div>
  );
}

function Panel({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-lg border border-border bg-card/82 shadow-xl shadow-black/10 backdrop-blur-xl ring-1 ring-white/[0.035]",
        className,
      )}
      {...props}
    />
  );
}

function InfoLine({ icon: Icon, value }: { icon: typeof Phone; value: string }) {
  return (
    <p className="mt-3 flex items-start gap-2 text-sm text-zinc-600">
      <Icon className="mt-0.5 h-4 w-4 shrink-0 text-zinc-400" />
      <span>{value}</span>
    </p>
  );
}

function SectionTitle({ eyebrow, title, description }: { eyebrow: string; title: string; description: string }) {
  return (
    <div>
      <p className="text-xs font-bold uppercase tracking-[0.16em] text-sky-600">{eyebrow}</p>
      <h2 className="mt-1 text-xl font-bold tracking-tight text-zinc-950">{title}</h2>
      <p className="mt-1 max-w-2xl text-sm leading-6 text-zinc-500">{description}</p>
    </div>
  );
}

function Badge({ status }: { status: ClinicalStatus }) {
  const meta = statusMeta[status] ?? statusMeta.open;
  return <span className={cn("inline-flex rounded-full px-2.5 py-1 text-xs font-bold ring-1", meta.className)}>{meta.label}</span>;
}

function DashboardSection({
  allergies,
  previousDiseases,
  frequentMedications,
  observations,
  latestConsultation,
  upcomingVaccines,
  weightTrend,
  counts,
}: {
  allergies?: string | null;
  previousDiseases?: string | null;
  frequentMedications?: string | null;
  observations?: string | null;
  latestConsultation?: ConsultationItem;
  upcomingVaccines: VaccinationItem[];
  weightTrend: { date: string; weight: number; height: number }[];
  counts: { consultations: number; vaccines: number; files: number };
}) {
  return (
    <section className="grid gap-5">
      <div className="grid gap-4 md:grid-cols-3">
        <Metric label="Consultas" value={counts.consultations} helper="entradas medicas" />
        <Metric label="Vacunas" value={counts.vaccines} helper="dosis registradas" />
        <Metric label="Archivos" value={counts.files} helper="adjuntos clinicos" />
      </div>
      <div className="grid gap-5 xl:grid-cols-[1fr_360px]">
        <Panel className="p-5">
          <SectionTitle eyebrow="Dashboard clinico" title="Alertas y estado del paciente" description="Senales criticas, tratamientos recientes, enfermedades activas y observaciones." />
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <AlertCard icon={ShieldAlert} title="Alergias criticas" value={allergies || "Sin alergias registradas"} critical={Boolean(allergies)} />
            <AlertCard icon={AlertTriangle} title="Enfermedades previas" value={previousDiseases || "Sin antecedentes registrados"} />
            <AlertCard icon={HeartPulse} title="Medicamentos frecuentes" value={frequentMedications || "Sin medicamentos frecuentes"} />
            <AlertCard icon={Sparkles} title="Observaciones generales" value={observations || "Sin observaciones generales"} />
          </div>
          <div className="mt-5 rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
            <p className="text-sm font-bold">Ultimo tratamiento</p>
            <p className="mt-2 text-sm leading-6 text-zinc-600">{latestConsultation?.treatment || "Aun no hay tratamiento registrado."}</p>
          </div>
        </Panel>
        <Panel className="p-5">
          <SectionTitle eyebrow="Peso" title="Tendencia historica" description="Lecturas tomadas desde el perfil y consultas." />
          <div className="mt-6 flex h-32 items-end gap-2 rounded-2xl bg-zinc-50 p-4">
            {weightTrend.length ? weightTrend.map((item) => (
              <div key={`${item.date}-${item.weight}`} className="flex flex-1 flex-col items-center gap-2">
                <div className="w-full rounded-t-lg bg-zinc-950" style={{ height: item.height }} />
                <span className="text-[10px] font-semibold text-zinc-500">{item.weight}kg</span>
              </div>
            )) : <p className="m-auto text-sm text-zinc-500">Sin datos de peso.</p>}
          </div>
          <div className="mt-5">
            <p className="text-sm font-bold">Proximas vacunas</p>
            <div className="mt-3 grid gap-2">
              {upcomingVaccines.length ? upcomingVaccines.map((item) => (
                <div key={item.id} className="rounded-xl bg-sky-50 px-3 py-2 text-sm text-sky-800">
                  <strong>{item.vaccine}</strong> · {formatDate(item.nextDose)}
                </div>
              )) : <p className="text-sm text-zinc-500">Sin alertas de vacunacion.</p>}
            </div>
          </div>
        </Panel>
      </div>
    </section>
  );
}

function Metric({ label, value, helper }: { label: string; value: number; helper: string }) {
  return (
    <Panel className="p-5">
      <p className="text-sm font-medium text-zinc-500">{label}</p>
      <p className="mt-2 text-3xl font-bold">{value}</p>
      <p className="mt-1 text-sm text-zinc-500">{helper}</p>
    </Panel>
  );
}

function AlertCard({ icon: Icon, title, value, critical }: { icon: typeof ShieldAlert; title: string; value: string; critical?: boolean }) {
  return (
    <div className={cn("rounded-2xl border p-4", critical ? "border-red-200 bg-red-50" : "border-zinc-200 bg-white")}>
      <Icon className={cn("h-5 w-5", critical ? "text-red-600" : "text-zinc-500")} />
      <p className="mt-3 text-sm font-bold">{title}</p>
      <p className="mt-1 text-sm leading-6 text-zinc-600">{value}</p>
    </div>
  );
}

function TimelineSection({
  query,
  setQuery,
  typeFilter,
  setTypeFilter,
  events,
  expanded,
  setExpanded,
}: {
  query: string;
  setQuery: (value: string) => void;
  typeFilter: "all" | ClinicalEventType;
  setTypeFilter: (value: "all" | ClinicalEventType) => void;
  events: TimelineEvent[];
  expanded: string | null;
  setExpanded: (value: string | null) => void;
}) {
  return (
    <Panel className="p-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <SectionTitle eyebrow="Timeline medico" title="Historial cronologico" description="Busca, filtra y expande cada evento clinico del expediente." />
        <div className="grid gap-2 sm:grid-cols-[1fr_auto] lg:w-[520px]">
          <label className="relative">
            <Search className="pointer-events-none absolute left-3 top-3.5 h-4 w-4 text-zinc-400" />
            <Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar diagnostico, vacuna, nota..." className="pl-9" />
          </label>
          <label className="relative">
            <Filter className="pointer-events-none absolute left-3 top-3.5 h-4 w-4 text-zinc-400" />
            <select value={typeFilter} onChange={(event) => setTypeFilter(event.target.value as "all" | ClinicalEventType)} className="h-11 rounded-xl border border-zinc-200 bg-white pl-9 pr-8 text-sm font-semibold outline-none">
              <option value="all">Todos</option>
              {eventTypes.map((type) => <option key={type} value={type}>{eventMeta[type].label}</option>)}
            </select>
          </label>
        </div>
      </div>
      <div className="mt-6 grid gap-4">
        {events.length ? events.map((event) => {
          const meta = eventMeta[event.type];
          const Icon = meta.icon;
          const isOpen = expanded === event.id;
          return (
            <article key={event.id} className="relative rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm transition hover:shadow-md">
              <div className="flex flex-col gap-4 md:flex-row md:items-start">
                <div className={cn("grid h-11 w-11 shrink-0 place-items-center rounded-xl ring-1", meta.tone)}>
                  <Icon className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-bold">{meta.label}</span>
                    <Badge status={event.status} />
                    <span className="text-sm text-zinc-500">{formatDateTime(event.date)}</span>
                  </div>
                  <h3 className="mt-2 text-lg font-bold tracking-tight">{event.title}</h3>
                  <p className="mt-1 text-sm leading-6 text-zinc-600">{event.summary}</p>
                  <p className="mt-2 text-xs font-semibold uppercase tracking-[0.14em] text-zinc-400">{event.vet}</p>
                  {isOpen ? (
                    <div className="mt-4 grid gap-2 rounded-2xl bg-zinc-50 p-4 text-sm leading-6 text-zinc-700">
                      {event.details.map((detail) => <p key={detail}>{detail}</p>)}
                      <div className="mt-2 flex flex-wrap gap-2">
                        <Button type="button" variant="secondary" size="sm">Nota rapida</Button>
                        <Button type="button" variant="secondary" size="sm">Adjuntar imagen</Button>
                        <Button type="button" variant="secondary" size="sm">Adjuntar PDF</Button>
                      </div>
                    </div>
                  ) : null}
                </div>
                <button type="button" onClick={() => setExpanded(isOpen ? null : event.id)} className="rounded-full p-2 text-zinc-500 transition hover:bg-zinc-100 hover:text-zinc-950">
                  <ChevronDown className={cn("h-5 w-5 transition", isOpen && "rotate-180")} />
                </button>
              </div>
            </article>
          );
        }) : <EmptyState title="Sin eventos" description="No hay eventos que coincidan con los filtros actuales." />}
      </div>
    </Panel>
  );
}

function ConsultationCard({ item }: { item: ConsultationItem }) {
  return (
    <article className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-zinc-500">{formatDateTime(item.date)}</p>
          <h3 className="mt-1 text-lg font-bold">{item.reason || item.diagnosis}</h3>
        </div>
        <div className="flex items-center gap-2">
          <Badge status={item.status} />
          <PrescriptionFormModal consultationId={item.id} />
        </div>
      </div>
      <div className="mt-4 grid gap-3 md:grid-cols-4">
        <Vital label="Temp" value={item.temperature ? `${item.temperature} C` : "N/A"} />
        <Vital label="FC" value={item.heartRate ? `${item.heartRate} lpm` : "N/A"} />
        <Vital label="FR" value={item.respiratoryRate ? `${item.respiratoryRate} rpm` : "N/A"} />
        <Vital label="Peso" value={item.weight ? `${item.weight} kg` : "N/A"} />
      </div>
      {item.commonSymptoms.length ? (
        <div className="mt-4 flex flex-wrap gap-2">
          {item.commonSymptoms.map((symptom) => <span key={symptom} className="rounded-full bg-zinc-100 px-3 py-1 text-xs font-semibold text-zinc-600">{symptom}</span>)}
        </div>
      ) : null}
      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <NoteBlock title="Sintomas" value={item.symptoms} />
        <NoteBlock title="Examen fisico" value={item.physicalExam || "Sin examen fisico estructurado"} />
        <NoteBlock title="Diagnostico" value={item.definitiveDiagnosis || item.diagnosis} />
        <NoteBlock title="Tratamiento" value={item.treatment} />
      </div>
      {item.prescriptions.length ? (
        <div className="mt-4 rounded-2xl bg-indigo-50 p-4">
          <p className="text-sm font-bold text-indigo-950">Medicamentos formulados</p>
          <div className="mt-3 grid gap-2">
            {item.prescriptions.map((prescription) => (
              <a key={prescription.id} href={`/api/prescriptions/${prescription.id}/pdf`} target="_blank" className="flex items-center justify-between rounded-xl bg-white px-3 py-2 text-sm shadow-sm">
                <span><strong>{prescription.medication}</strong> · {prescription.dosage} · {prescription.frequency || prescription.duration}</span>
                <Download className="h-4 w-4 text-zinc-400" />
              </a>
            ))}
          </div>
        </div>
      ) : null}
    </article>
  );
}

function Vital({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-zinc-50 px-3 py-2">
      <p className="text-xs font-bold uppercase tracking-[0.12em] text-zinc-400">{label}</p>
      <p className="mt-1 font-semibold">{value}</p>
    </div>
  );
}

function NoteBlock({ title, value }: { title: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-bold uppercase tracking-[0.14em] text-zinc-400">{title}</p>
      <p className="mt-1 text-sm leading-6 text-zinc-700">{value}</p>
    </div>
  );
}
