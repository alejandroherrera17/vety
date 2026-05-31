import Link from "next/link";
import { getServerSession } from "next-auth";
import {
  CalendarDays,
  Bot,
  ClipboardList,
  Crown,
  Hospital,
  LayoutDashboard,
  LogOut,
  PawPrint,
  Sparkles,
  Stethoscope,
  Users,
  Inbox,
} from "lucide-react";
import { SignOutButton } from "@/components/sign-out-button";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const nav = [
  { href: "/dashboard", label: "Panel de control", icon: LayoutDashboard, roles: ["admin", "veterinarian", "receptionist"] },
  { href: "/dashboard/requests", label: "Solicitudes", icon: Inbox, roles: ["admin", "veterinarian", "receptionist"] },
  { href: "/ai", label: "VettiPets AI", icon: Bot, roles: ["admin", "veterinarian", "receptionist"] },
  { href: "/premium", label: "Premium", icon: Crown, roles: ["admin", "veterinarian", "receptionist"] },
  { href: "/appointments", label: "Agenda", icon: CalendarDays, roles: ["admin", "veterinarian", "receptionist"] },
  { href: "/clients", label: "Clientes", icon: Users, roles: ["admin", "receptionist"] },
  { href: "/pets", label: "Mascotas", icon: PawPrint, roles: ["admin", "veterinarian", "receptionist"] },
  { href: "/team", label: "Equipo", icon: ClipboardList, roles: ["admin"] },
  { href: "/clinic", label: "Clinica", icon: Hospital, roles: ["admin"] },
];

export async function AppShell({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);
  const role = session?.user?.role ?? "veterinarian";
  const visibleNav = nav.filter((item) => item.roles.includes(role));
  const organization = session?.user?.organizationId
    ? await prisma.organization.findUnique({
        where: { id: session.user.organizationId },
        select: { name: true, logoUrl: true },
      })
    : null;
  const workspaceName = organization?.name ?? "VettiPets";

  return (
    <div className="relative min-h-screen overflow-hidden bg-background text-foreground">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(39,173,245,0.10),transparent_30%),linear-gradient(180deg,#ffffff,rgba(244,250,255,0.88))]" />
      <div className="pointer-events-none fixed inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#27ADF5]/55 to-transparent" />

      <aside className="fixed inset-y-0 left-0 z-30 hidden w-72 flex-col border-r border-[#d6ecfa] bg-sidebar/95 px-4 py-5 text-sidebar-foreground shadow-2xl shadow-sky-950/10 backdrop-blur-2xl lg:flex">
        <Link href="/dashboard" className="flex items-center gap-3 rounded-lg px-2 py-1 text-sidebar-foreground">
          <span className="relative grid h-12 w-12 shrink-0 place-items-center overflow-hidden rounded-lg border border-[#27ADF5]/30 bg-[#27ADF5]/10 text-[#27ADF5] shadow-[0_0_30px_rgba(39,173,245,0.16)]">
            {organization?.logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={organization.logoUrl} alt={workspaceName} className="h-full w-full object-cover" />
            ) : (
              <Stethoscope className="h-5 w-5" />
            )}
          </span>
          <span className="min-w-0">
            <span className="block truncate text-lg font-semibold tracking-tight">{workspaceName}</span>
          </span>
        </Link>

        <div className="mt-7 rounded-lg border border-[#d6ecfa] bg-[#f4faff] p-3 shadow-inner">
          <div className="flex items-center gap-2 text-xs font-semibold text-[#27ADF5]">
            {session?.user?.role === "admin" ? <Crown className="h-3.5 w-3.5" /> : <Sparkles className="h-3.5 w-3.5" />}
            {session?.user?.role ?? "workspace"}
          </div>
          <p className="mt-2 text-xs leading-5 text-muted-foreground">
            Operacion, pacientes y agenda en un mismo workspace premium.
          </p>
        </div>

        <nav className="mt-7 grid min-h-0 flex-1 gap-1 overflow-y-auto pr-1">
          {visibleNav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold text-muted-foreground transition hover:-translate-y-0.5 hover:bg-[#edf8ff] hover:text-foreground"
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="mt-5 shrink-0 rounded-lg border border-[#d6ecfa] bg-white p-4 shadow-xl shadow-sky-950/10">
          <div className="mb-2 flex items-center justify-between">
            <p className="truncate text-sm font-semibold text-card-foreground">
              {session?.user?.name}
            </p>
            <span className="rounded-full border border-[#27ADF5]/25 bg-[#27ADF5]/10 px-2 py-1 text-[10px] font-bold uppercase tracking-normal text-[#27ADF5]">
              Activo
            </span>
          </div>
          <p className="truncate text-xs text-muted-foreground">{session?.user?.email}</p>
          <SignOutButton>
            <LogOut className="h-4 w-4" />
            Cerrar sesion
          </SignOutButton>
        </div>
      </aside>

      <div className="relative lg:pl-72">
        <header className="sticky top-0 z-20 border-b border-[#d6ecfa] bg-white/92 px-4 py-3 shadow-lg shadow-sky-950/10 backdrop-blur-xl lg:hidden">
          <div className="flex items-center justify-between">
            <Link href="/dashboard" className="flex items-center gap-2 font-bold">
              <span className="relative grid h-7 w-7 place-items-center overflow-hidden rounded-lg border border-[#27ADF5]/25 bg-[#27ADF5]/10 text-[#27ADF5]">
                {organization?.logoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={organization.logoUrl} alt={workspaceName} className="h-full w-full object-cover" />
                ) : (
                  <Stethoscope className="h-4 w-4" />
                )}
              </span>
              <span className="max-w-[38vw] truncate">{workspaceName}</span>
            </Link>
            <nav className="flex max-w-[72vw] items-center gap-1 overflow-x-auto">
              {visibleNav.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="rounded-lg p-2 text-muted-foreground hover:bg-[#edf8ff] hover:text-foreground"
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
