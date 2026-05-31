"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { registerClient } from "@/app/actions/portal";
import { toast } from "sonner";
import Link from "next/link";
import { Loader2, PawPrint } from "lucide-react";

const loginSchema = z.object({
  email: z.string().email("Correo electronico invalido"),
  password: z.string().min(1, "La contrasena es requerida"),
});

export function PortalLoginForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
  });

  async function onSubmit(data: z.infer<typeof loginSchema>) {
    setIsLoading(true);
    const result = await signIn("credentials", {
      email: data.email,
      password: data.password,
      redirect: false,
    });

    if (result?.error) {
      toast.error("Credenciales incorrectas");
      setIsLoading(false);
    } else {
      router.push("/portal/pets");
      router.refresh();
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <div className="inline-flex w-fit items-center gap-2 rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-xs font-semibold text-sky-700">
          <PawPrint className="h-3.5 w-3.5" />
          Acceso de cliente
        </div>
        <p className="text-sm text-muted-foreground">
          Usa tu correo para entrar al portal y ver tus mascotas.
        </p>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-sky-700">Correo electronico</label>
        <Input
          {...register("email")}
          type="email"
          placeholder="tu@correo.com"
          className="border-border bg-white text-foreground placeholder:text-slate-500 focus-visible:ring-sky-500"
        />
        {errors.email ? <p className="text-xs text-red-600">{errors.email.message}</p> : null}
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-sky-700">Contrasena</label>
        <Input
          {...register("password")}
          type="password"
          className="border-border bg-white text-foreground placeholder:text-slate-500 focus-visible:ring-sky-500"
        />
        {errors.password ? <p className="text-xs text-red-600">{errors.password.message}</p> : null}
      </div>

      <Button
        type="submit"
        disabled={isLoading}
        className="w-full border-none bg-sky-500 text-white hover:bg-sky-600"
      >
        {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
        Iniciar sesion
      </Button>

      <p className="pt-4 text-center text-sm text-muted-foreground">
        No tienes cuenta?{" "}
        <Link href="/portal/register" className="font-semibold text-[#27ADF5] transition hover:text-foreground">
          Registrate
        </Link>
      </p>
    </form>
  );
}

const registerSchema = z.object({
  name: z.string().min(2, "El nombre es muy corto"),
  email: z.string().email("Correo electronico invalido"),
  password: z.string().min(6, "La contrasena debe tener al menos 6 caracteres"),
  phone: z.string().min(7, "El telefono es requerido"),
  document: z.string().optional(),
});

export function PortalRegisterForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<z.infer<typeof registerSchema>>({
    resolver: zodResolver(registerSchema),
  });

  async function onSubmit(data: z.infer<typeof registerSchema>) {
    setIsLoading(true);

    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => formData.append(key, value || ""));

    const result = await registerClient(formData);

    if (!result.success) {
      toast.error(result.error);
      setIsLoading(false);
      return;
    }

    toast.success("Cuenta creada exitosamente. Iniciando sesion...");

    const signInResult = await signIn("credentials", {
      email: data.email,
      password: data.password,
      redirect: false,
    });

    if (signInResult?.error) {
      toast.error("Error al iniciar sesion automaticamente");
      router.push("/portal/login");
    } else {
      router.push("/portal/pets");
      router.refresh();
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <div className="inline-flex w-fit items-center gap-2 rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-xs font-semibold text-sky-700">
          <PawPrint className="h-3.5 w-3.5" />
          Registro de cliente
        </div>
        <p className="text-sm text-muted-foreground">
          Crea tu cuenta personal para gestionar mascotas y citas.
        </p>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-sky-700">Nombre completo</label>
        <Input
          {...register("name")}
          type="text"
          placeholder="Juan Perez"
          className="border-border bg-white text-foreground placeholder:text-slate-500 focus-visible:ring-sky-500"
        />
        {errors.name ? <p className="text-xs text-red-600">{errors.name.message}</p> : null}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <label className="text-sm font-medium text-sky-700">Correo electronico</label>
          <Input
            {...register("email")}
            type="email"
            placeholder="tu@correo.com"
            className="border-border bg-white text-foreground placeholder:text-slate-500 focus-visible:ring-sky-500"
          />
          {errors.email ? <p className="text-xs text-red-600">{errors.email.message}</p> : null}
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-sky-700">Telefono</label>
          <Input
            {...register("phone")}
            type="tel"
            placeholder="300 000 0000"
            className="border-border bg-white text-foreground placeholder:text-slate-500 focus-visible:ring-sky-500"
          />
          {errors.phone ? <p className="text-xs text-red-600">{errors.phone.message}</p> : null}
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-sky-700">Documento (Opcional)</label>
        <Input
          {...register("document")}
          type="text"
          className="border-border bg-white text-foreground placeholder:text-slate-500 focus-visible:ring-sky-500"
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-sky-700">Contrasena</label>
        <Input
          {...register("password")}
          type="password"
          className="border-border bg-white text-foreground placeholder:text-slate-500 focus-visible:ring-sky-500"
        />
        {errors.password ? <p className="text-xs text-red-600">{errors.password.message}</p> : null}
      </div>

      <Button
        type="submit"
        disabled={isLoading}
        className="mt-2 w-full border-none bg-sky-500 text-white hover:bg-sky-600"
      >
        {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
        Crear cuenta
      </Button>

      <p className="pt-4 text-center text-sm text-muted-foreground">
        Ya tienes cuenta?{" "}
        <Link href="/portal/login" className="font-semibold text-[#27ADF5] transition hover:text-foreground">
          Inicia sesion
        </Link>
      </p>
    </form>
  );
}
