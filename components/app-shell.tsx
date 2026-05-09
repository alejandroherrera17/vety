import Link from "next/link";
import { getServerSession } from "next-auth";
import {
  CalendarDays,
  LayoutDashboard,
  LogOut,
  Palette,
  PawPrint,
  Sparkles,
  Stethoscope,
  Users,
} from "lucide-react";
import { SignOutButton } from "@/components/sign-out-button";
import { ThemeToggle } from "@/components/theme-toggle";
import { authOptions } from "@/lib/auth";

const nav = [
  { href: "/dashboard", label: "Panel de control", icon: LayoutDashboard },
  { href: "/appointments", label: "Agenda", icon: CalendarDays },
  { href: "/clients", label: "Clientes", icon: Users },
  { href: "/pets", label: "Mascotas", icon: PawPrint },
  { href: "/theme", label: "Temas", icon: Palette },
];

export async function AppShell({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);

  return (
    <div className="relative min-h-screen overflow-hidden bg-background text-foreground">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(34,211,238,0.13),transparent_30%),radial-gradient(circle_at_85%_5%,rgba(16,185,129,0.11),transparent_28%),linear-gradient(135deg,rgba(255,255,255,0.045),transparent_38%)]" />
      <div className="pointer-events-none fixed inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-200/45 to-transparent" />

      <aside className="fixed inset-y-0 left-0 z-30 hidden w-72 border-r border-white/10 bg-sidebar/72 px-4 py-5 text-sidebar-foreground shadow-2xl shadow-black/25 backdrop-blur-2xl lg:block">
        <Link href="/dashboard" className="flex items-center gap-3 rounded-lg px-2 py-1 text-sidebar-foreground">
          <span className="grid h-12 w-12 place-items-center rounded-lg border border-cyan-200/25 bg-cyan-300/10 text-cyan-100 shadow-[0_0_42px_rgba(34,211,238,0.16)]">
            <Stethoscope className="h-5 w-5" />
          </span>
          <span>
            <span className="block text-lg font-semibold tracking-tight">VetyCare</span>
            <span className="block text-xs uppercase tracking-[0.2em] text-cyan-100/60">Veterinary OS</span>
          </span>
        </Link>

        <div className="mt-7 rounded-lg border border-white/10 bg-white/[0.045] p-3 shadow-inner">
          <div className="flex items-center gap-2 text-xs font-semibold text-cyan-100">
            <Sparkles className="h-3.5 w-3.5" />
            Clinica conectada
          </div>
          <p className="mt-2 text-xs leading-5 text-muted-foreground">
            Operacion, pacientes y agenda en un mismo workspace premium.
          </p>
        </div>

        <nav className="mt-7 grid gap-1">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold text-muted-foreground transition hover:-translate-y-0.5 hover:bg-white/[0.07] hover:text-foreground"
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="absolute inset-x-4 bottom-5 rounded-lg border border-white/10 bg-card/75 p-4 shadow-xl shadow-black/20 backdrop-blur-xl">
          <div className="mb-2 flex items-center justify-between">
            <p className="truncate text-sm font-semibold text-card-foreground">
              {session?.user?.name}
            </p>
            <ThemeToggle />
          </div>
          <p className="truncate text-xs text-muted-foreground">{session?.user?.email}</p>
          <SignOutButton>
            <LogOut className="h-4 w-4" />
            Cerrar sesion
          </SignOutButton>
        </div>
      </aside>

      <div className="relative lg:pl-72">
        <header className="sticky top-0 z-20 border-b border-white/10 bg-background/82 px-4 py-3 shadow-lg shadow-black/10 backdrop-blur-xl lg:hidden">
          <div className="flex items-center justify-between">
            <Link href="/dashboard" className="flex items-center gap-2 font-bold">
              <Stethoscope className="h-5 w-5 text-cyan-100" />
              VetyCare
            </Link>
            <nav className="flex items-center gap-1">
              {nav.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="rounded-lg p-2 text-muted-foreground hover:bg-white/10 hover:text-foreground"
                  aria-label={item.label}
                >
                  <item.icon className="h-5 w-5" />
                </Link>
              ))}
            </nav>
          </div>
        </header>

        <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          {children}
        </main>
      </div>
    </div>
  );
}
