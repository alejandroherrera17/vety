"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Building2, Calendar, LogOut, Menu, PawPrint, UserCircle, X } from "lucide-react";
import { signOut } from "next-auth/react";

const navigation = [
  { name: "Mis Mascotas", href: "/portal/pets", icon: PawPrint },
  { name: "Solicitudes", href: "/portal/requests", icon: Calendar },
  { name: "Clinicas", href: "/portal/clinics", icon: Building2 },
];

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(" ");
}

export function PortalAppShell({
  children,
  user,
}: {
  children: React.ReactNode;
  user?: { name?: string | null; email?: string | null };
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();

  return (
    <div className="h-full" data-theme="blue_clinic">
      {sidebarOpen ? (
        <div className="relative z-50 lg:hidden">
          <div className="fixed inset-0 bg-black/60" onClick={() => setSidebarOpen(false)} />
          <div className="fixed inset-0 flex">
            <div className="relative mr-16 flex w-full max-w-xs flex-1 flex-col border-r border-border bg-white">
              <div className="absolute left-full top-0 flex w-16 justify-center pt-5">
                <button type="button" className="-m-2.5 p-2.5" onClick={() => setSidebarOpen(false)}>
                  <span className="sr-only">Cerrar barra lateral</span>
                  <X className="h-6 w-6 text-foreground" aria-hidden="true" />
                </button>
              </div>
              <div className="flex h-16 shrink-0 items-center gap-3 border-b border-border px-6">
                <PawPrint className="h-8 w-8 text-[#27ADF5]" />
                <span className="text-xl font-bold tracking-tight text-foreground">VettiPets Portal</span>
              </div>
              <div className="flex flex-1 flex-col overflow-y-auto pt-5 pb-4">
                <nav className="flex-1 space-y-1 px-2">
                  {navigation.map((item) => {
                    const isActive = pathname.startsWith(item.href);
                    return (
                      <Link
                        key={item.name}
                        href={item.href}
                        className={classNames(
                          isActive ? "bg-[#edf8ff] text-[#27ADF5]" : "text-muted-foreground hover:bg-[#edf8ff] hover:text-foreground",
                          "group flex items-center rounded-md px-2 py-2 text-sm font-medium transition-colors",
                        )}
                        onClick={() => setSidebarOpen(false)}
                      >
                        <item.icon
                          className={classNames(
                            isActive ? "text-[#27ADF5]" : "text-muted-foreground group-hover:text-foreground",
                            "mr-3 h-6 w-6 flex-shrink-0 transition-colors",
                          )}
                          aria-hidden="true"
                        />
                        {item.name}
                      </Link>
                    );
                  })}
                </nav>
              </div>
              <div className="flex shrink-0 border-t border-border p-4">
                <button onClick={() => signOut({ callbackUrl: "/portal/login" })} className="block w-full flex-shrink-0">
                  <div className="flex items-center">
                    <UserCircle className="inline-block h-9 w-9 rounded-full text-muted-foreground" />
                    <div className="ml-3 text-left">
                      <p className="text-sm font-medium text-foreground">{user?.name}</p>
                      <p className="mt-1 flex items-center gap-1 text-xs font-medium text-muted-foreground">
                        <LogOut className="h-3 w-3" /> Cerrar sesion
                      </p>
                    </div>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col lg:border-r lg:border-border lg:bg-white">
        <div className="flex h-16 shrink-0 items-center gap-3 border-b border-border px-6">
          <PawPrint className="h-8 w-8 text-[#27ADF5]" />
          <span className="text-xl font-bold tracking-tight text-foreground">VettiPets Portal</span>
        </div>
        <div className="flex flex-1 flex-col overflow-y-auto">
          <nav className="flex-1 space-y-1 px-4 py-6">
            {navigation.map((item) => {
              const isActive = pathname.startsWith(item.href);
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={classNames(
                    isActive ? "bg-[#edf8ff] text-[#27ADF5]" : "text-muted-foreground hover:bg-[#edf8ff] hover:text-foreground",
                    "group mb-1 flex items-center rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  )}
                >
                  <item.icon
                    className={classNames(
                      isActive ? "text-[#27ADF5]" : "text-muted-foreground group-hover:text-foreground",
                      "mr-3 h-5 w-5 flex-shrink-0 transition-colors",
                    )}
                    aria-hidden="true"
                  />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>
        <div className="flex shrink-0 border-t border-border p-4">
          <button onClick={() => signOut({ callbackUrl: "/portal/login" })} className="block w-full flex-shrink-0">
            <div className="flex items-center">
              <UserCircle className="inline-block h-9 w-9 rounded-full text-muted-foreground" />
              <div className="ml-3 text-left">
                <p className="text-sm font-medium text-foreground">{user?.name}</p>
                <p className="mt-1 flex items-center gap-1 text-xs font-medium text-muted-foreground">
                  <LogOut className="h-3 w-3" /> Cerrar sesion
                </p>
              </div>
            </div>
          </button>
        </div>
      </div>

      <div className="flex h-full flex-1 flex-col bg-background lg:pl-64">
        <div className="sticky top-0 z-10 border-b border-border bg-white/90 pl-1 pt-1 backdrop-blur-md sm:pl-3 sm:pt-3 lg:hidden">
          <button
            type="button"
            className="-ml-0.5 -mt-0.5 inline-flex h-12 w-12 items-center justify-center rounded-md text-muted-foreground hover:text-foreground focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary"
            onClick={() => setSidebarOpen(true)}
          >
            <span className="sr-only">Abrir barra lateral</span>
            <Menu className="h-6 w-6" aria-hidden="true" />
          </button>
        </div>
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
