"use client";

import { CalendarPlus } from "lucide-react";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { createPortalAppointmentRequest, lookupRequestPets } from "@/actions/appointment-requests";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Field, Input, Select, Textarea } from "@/components/ui/input";

type ClinicOption = {
  id: string;
  name: string;
  city?: string | null;
  address?: string | null;
  specialties: string[];
  veterinarians: { id: string; name: string }[];
};

export function PortalAppointmentRequestForm({
  clinics,
}: {
  clinics: ClinicOption[];
}) {
  const [organizationId, setOrganizationId] = useState(clinics[0]?.id ?? "");
  const [clientDocument, setClientDocument] = useState("");
  const [petId, setPetId] = useState("");
  const [service, setService] = useState("Consulta general");
  const [requestedVeterinarianId, setRequestedVeterinarianId] = useState("");
  const [requestedStart, setRequestedStart] = useState("");
  const [reason, setReason] = useState("");
  const [pets, setPets] = useState<{ id: string; name: string }[]>([]);
  const [pending, startTransition] = useTransition();
  const selectedClinic = clinics.find((clinic) => clinic.id === organizationId);
  const canLookupPets = organizationId && clientDocument.trim().length >= 5;

  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    startTransition(async () => {
      const result = await createPortalAppointmentRequest({
        organizationId,
        clientDocument,
        petId,
        service,
        requestedVeterinarianId,
        requestedStart,
        reason,
      });

      if (result.ok) {
        toast.success("Solicitud enviada. La clinica revisara disponibilidad.");
        setReason("");
      } else {
        toast.error(result.error ?? "No se pudo enviar la solicitud");
      }
    });
  }

  function searchPets() {
    startTransition(async () => {
      const result = await lookupRequestPets({ organizationId, clientDocument });

      if (result.ok) {
        const nextPets = result.data?.pets ?? [];
        setPets(nextPets);
        setPetId(nextPets[0]?.id ?? "");
        if (!nextPets.length) {
          toast.info("No encontramos mascotas registradas para ese documento en esta clinica");
        }
      } else {
        toast.error(result.error ?? "No pudimos buscar mascotas");
      }
    });
  }

  return (
    <Card className="p-6">
      <div className="mb-5">
        <p className="text-sm font-semibold text-cyan-100">Solicitar cita</p>
        <h2 className="mt-1 text-2xl font-bold text-foreground">La clinica aprueba antes de agendar</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Esto crea una solicitud pendiente. La cita oficial aparece cuando la clinica la aprueba.
        </p>
      </div>
      <form onSubmit={onSubmit} className="grid gap-4 md:grid-cols-2">
        <Field label="Clinica">
          <Select
            value={organizationId}
            onChange={(event) => {
              setOrganizationId(event.target.value);
              setPetId("");
              setPets([]);
              setRequestedVeterinarianId("");
            }}
          >
            {clinics.map((clinic) => (
              <option key={clinic.id} value={clinic.id}>
                {clinic.name} {clinic.city ? `- ${clinic.city}` : ""}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Documento del propietario">
          <div className="flex gap-2">
            <Input
              value={clientDocument}
              onChange={(event) => {
                setClientDocument(event.target.value);
                setPetId("");
                setPets([]);
              }}
            />
            <Button type="button" variant="secondary" disabled={!canLookupPets || pending} onClick={searchPets}>
              Buscar
            </Button>
          </div>
        </Field>
        <Field label="Mascota registrada">
          <Select value={petId} onChange={(event) => setPetId(event.target.value)}>
            <option value="">Selecciona una mascota</option>
            {pets.map((pet) => (
              <option key={pet.id} value={pet.id}>
                {pet.name}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Servicio">
          <Input value={service} onChange={(event) => setService(event.target.value)} />
        </Field>
        <Field label="Veterinario opcional">
          <Select value={requestedVeterinarianId} onChange={(event) => setRequestedVeterinarianId(event.target.value)}>
            <option value="">Sin preferencia</option>
            {selectedClinic?.veterinarians.map((veterinarian) => (
              <option key={veterinarian.id} value={veterinarian.id}>
                {veterinarian.name}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Fecha y hora deseada">
          <Input
            type="datetime-local"
            value={requestedStart}
            onChange={(event) => setRequestedStart(event.target.value)}
          />
        </Field>
        <div className="md:col-span-2">
          <Field label="Motivo">
            <Textarea className="min-h-24" value={reason} onChange={(event) => setReason(event.target.value)} />
          </Field>
        </div>
        <div className="flex justify-end md:col-span-2">
          <Button type="submit" disabled={pending}>
            <CalendarPlus className="h-4 w-4" />
            {pending ? "Enviando..." : "Enviar solicitud"}
          </Button>
        </div>
      </form>
    </Card>
  );
}
