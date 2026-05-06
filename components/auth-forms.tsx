"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { registerVeterinarian } from "@/actions/auth";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/input";
import { loginSchema, registerSchema } from "@/lib/validations";
import type { z } from "zod";

type LoginValues = z.input<typeof loginSchema>;
type RegisterValues = z.input<typeof registerSchema>;

export function LoginForm() {
  const router = useRouter();
  const search = useSearchParams();
  const [pending, startTransition] = useTransition();
  const form = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  function onSubmit(values: LoginValues) {
    startTransition(async () => {
      const result = await signIn("credentials", {
        ...values,
        redirect: false,
      });
      if (result?.ok) {
        toast.success("Bienvenido de vuelta");
        router.push("/dashboard");
        router.refresh();
      } else {
        toast.error("Email o contraseña inválidos");
      }
    });
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4">
      {search.get("registered") ? (
        <div className="rounded-xl bg-black/10 px-4 py-3 text-sm font-medium text-black">
          Cuenta creada. Ya puedes iniciar sesión.
        </div>
      ) : null}
      <Field label="Email" error={form.formState.errors.email?.message}>
        <Input autoFocus type="email" {...form.register("email")} />
      </Field>
      <Field label="Contraseña" error={form.formState.errors.password?.message}>
        <Input type="password" {...form.register("password")} />
      </Field>
      <Button type="submit" disabled={pending}>
        {pending ? "Iniciando sesión..." : "Iniciar sesión"}
      </Button>
      <p className="text-center text-sm text-black/60">
        ¿Nueva clínica?{" "}
        <Link href="/register" className="font-semibold text-black">
          Crear cuenta
        </Link>
      </p>
    </form>
  );
}

export function RegisterForm() {
  const [pending, startTransition] = useTransition();
  const form = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: "", email: "", phone: "", password: "" },
  });

  function onSubmit(values: RegisterValues) {
    startTransition(async () => {
      const result = await registerVeterinarian(values);
      if (result?.ok === false) {
        toast.error(result.error ?? "No se pudo crear la cuenta");
      }
    });
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4">
      <Field label="Nombre de la clínica o doctor" error={form.formState.errors.name?.message}>
        <Input autoFocus {...form.register("name")} />
      </Field>
      <Field label="Email" error={form.formState.errors.email?.message}>
        <Input type="email" {...form.register("email")} />
      </Field>
      <Field label="Teléfono" error={form.formState.errors.phone?.message}>
        <Input {...form.register("phone")} />
      </Field>
      <Field label="Contraseña" error={form.formState.errors.password?.message}>
        <Input type="password" {...form.register("password")} />
      </Field>
      <Button type="submit" disabled={pending}>
        {pending ? "Creando..." : "Crear cuenta"}
      </Button>
      <p className="text-center text-sm text-black/60">
        ¿Ya registrado?{" "}
        <Link href="/login" className="font-semibold text-black">
          Iniciar sesión
        </Link>
      </p>
    </form>
  );
}
