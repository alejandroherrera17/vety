"use client";

import { Search } from "lucide-react";
import type React from "react";
import { useTransition, useState } from "react";
import { lookupPortal } from "@/actions/portal";
import { Button } from "@/components/ui/button";
import { Card, EmptyState } from "@/components/ui/card";
import { Field, Input } from "@/components/ui/input";
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
};

export function PortalLookup() {
  const [document, setDocument] = useState("");
  const [pets, setPets] = useState<PortalPet[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

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
    <div className="mx-auto grid min-h-screen w-full max-w-4xl gap-6 px-4 py-8">
      <div className="text-center">
        <p className="text-sm font-bold text-primary">Vety</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-foreground">Portal de propietario</h1>
        <p className="mx-auto mt-2 max-w-xl text-sm text-muted-foreground">
          Consulta informacion medica de tus mascotas con el documento registrado en la clinica.
        </p>
      </div>

      <Card className="rounded-2xl p-6">
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

      {pets ? (
        pets.length ? (
          <div className="grid gap-4">
            {pets.map((pet) => (
              <Card key={pet.id} className="rounded-2xl p-6">
                <div className="flex flex-col justify-between gap-3 border-b border-border pb-4 sm:flex-row sm:items-start">
                  <div>
                    <h2 className="text-2xl font-bold text-foreground">{pet.name}</h2>
                    <p className="text-sm text-muted-foreground">
                      {pet.species} - {pet.breed ?? "Sin raza"} - {pet.sex}
                    </p>
                  </div>
                  <div className="text-sm text-muted-foreground sm:text-right">
                    <p className="font-semibold text-black">{pet.owner.name}</p>
                    <p>{pet.owner.phone}</p>
                  </div>
                </div>

                <div className="mt-4 grid gap-4 lg:grid-cols-2">
                  <PortalSection title="Proximas citas">
                    {pet.appointments.length ? (
                      pet.appointments.map((appointment) => (
                        <div key={appointment.id} className="rounded-xl border border-black/10 p-3">
                          <p className="font-semibold">{appointment.title}</p>
                          <p className="text-sm text-black/60">{formatDateTime(appointment.startDate)}</p>
                          <p className="mt-1 text-xs font-bold uppercase text-black/50">{appointment.status}</p>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-black/50">Sin citas proximas.</p>
                    )}
                  </PortalSection>
                  <PortalSection title="Vacunas">
                    {pet.vaccinations.length ? (
                      pet.vaccinations.map((vaccine) => (
                        <div key={vaccine.id} className="rounded-xl border border-black/10 p-3">
                          <p className="font-semibold">{vaccine.vaccine}</p>
                          <p className="text-sm text-black/60">
                            Aplicada: {formatDate(vaccine.date)}. Proxima: {formatDate(vaccine.nextDose)}
                          </p>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-black/50">Sin vacunas registradas.</p>
                    )}
                  </PortalSection>
                </div>

                <PortalSection title="Consultas y formulas" className="mt-4">
                  {pet.consultations.length ? (
                    pet.consultations.map((consultation) => (
                      <div key={consultation.id} className="rounded-xl border border-black/10 p-3">
                        <p className="font-semibold">{formatDate(consultation.date)}</p>
                        <p className="mt-2 text-sm text-black/70">Diagnostico</p>
                        <p className="text-sm">{consultation.diagnosis}</p>
                        <p className="mt-2 text-sm text-black/70">Tratamiento</p>
                        <p className="text-sm">{consultation.treatment}</p>
                        {consultation.prescriptions.length ? (
                          <div className="mt-3 grid gap-2">
                            {consultation.prescriptions.map((prescription) => (
                              <div key={prescription.id} className="rounded-lg bg-black/[0.03] p-3 text-sm">
                                <p className="font-semibold">{prescription.medication}</p>
                                <p className="text-black/60">{prescription.dosage} - {prescription.duration}</p>
                                {prescription.instructions ? <p className="mt-1">{prescription.instructions}</p> : null}
                              </div>
                            ))}
                          </div>
                        ) : null}
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-black/50">Sin consultas registradas.</p>
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
      <h3 className="mb-3 text-sm font-bold uppercase tracking-normal text-black/60">{title}</h3>
      <div className="grid gap-2">{children}</div>
    </section>
  );
}
