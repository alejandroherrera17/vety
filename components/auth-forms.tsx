"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Check,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  Phone,
  ShieldCheck,
  Sparkles,
  Stethoscope,
} from "lucide-react";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useTransition } from "react";
import { useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";
import { registerVeterinarian } from "@/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { loginSchema, registerSchema } from "@/lib/validations";
import type { z } from "zod";

type LoginValues = z.input<typeof loginSchema>;
type RegisterValues = z.input<typeof registerSchema>;

const strengthLabels = ["Muy debil", "Basica", "Solida", "Segura"];

function passwordStrength(password: string) {
  let score = password.length >= 8 ? 1 : 0;
  if (/[A-Z]/.test(password)) score += 1;
  if (/[0-9]/.test(password)) score += 1;
  if (/[^A-Za-z0-9]/.test(password)) score += 1;
  return Math.min(score, 4);
}

function PremiumField({
  label,
  error,
  icon,
  children,
}: {
  label: string;
  error?: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <label className="group grid gap-2 text-sm font-medium text-white/86">
      <span className="flex items-center justify-between">
        {label}
        {error ? <span className="text-xs text-cyan-200">{error}</span> : null}
      </span>
      <div className="relative">
        <span className="pointer-events-none absolute left-4 top-1/2 z-10 -translate-y-1/2 text-white/38 transition group-focus-within:text-cyan-200">
          {icon}
        </span>
        {children}
      </div>
    </label>
  );
}

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
        toast.error("Email o contrasena invalidos");
      }
    });
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4">
      {search.get("registered") ? (
        <div className="rounded-lg border border-emerald-300/35 bg-emerald-400/10 px-4 py-3 text-sm font-medium text-emerald-50">
          Cuenta creada. Ya puedes iniciar sesion.
        </div>
      ) : null}
      <PremiumField
        label="Email"
        error={form.formState.errors.email?.message}
        icon={<Mail className="h-4 w-4" />}
      >
        <Input
          autoFocus
          type="email"
          className="h-12 rounded-lg border-white/10 bg-white/[0.06] pl-11 pr-4 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] placeholder:text-white/30 hover:border-cyan-200/30 focus:border-cyan-200/60 focus:ring-cyan-300/15"
          {...form.register("email")}
        />
      </PremiumField>
      <PremiumField
        label="Contrasena"
        error={form.formState.errors.password?.message}
        icon={<LockKeyhole className="h-4 w-4" />}
      >
        <Input
          type="password"
          className="h-12 rounded-lg border-white/10 bg-white/[0.06] pl-11 pr-4 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] placeholder:text-white/30 hover:border-cyan-200/30 focus:border-cyan-200/60 focus:ring-cyan-300/15"
          {...form.register("password")}
        />
      </PremiumField>
      <Button type="submit" disabled={pending}>
        {pending ? "Iniciando sesion..." : "Iniciar sesion"}
      </Button>
      <p className="text-center text-sm text-slate-400">
        Nueva clinica?{" "}
        <Link href="/register" className="font-semibold text-cyan-100 transition hover:text-white">
          Crear cuenta
        </Link>
      </p>
    </form>
  );
}

export function RegisterForm() {
  const [pending, startTransition] = useTransition();
  const [showPassword, setShowPassword] = useState(false);
  const form = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { clinicName: "", adminName: "", email: "", phone: "", password: "" },
  });
  const password = useWatch({ control: form.control, name: "password" });
  const strength = passwordStrength(password ?? "");

  function onSubmit(values: RegisterValues) {
    startTransition(async () => {
      const result = await registerVeterinarian(values);
      if (result?.ok === false) {
        toast.error(result.error ?? "No se pudo crear la cuenta");
      }
    });
  }

  return (
    <motion.form
      initial={false}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: "easeOut" }}
      onSubmit={form.handleSubmit(onSubmit)}
      className="grid gap-5"
    >
      <div className="grid gap-2">
        <div className="inline-flex w-fit items-center gap-2 rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-1 text-xs font-semibold text-cyan-100 shadow-[0_0_28px_rgba(34,211,238,0.12)]">
          <Sparkles className="h-3.5 w-3.5" />
          Onboarding seguro para clinicas
        </div>
        <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
          Crea tu workspace veterinario
        </h1>
        <p className="max-w-md text-sm leading-6 text-slate-300">
          Configura VetyCare para agenda, historia clinica, clientes y pacientes
          con una experiencia moderna desde el primer dia.
        </p>
      </div>

      <div className="grid gap-4">
        <div className="grid gap-1">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-100/70">
            Workspace
          </p>
          <p className="text-sm text-slate-400">
            Estos datos crean la clinica y el primer usuario administrador.
          </p>
        </div>

        <PremiumField
          label="Nombre de clinica"
          error={form.formState.errors.clinicName?.message}
          icon={<Stethoscope className="h-4 w-4" />}
        >
          <Input
            autoFocus
            placeholder="Clinica Veterinaria Aurora"
            autoComplete="organization"
            className="h-12 rounded-lg border-white/10 bg-white/[0.06] pl-11 pr-4 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] placeholder:text-white/30 hover:border-cyan-200/30 focus:border-cyan-200/60 focus:ring-cyan-300/15"
            {...form.register("clinicName")}
          />
        </PremiumField>

        <PremiumField
          label="Administrador principal"
          error={form.formState.errors.adminName?.message}
          icon={<ShieldCheck className="h-4 w-4" />}
        >
          <Input
            placeholder="Dra. Laura Perez"
            autoComplete="name"
            className="h-12 rounded-lg border-white/10 bg-white/[0.06] pl-11 pr-4 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] placeholder:text-white/30 hover:border-cyan-200/30 focus:border-cyan-200/60 focus:ring-cyan-300/15"
            {...form.register("adminName")}
          />
        </PremiumField>

        <PremiumField
          label="Email"
          error={form.formState.errors.email?.message}
          icon={<Mail className="h-4 w-4" />}
        >
          <Input
            type="email"
            placeholder="admin@clinica.com"
            autoComplete="email"
            className="h-12 rounded-lg border-white/10 bg-white/[0.06] pl-11 pr-4 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] placeholder:text-white/30 hover:border-cyan-200/30 focus:border-cyan-200/60 focus:ring-cyan-300/15"
            {...form.register("email")}
          />
        </PremiumField>

        <PremiumField
          label="Telefono"
          error={form.formState.errors.phone?.message}
          icon={<Phone className="h-4 w-4" />}
        >
          <Input
            placeholder="+57 300 000 0000"
            autoComplete="tel"
            className="h-12 rounded-lg border-white/10 bg-white/[0.06] pl-11 pr-4 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] placeholder:text-white/30 hover:border-cyan-200/30 focus:border-cyan-200/60 focus:ring-cyan-300/15"
            {...form.register("phone")}
          />
        </PremiumField>

        <PremiumField
          label="Contrasena"
          error={form.formState.errors.password?.message}
          icon={<LockKeyhole className="h-4 w-4" />}
        >
          <Input
            type={showPassword ? "text" : "password"}
            placeholder="Minimo 8 caracteres"
            autoComplete="new-password"
            className="h-12 rounded-lg border-white/10 bg-white/[0.06] pl-11 pr-12 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] placeholder:text-white/30 hover:border-cyan-200/30 focus:border-cyan-200/60 focus:ring-cyan-300/15"
            {...form.register("password")}
          />
          <button
            type="button"
            aria-label={showPassword ? "Ocultar contrasena" : "Mostrar contrasena"}
            onClick={() => setShowPassword((value) => !value)}
            className="absolute right-3 top-1/2 z-10 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-lg text-white/45 transition hover:bg-white/10 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-cyan-200"
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </PremiumField>

        <div className="grid gap-2" aria-live="polite">
          <div className="grid grid-cols-4 gap-2">
            {[1, 2, 3, 4].map((level) => (
              <span
                key={level}
                className={cn(
                  "h-1.5 rounded-full bg-white/10 transition-colors",
                  strength >= level &&
                    (strength < 3 ? "bg-cyan-300/65" : "bg-emerald-300/80"),
                )}
              />
            ))}
          </div>
          <p className="flex items-center gap-2 text-xs text-slate-400">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-300" />
            Fortaleza: {strengthLabels[Math.max(strength - 1, 0)]}
          </p>
        </div>
      </div>

      <motion.button
        whileHover={{ y: -1 }}
        whileTap={{ scale: 0.99 }}
        type="submit"
        disabled={pending}
        className="group mt-1 inline-flex h-12 items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-cyan-300 via-sky-400 to-emerald-300 px-5 text-sm font-bold text-slate-950 shadow-[0_18px_55px_rgba(34,211,238,0.22)] transition disabled:pointer-events-none disabled:opacity-70"
      >
        {pending ? "Creando workspace..." : "Crear cuenta"}
        <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
      </motion.button>

      <div className="flex flex-col gap-3 border-t border-white/10 pt-5 text-sm text-slate-300 sm:flex-row sm:items-center sm:justify-between">
        <span className="inline-flex items-center gap-2">
          <Check className="h-4 w-4 text-emerald-300" />
          Datos protegidos y acceso privado
        </span>
        <Link href="/login" className="font-semibold text-cyan-100 transition hover:text-white">
          Ya tengo cuenta
        </Link>
      </div>
    </motion.form>
  );
}
