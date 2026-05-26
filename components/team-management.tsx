"use client";

import { ShieldCheck, UserPlus } from "lucide-react";
import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { createTeamMember, updateTeamMember } from "@/actions/team";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Field, Input, Select } from "@/components/ui/input";
import type { OrganizationRole } from "@/lib/permissions";
import type { z } from "zod";
import { teamMemberSchema } from "@/lib/validations";

type TeamMemberValues = z.input<typeof teamMemberSchema>;

type TeamMember = {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  role: OrganizationRole;
  status: "invited" | "active" | "disabled";
};

const roleLabels: Record<OrganizationRole, string> = {
  admin: "Administrador",
  veterinarian: "Veterinario",
  receptionist: "Recepcionista",
};

export function TeamManagement({ members }: { members: TeamMember[] }) {
  const [pending, startTransition] = useTransition();
  const form = useForm<TeamMemberValues>({
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      role: "veterinarian",
      password: "",
    },
  });

  function onSubmit(values: TeamMemberValues) {
    startTransition(async () => {
      const result = await createTeamMember(values);

      if (result.ok) {
        toast.success("Usuario creado");
        form.reset({ name: "", email: "", phone: "", role: "veterinarian", password: "" });
      } else {
        toast.error(result.error ?? "No se pudo crear el usuario");
      }
    });
  }

  function setMemberState(member: TeamMember, status: "active" | "disabled") {
    startTransition(async () => {
      const result = await updateTeamMember({ id: member.id, role: member.role, status });

      if (result.ok) {
        toast.success(status === "active" ? "Usuario activado" : "Usuario desactivado");
      } else {
        toast.error(result.error ?? "No se pudo actualizar el usuario");
      }
    });
  }

  return (
    <div className="grid gap-5 lg:grid-cols-[420px_1fr]">
      <Card className="p-5">
        <div className="mb-5 flex items-start gap-3">
          <span className="grid h-11 w-11 place-items-center rounded-lg border border-border bg-white text-[#147fba]">
            <UserPlus className="h-5 w-5" />
          </span>
          <div>
            <h2 className="text-lg font-bold text-foreground">Crear usuario del equipo</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Agrega veterinarios o recepcionistas con acceso al workspace de la clinica.
            </p>
          </div>
        </div>
        <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4">
          <Field label="Nombre" error={form.formState.errors.name?.message}>
            <Input {...form.register("name")} />
          </Field>
          <Field label="Email" error={form.formState.errors.email?.message}>
            <Input type="email" {...form.register("email")} />
          </Field>
          <Field label="Telefono" error={form.formState.errors.phone?.message}>
            <Input {...form.register("phone")} />
          </Field>
          <Field label="Rol" error={form.formState.errors.role?.message}>
            <Select {...form.register("role")}>
              <option value="veterinarian">Veterinario</option>
              <option value="receptionist">Recepcionista</option>
            </Select>
          </Field>
          <Field label="Contrasena temporal" error={form.formState.errors.password?.message}>
            <Input type="password" autoComplete="new-password" {...form.register("password")} />
          </Field>
          <Button type="submit" disabled={pending}>
            <UserPlus className="h-4 w-4" />
            {pending ? "Creando..." : "Crear acceso"}
          </Button>
        </form>
      </Card>

      <Card className="overflow-hidden">
        <div className="border-b border-border p-5">
          <h2 className="text-lg font-bold text-foreground">Equipo activo</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Roles, estado y acceso de quienes operan la clinica.
          </p>
        </div>
        <div className="divide-y divide-white/10">
          {members.map((member) => (
            <div key={member.id} className="grid gap-3 p-4 md:grid-cols-[1fr_150px_130px_auto] md:items-center">
              <div className="min-w-0">
                <p className="truncate font-semibold text-foreground">{member.name}</p>
                <p className="truncate text-sm text-muted-foreground">{member.email}</p>
              </div>
              <span className="inline-flex w-fit items-center gap-2 rounded-full border border-border bg-secondary px-3 py-1 text-xs font-bold text-muted-foreground">
                <ShieldCheck className="h-3.5 w-3.5 text-[#147fba]" />
                {roleLabels[member.role]}
              </span>
              <span className="text-sm font-semibold text-muted-foreground">{member.status}</span>
              <Button
                type="button"
                variant={member.status === "disabled" ? "secondary" : "danger"}
                size="sm"
                disabled={pending || member.role === "admin"}
                onClick={() => setMemberState(member, member.status === "disabled" ? "active" : "disabled")}
              >
                {member.status === "disabled" ? "Activar" : "Desactivar"}
              </Button>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
