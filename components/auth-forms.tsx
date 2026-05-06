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
        toast.success("Welcome back");
        router.push("/dashboard");
        router.refresh();
      } else {
        toast.error("Invalid email or password");
      }
    });
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4">
      {search.get("registered") ? (
        <div className="rounded-xl bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
          Account created. You can sign in now.
        </div>
      ) : null}
      <Field label="Email" error={form.formState.errors.email?.message}>
        <Input autoFocus type="email" {...form.register("email")} />
      </Field>
      <Field label="Password" error={form.formState.errors.password?.message}>
        <Input type="password" {...form.register("password")} />
      </Field>
      <Button type="submit" disabled={pending}>
        {pending ? "Signing in..." : "Sign in"}
      </Button>
      <p className="text-center text-sm text-slate-500">
        New clinic?{" "}
        <Link href="/register" className="font-semibold text-emerald-700">
          Create an account
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
        toast.error(result.error ?? "Could not create account");
      }
    });
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4">
      <Field label="Clinic or doctor name" error={form.formState.errors.name?.message}>
        <Input autoFocus {...form.register("name")} />
      </Field>
      <Field label="Email" error={form.formState.errors.email?.message}>
        <Input type="email" {...form.register("email")} />
      </Field>
      <Field label="Phone" error={form.formState.errors.phone?.message}>
        <Input {...form.register("phone")} />
      </Field>
      <Field label="Password" error={form.formState.errors.password?.message}>
        <Input type="password" {...form.register("password")} />
      </Field>
      <Button type="submit" disabled={pending}>
        {pending ? "Creating..." : "Create account"}
      </Button>
      <p className="text-center text-sm text-slate-500">
        Already registered?{" "}
        <Link href="/login" className="font-semibold text-emerald-700">
          Sign in
        </Link>
      </p>
    </form>
  );
}
