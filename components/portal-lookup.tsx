"use client";

import { Building2, Search, ShieldCheck, Stethoscope } from "lucide-react";
import type React from "react";
import { useMemo, useTransition, useState } from "react";
import { lookupPortal } from "@/actions/portal";
import { PortalAppointmentRequestForm } from "@/components/portal-appointment-request-form";
import { PortalClientRegistrationForm } from "@/components/portal-client-registration-form";
import { Button } from "@/components/ui/button";
import { Card, EmptyState } from "@/components/ui/card";
import { Field, Input, Select } from "@/components/ui/input";
import { formatDate, formatDateTime } from "@/lib/utils";

type PortalPet = {
  id: string;
  name: string;
  species: string;
  breed: string | null;
  sex: string;
  birthDate: string | null;
  owner: { name: string; phone: string };
  vaccinations: { id: string; vaccine: string; date: string | null; nextDose: string | null }[];
  appointments: { id: string; title: string; notes: string | null; startDate: string | null; endDate: string | null; status: string }[];
  consultations: {
    id: string;
    date: string | null;
    diagnosis: string;
    treatment: string;
    observations: string | null;
    prescriptions: {
      id: string;
      medication: string;
      dosage: string;
      duration: string;
      instructions: string | null;
      createdAt: string | null;
    }[];
  }[];
  appointmentRequests: {
    id: string;
    service: string;
    reason: string | null;
    requestedStart: string | null;
    requestedEnd: string | null;
    proposedStart: string | null;
    proposedEnd: string | null;
    status: string;
    reviewNote: string | null;
    clinicName: string;
  }[];
};

type ClinicOption = {
  id: string;
  name: string;
  city?: string | null;
  address?: string | null;
  specialties: string[];
  veterinarians: { id: string; name: string }[];
};

export function PortalLookup({
  clinics,
}: {
  clinics: ClinicOption[];
}) {
  const [document, setDocument] = useState("");
  const [pets, setPets] = useState<PortalPet[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedCity, setSelectedCity] = useState("all");
  const [pending, startTransition] = useTransition();
  const cities = useMemo(
    () =>
      Array.from(new Set(clinics.map((clinic) => clinic.city).filter(Boolean) as string[])).sort((a, b) =>
        a.localeCompare(b),
      ),
    [clinics],
  );
  const visibleClinics = useMemo(
    () => clinics.filter((clinic) => selectedCity === "all" || clinic.city === selectedCity),
    [clinics, selectedCity],
  );

  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    startTransition(async () => {
      const result = await lookupPortal({ document });
      if (!result.ok) {
        setPets(null);
        setError(result.error ?? "No pudimos consultar el portal.");
        return;
      }
      setPets((result.data as { pets: PortalPet[] }).pets);
    });
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#030711] text-white">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_18%,rgba(14,165,233,0.22),transparent_30%),radial-gradient(circle_at_84%_8%,rgba(16,185,129,0.18),transparent_28%),linear-gradient(135deg,rgba(255,255,255,0.05),transparent_38%)]" />
      <div className="relative mx-auto grid w-full max-w-5xl gap-6 px-4 py-8">
      <div className="rounded-lg border border-white/10 bg-white/[0.06] p-6 text-center shadow-2xl shadow-black/20 backdrop-blur-xl">
        <div className="mx-auto grid h-12 w-12 place-items-center rounded-lg border border-cyan-200/25 bg-cyan-300/10 text-cyan-100 shadow-[0_0_42px_rgba(34,211,238,0.16)]">
          <Stethoscope className="h-5 w-5" />
        </div>
        <p className="mt-4 text-sm font-bold text-cyan-100">VetyCare Portal</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-white">Portal de propietario</h1>
          <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-slate-300">
          Registrate como propietario, consulta tus mascotas y solicita citas que la clinica aprueba antes de agendar.
        </p>
      </div>

      <section className="grid gap-4 lg:grid-cols-[0.85fr_1.15fr]">
        <Card className="p-6">
          <div className="mb-4">
            <p className="text-sm font-semibold text-cyan-100">Mis mascotas</p>
            <h2 className="mt-1 text-2xl font-bold text-foreground">Consultar historia clinica</h2>
          </div>
          <form onSubmit={onSubmit} className="grid gap-4 sm:grid-cols-[1fr_auto] sm:items-end">
          <Field label="Documento del propietario">
            <Input
              autoFocus
              inputMode="text"
              value={document}
              onChange={(event) => setDocument(event.target.value)}
              placeholder="Numero de documento"
            />
          </Field>
          <Button type="submit" disabled={pending}>
            <Search className="h-4 w-4" />
            {pending ? "Consultando..." : "Consultar"}
          </Button>
        </form>
        {error ? <p className="mt-3 text-sm font-semibold text-destructive">{error}</p> : null}
        </Card>
        <PortalClientRegistrationForm
          clinics={visibleClinics}
          onRegistered={(nextDocument) => {
            setDocument(nextDocument);
            setPets(null);
          }}
        />
      </section>

      <section className="grid gap-4 lg:grid-cols-[1fr_1.1fr]">
        <Card className="p-6">
          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
            <div>
              <p className="text-sm font-semibold text-cyan-100">Clinicas disponibles</p>
              <h2 className="mt-1 text-2xl font-bold text-foreground">Directorio por ciudad</h2>
            </div>
            <div className="min-w-52">
              <Field label="Ciudad">
                <Select value={selectedCity} onChange={(event) => setSelectedCity(event.target.value)}>
                  <option value="all">Todas</option>
                  {cities.map((city) => (
                    <option key={city} value={city}>
                      {city}
                    </option>
                  ))}
                </Select>
              </Field>
            </div>
          </div>
          <div className="mt-4 grid gap-3">
            {visibleClinics.length ? visibleClinics.map((clinic) => (
              <div key={clinic.id} className="rounded-lg border border-white/10 bg-white/[0.04] p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-foreground">{clinic.name}</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {[clinic.city, clinic.address].filter(Boolean).join(" - ") || "Ubicacion por confirmar"}
                    </p>
                  </div>
                  <span className="rounded-full border border-cyan-200/20 bg-cyan-300/10 px-2 py-1 text-xs font-bold text-cyan-100">
                    {clinic.veterinarians.length} vets
                  </span>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {(clinic.specialties.length ? clinic.specialties : ["Medicina general"]).map((specialty) => (
                    <span key={specialty} className="rounded-full border border-white/10 bg-white/[0.04] px-2 py-1 text-xs text-muted-foreground">
                      {specialty}
                    </span>
                  ))}
                </div>
              </div>
            )) : (
              <div className="rounded-lg border border-dashed border-white/15 bg-white/[0.04] p-5 text-sm text-muted-foreground">
                No hay clinicas registradas en esa ciudad.
              </div>
            )}
          </div>
        </Card>
        <PortalAppointmentRequestForm clinics={visibleClinics} />
      </section>

      {pets ? (
        pets.length ? (
          <div className="grid gap-4">
            {pets.map((pet) => (
              <Card key={pet.id} className="p-6">
                <div className="flex flex-col justify-between gap-3 border-b border-border pb-4 sm:flex-row sm:items-start">
                  <div>
                    <h2 className="text-2xl font-bold text-foreground">{pet.name}</h2>
                    <p className="text-sm text-muted-foreground">
                      {pet.species} - {pet.breed ?? "Sin raza"} - {pet.sex}
                    </p>
                  </div>
                  <div className="text-sm text-muted-foreground sm:text-right">
                    <p className="font-semibold text-foreground">{pet.owner.name}</p>
                    <p>{pet.owner.phone}</p>
                  </div>
                </div>

                <div className="mt-4 grid gap-4 lg:grid-cols-2">
                  <PortalSection title="Proximas citas">
                    {pet.appointments.length ? (
                      pet.appointments.map((appointment) => (
                        <div key={appointment.id} className="rounded-lg border border-white/10 bg-white/[0.04] p-3">
                          <p className="font-semibold">{appointment.title}</p>
                          <p className="text-sm text-muted-foreground">{formatDateTime(appointment.startDate)}</p>
                          <p className="mt-1 text-xs font-bold uppercase text-muted-foreground">{appointment.status}</p>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-muted-foreground">Sin citas proximas.</p>
                    )}
                  </PortalSection>
                  <PortalSection title="Solicitudes de cita">
                    {pet.appointmentRequests.length ? (
                      pet.appointmentRequests.map((request) => (
                        <div key={request.id} className="rounded-lg border border-white/10 bg-white/[0.04] p-3">
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <p className="font-semibold">{request.service}</p>
                              <p className="text-sm text-muted-foreground">{request.clinicName}</p>
                            </div>
                            <span className="rounded-full border border-white/10 bg-white/[0.05] px-2 py-1 text-xs font-bold uppercase text-muted-foreground">
                              {request.status}
                            </span>
                          </div>
                          <p className="mt-2 text-sm text-muted-foreground">
                            Solicitada: {formatDateTime(request.requestedStart)}
                          </p>
                          {request.proposedStart ? (
                            <p className="text-sm text-muted-foreground">
                              Propuesta: {formatDateTime(request.proposedStart)}
                            </p>
                          ) : null}
                          {request.reviewNote ? <p className="mt-2 text-sm">{request.reviewNote}</p> : null}
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-muted-foreground">Sin solicitudes recientes.</p>
                    )}
                  </PortalSection>
                  <PortalSection title="Vacunas">
                    {pet.vaccinations.length ? (
                      pet.vaccinations.map((vaccine) => (
                        <div key={vaccine.id} className="rounded-lg border border-white/10 bg-white/[0.04] p-3">
                          <p className="font-semibold">{vaccine.vaccine}</p>
                          <p className="text-sm text-muted-foreground">
                            Aplicada: {formatDate(vaccine.date)}. Proxima: {formatDate(vaccine.nextDose)}
                          </p>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-muted-foreground">Sin vacunas registradas.</p>
                    )}
                  </PortalSection>
                </div>

                <PortalSection title="Consultas y formulas" className="mt-4">
                  {pet.consultations.length ? (
                    pet.consultations.map((consultation) => (
                      <div key={consultation.id} className="rounded-lg border border-white/10 bg-white/[0.04] p-3">
                        <p className="font-semibold">{formatDate(consultation.date)}</p>
                        <p className="mt-2 text-sm text-muted-foreground">Diagnostico</p>
                        <p className="text-sm">{consultation.diagnosis}</p>
                        <p className="mt-2 text-sm text-muted-foreground">Tratamiento</p>
                        <p className="text-sm">{consultation.treatment}</p>
                        {consultation.prescriptions.length ? (
                          <div className="mt-3 grid gap-2">
                            {consultation.prescriptions.map((prescription) => (
                              <div key={prescription.id} className="rounded-lg bg-white/[0.05] p-3 text-sm">
                                <p className="font-semibold">{prescription.medication}</p>
                                <p className="text-muted-foreground">{prescription.dosage} - {prescription.duration}</p>
                                {prescription.instructions ? <p className="mt-1">{prescription.instructions}</p> : null}
                              </div>
                            ))}
                          </div>
                        ) : null}
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground">Sin consultas registradas.</p>
                  )}
                </PortalSection>
              </Card>
            ))}
          </div>
        ) : (
          <EmptyState
            title="No encontramos registros"
            description="Verifica que el documento coincida con el registrado en la clinica."
          />
        )
      ) : null}
      <div className="mx-auto flex items-center gap-2 text-xs text-slate-400">
        <Building2 className="h-4 w-4 text-cyan-100" />
        Cada solicitud llega a la bandeja de la clinica y solo se agenda cuando es aprobada.
        <ShieldCheck className="h-4 w-4 text-emerald-300" />
      </div>
      </div>
    </div>
  );
}

function PortalSection({
  title,
  children,
  className = "",
}: {
  title: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={className}>
      <h3 className="mb-3 text-sm font-bold uppercase tracking-normal text-cyan-100/80">{title}</h3>
      <div className="grid gap-2">{children}</div>
    </section>
  );
}
