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
import { Loader2 } from "lucide-react";

const loginSchema = z.object({
  email: z.string().email("Correo electrónico inválido"),
  password: z.string().min(1, "La contraseña es requerida"),
});

export function PortalLoginForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<z.infer<typeof loginSchema>>({
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
        <label className="text-sm font-medium text-emerald-100">Correo Electrónico</label>
        <Input 
          {...register("email")}
          type="email" 
          placeholder="tu@correo.com" 
          className="bg-white/5 border-white/10 text-white placeholder:text-slate-500 focus-visible:ring-emerald-500" 
        />
        {errors.email && <p className="text-xs text-red-400">{errors.email.message}</p>}
      </div>

      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <label className="text-sm font-medium text-emerald-100">Contraseña</label>
        </div>
        <Input 
          {...register("password")}
          type="password" 
          className="bg-white/5 border-white/10 text-white placeholder:text-slate-500 focus-visible:ring-emerald-500" 
        />
        {errors.password && <p className="text-xs text-red-400">{errors.password.message}</p>}
      </div>

      <Button 
        type="submit" 
        disabled={isLoading}
        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white border-none"
      >
        {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
        Iniciar Sesión
      </Button>

      <p className="text-center text-sm text-slate-400 pt-4">
        ¿No tienes cuenta? <Link href="/portal/register" className="text-emerald-400 hover:text-emerald-300 hover:underline">Regístrate</Link>
      </p>
    </form>
  );
}

const registerSchema = z.object({
  name: z.string().min(2, "El nombre es muy corto"),
  email: z.string().email("Correo electrónico inválido"),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
  phone: z.string().min(7, "El teléfono es requerido"),
  document: z.string().optional(),
});

export function PortalRegisterForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<z.infer<typeof registerSchema>>({
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

    toast.success("Cuenta creada exitosamente. Iniciando sesión...");

    // Sign in automatically
    const signInResult = await signIn("credentials", {
      email: data.email,
      password: data.password,
      redirect: false,
    });

    if (signInResult?.error) {
      toast.error("Error al iniciar sesión automáticamente");
      router.push("/portal/login");
    } else {
      router.push("/portal/pets");
      router.refresh();
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <label className="text-sm font-medium text-emerald-100">Nombre Completo</label>
        <Input 
          {...register("name")}
          type="text" 
          placeholder="Juan Pérez" 
          className="bg-white/5 border-white/10 text-white placeholder:text-slate-500 focus-visible:ring-emerald-500" 
        />
        {errors.name && <p className="text-xs text-red-400">{errors.name.message}</p>}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-emerald-100">Correo Electrónico</label>
          <Input 
            {...register("email")}
            type="email" 
            placeholder="tu@correo.com" 
            className="bg-white/5 border-white/10 text-white placeholder:text-slate-500 focus-visible:ring-emerald-500" 
          />
          {errors.email && <p className="text-xs text-red-400">{errors.email.message}</p>}
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-emerald-100">Teléfono</label>
          <Input 
            {...register("phone")}
            type="tel" 
            placeholder="300 000 0000" 
            className="bg-white/5 border-white/10 text-white placeholder:text-slate-500 focus-visible:ring-emerald-500" 
          />
          {errors.phone && <p className="text-xs text-red-400">{errors.phone.message}</p>}
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-emerald-100">Documento (Opcional)</label>
        <Input 
          {...register("document")}
          type="text" 
          className="bg-white/5 border-white/10 text-white placeholder:text-slate-500 focus-visible:ring-emerald-500" 
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-emerald-100">Contraseña</label>
        <Input 
          {...register("password")}
          type="password" 
          className="bg-white/5 border-white/10 text-white placeholder:text-slate-500 focus-visible:ring-emerald-500" 
        />
        {errors.password && <p className="text-xs text-red-400">{errors.password.message}</p>}
      </div>

      <Button 
        type="submit" 
        disabled={isLoading}
        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white border-none mt-2"
      >
        {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
        Crear Cuenta
      </Button>

      <p className="text-center text-sm text-slate-400 pt-4">
        ¿Ya tienes cuenta? <Link href="/portal/login" className="text-emerald-400 hover:text-emerald-300 hover:underline">Inicia Sesión</Link>
      </p>
    </form>
  );
}
