"use client";

import { UserPlus } from "lucide-react";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { registerPortalClient } from "@/actions/portal";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Field, Input, Select } from "@/components/ui/input";

type ClinicOption = {
  id: string;
  name: string;
  city?: string | null;
};

export function PortalClientRegistrationForm({
  clinics,
  onRegistered,
}: {
  clinics: ClinicOption[];
  onRegistered?: (document: string) => void;
}) {
  const [organizationId, setOrganizationId] = useState(clinics[0]?.id ?? "");
  const [name, setName] = useState("");
  const [document, setDocument] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [city, setCity] = useState("");
  const [address, setAddress] = useState("");
  const [petName, setPetName] = useState("");
  const [petSpecies, setPetSpecies] = useState("");
  const [petBreed, setPetBreed] = useState("");
  const [petSex, setPetSex] = useState("");
  const [petBirthDate, setPetBirthDate] = useState("");
  const [pending, startTransition] = useTransition();

  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    startTransition(async () => {
      const result = await registerPortalClient({
        organizationId,
        name,
        document,
        phone,
        email,
        city,
        address,
        petName,
        petSpecies,
        petBreed,
        petSex,
        petBirthDate,
      });

      if (result.ok) {
        toast.success("Registro creado. Ya puedes consultar tu portal con tu documento.");
        onRegistered?.(result.data?.document ?? document);
      } else {
        toast.error(result.error ?? "No se pudo completar el registro");
      }
    });
  }

  return (
    <Card className="p-6">
      <div className="mb-5">
        <p className="text-sm font-semibold text-emerald-100">Registro de propietario</p>
        <h2 className="mt-1 text-2xl font-bold text-foreground">Crea tu acceso en una clinica</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Registra tus datos y tu primera mascota. Luego podras consultar historia clinica y solicitar citas con tu documento.
        </p>
      </div>
      <form onSubmit={onSubmit} className="grid gap-4 md:grid-cols-2">
        <Field label="Clinica">
          <Select value={organizationId} onChange={(event) => setOrganizationId(event.target.value)}>
            {clinics.map((clinic) => (
              <option key={clinic.id} value={clinic.id}>
                {clinic.name} {clinic.city ? `- ${clinic.city}` : ""}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Documento">
          <Input value={document} onChange={(event) => setDocument(event.target.value)} />
        </Field>
        <Field label="Nombre completo">
          <Input value={name} onChange={(event) => setName(event.target.value)} />
        </Field>
        <Field label="Telefono">
          <Input value={phone} onChange={(event) => setPhone(event.target.value)} />
        </Field>
        <Field label="Email">
          <Input type="email" value={email} onChange={(event) => setEmail(event.target.value)} />
        </Field>
        <Field label="Ciudad">
          <Input value={city} onChange={(event) => setCity(event.target.value)} />
        </Field>
        <div className="md:col-span-2">
          <Field label="Direccion">
            <Input value={address} onChange={(event) => setAddress(event.target.value)} />
          </Field>
        </div>
        <div className="md:col-span-2 border-t border-white/10 pt-3">
          <p className="text-sm font-semibold text-emerald-100">Primera mascota</p>
        </div>
        <Field label="Nombre de mascota">
          <Input value={petName} onChange={(event) => setPetName(event.target.value)} />
        </Field>
        <Field label="Especie">
          <Input placeholder="Perro, gato..." value={petSpecies} onChange={(event) => setPetSpecies(event.target.value)} />
        </Field>
        <Field label="Raza">
          <Input value={petBreed} onChange={(event) => setPetBreed(event.target.value)} />
        </Field>
        <Field label="Sexo">
          <Select value={petSex} onChange={(event) => setPetSex(event.target.value)}>
            <option value="">Selecciona</option>
            <option value="Macho">Macho</option>
            <option value="Hembra">Hembra</option>
          </Select>
        </Field>
        <Field label="Fecha de nacimiento">
          <Input type="date" value={petBirthDate} onChange={(event) => setPetBirthDate(event.target.value)} />
        </Field>
        <div className="flex justify-end md:col-span-2">
          <Button type="submit" disabled={pending}>
            <UserPlus className="h-4 w-4" />
            {pending ? "Registrando..." : "Registrarme"}
          </Button>
        </div>
      </form>
    </Card>
  );
}
