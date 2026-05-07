import Link from "next/link";
import { getServerSession } from "next-auth";
import { CalendarDays, Stethoscope, LayoutDashboard, PawPrint, Users, LogOut, Palette, Sun, Moon } from "lucide-react";
import { authOptions } from "@/lib/auth";
import { SignOutButton } from "@/components/sign-out-button";
import { ThemeToggle } from "@/components/theme-toggle";

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
    <div className="min-h-screen bg-background text-foreground">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 border-r border-border bg-sidebar px-4 py-5 text-sidebar-foreground lg:block">
        <Link href="/dashboard" className="flex items-center gap-3 px-2 text-sidebar-foreground">
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-sm">
            <Stethoscope className="h-5 w-5" />
          </span>
          <span>
            <span className="block text-lg font-bold">VetyCare</span>
            <span className="block text-xs text-muted-foreground">Espacio de trabajo de la clínica</span>
          </span>
        </Link>
        <nav className="mt-8 grid gap-1">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground"
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="absolute inset-x-4 bottom-5 rounded-2xl border border-border bg-card p-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-semibold text-card-foreground">{session?.user?.name}</p>
            <ThemeToggle />
          </div>
          <p className="truncate text-xs text-muted-foreground">{session?.user?.email}</p>
          <SignOutButton>
            <LogOut className="h-4 w-4" />
            Cerrar sesión
          </SignOutButton>
        </div>
      </aside>
      <div className="lg:pl-64">
        <header className="sticky top-0 z-20 border-b border-black/15 bg-white/95 px-4 py-3 backdrop-blur lg:hidden">
          <div className="flex items-center justify-between">
            <Link href="/dashboard" className="flex items-center gap-2 font-bold">
              <Stethoscope className="h-5 w-5 text-black" />
              VetyCare
            </Link>
            <nav className="flex items-center gap-1">
              {nav.map((item) => (
                <Link key={item.href} href={item.href} className="rounded-xl p-2 text-black/70 hover:bg-black/10">
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
