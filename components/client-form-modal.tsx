"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, UserRound } from "lucide-react";
import type { ReactNode } from "react";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { createClient, updateClient } from "@/actions/clients";
import { Button } from "@/components/ui/button";
import { FormModalShell } from "@/components/ui/form-modal-shell";
import { Field, Input } from "@/components/ui/input";
import { clientSchema, type ClientInput } from "@/lib/validations";

type ClientFormValues = ClientInput;

export function ClientFormModal({
  client,
  trigger,
}: {
  client?: ClientFormValues;
  trigger?: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const form = useForm<ClientFormValues>({
    resolver: zodResolver(clientSchema),
    defaultValues: client ?? {
      name: "",
      document: "",
      phone: "",
      email: "",
      address: "",
    },
  });

  function onSubmit(values: ClientFormValues) {
    startTransition(async () => {
      const result = client?.id
        ? await updateClient({ ...values, id: client.id })
        : await createClient(values);
      if (result.ok) {
        toast.success(client?.id ? "Cliente actualizado" : "Cliente agregado");
        setOpen(false);
        form.reset();
      } else {
        toast.error(result.error ?? "Revisa el formulario e intenta de nuevo");
      }
    });
  }

  return (
    <>
      <span onClick={() => setOpen(true)}>
        {trigger ?? (
          <Button type="button">
            <Plus className="h-4 w-4" />
            Agregar cliente
          </Button>
        )}
      </span>
      {open ? (
        <FormModalShell
          title={client?.id ? "Editar cliente" : "Nuevo cliente"}
          description="Detalles del propietario e informacion de contacto."
          icon={<UserRound className="h-5 w-5" />}
          onClose={() => setOpen(false)}
        >
          <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4 sm:grid-cols-2">
            <Field label="Nombre" error={form.formState.errors.name?.message}>
              <Input autoFocus placeholder="Nombre completo" {...form.register("name")} />
            </Field>
            <Field label="Telefono" error={form.formState.errors.phone?.message}>
              <Input placeholder="300 123 4567" {...form.register("phone")} />
            </Field>
            <Field label="Documento" error={form.formState.errors.document?.message}>
              <Input placeholder="Documento de identidad" {...form.register("document")} />
            </Field>
            <Field label="Email" error={form.formState.errors.email?.message}>
              <Input type="email" placeholder="cliente@correo.com" {...form.register("email")} />
            </Field>
            <div className="sm:col-span-2">
              <Field label="Direccion" error={form.formState.errors.address?.message}>
                <Input placeholder="Direccion de residencia" {...form.register("address")} />
              </Field>
            </div>
            <div className="flex flex-col-reverse justify-end gap-3 sm:col-span-2 sm:flex-row">
              <Button type="button" variant="secondary" onClick={() => setOpen(false)}>
                Cancelar
              </Button>
              <Button disabled={pending} type="submit">
                {pending ? "Guardando..." : "Guardar cliente"}
              </Button>
            </div>
          </form>
        </FormModalShell>
      ) : null}
    </>
  );
}
