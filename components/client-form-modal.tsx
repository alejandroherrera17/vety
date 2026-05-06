"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, UserRound } from "lucide-react";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { createClient, updateClient } from "@/actions/clients";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/input";
import { clientSchema, type ClientInput } from "@/lib/validations";

type ClientFormValues = ClientInput;

export function ClientFormModal({
  client,
  trigger,
}: {
  client?: ClientFormValues;
  trigger?: React.ReactNode;
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
        toast.success(client?.id ? "Client updated" : "Client added");
        setOpen(false);
        form.reset();
      } else {
        toast.error(result.error ?? "Check the form and try again");
      }
    });
  }

  return (
    <>
      <span onClick={() => setOpen(true)}>
        {trigger ?? (
          <Button type="button">
            <Plus className="h-4 w-4" />
            Add Client
          </Button>
        )}
      </span>
      {open ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/30 p-4">
          <div className="w-full max-w-2xl rounded-2xl bg-white p-5 shadow-2xl">
            <div className="mb-5 flex items-center gap-3">
              <span className="rounded-2xl bg-emerald-100 p-3 text-emerald-700">
                <UserRound className="h-5 w-5" />
              </span>
              <div>
                <h2 className="text-lg font-bold text-slate-950">
                  {client?.id ? "Edit client" : "New client"}
                </h2>
                <p className="text-sm text-slate-500">Owner details and contact information.</p>
              </div>
            </div>
            <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4 sm:grid-cols-2">
              <Field label="Name" error={form.formState.errors.name?.message}>
                <Input autoFocus {...form.register("name")} />
              </Field>
              <Field label="Phone" error={form.formState.errors.phone?.message}>
                <Input {...form.register("phone")} />
              </Field>
              <Field label="Document" error={form.formState.errors.document?.message}>
                <Input {...form.register("document")} />
              </Field>
              <Field label="Email" error={form.formState.errors.email?.message}>
                <Input type="email" {...form.register("email")} />
              </Field>
              <div className="sm:col-span-2">
                <Field label="Address" error={form.formState.errors.address?.message}>
                  <Input {...form.register("address")} />
                </Field>
              </div>
              <div className="flex justify-end gap-3 sm:col-span-2">
                <Button type="button" variant="secondary" onClick={() => setOpen(false)}>
                  Cancel
                </Button>
                <Button disabled={pending} type="submit">
                  {pending ? "Saving..." : "Save client"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </>
  );
}
