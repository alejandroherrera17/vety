"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { PawPrint, Calendar, Building2, LogOut, Menu, X, UserCircle } from "lucide-react";
import { signOut } from "next-auth/react";

const navigation = [
  { name: "Mis Mascotas", href: "/portal/pets", icon: PawPrint },
  { name: "Solicitudes", href: "/portal/requests", icon: Calendar },
  { name: "Clínicas", href: "/portal/clinics", icon: Building2 },
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
      {/* Off-canvas menu for mobile */}
      {sidebarOpen && (
        <div className="relative z-50 lg:hidden">
          <div className="fixed inset-0 bg-black/80" onClick={() => setSidebarOpen(false)} />
          <div className="fixed inset-0 flex">
            <div className="relative mr-16 flex w-full max-w-xs flex-1 flex-col bg-surface border-r border-border">
              <div className="absolute left-full top-0 flex w-16 justify-center pt-5">
                <button type="button" className="-m-2.5 p-2.5" onClick={() => setSidebarOpen(false)}>
                  <span className="sr-only">Close sidebar</span>
                  <X className="h-6 w-6 text-foreground" aria-hidden="true" />
                </button>
              </div>
              <div className="flex h-16 shrink-0 items-center px-6 border-b border-border gap-3">
                <PawPrint className="h-8 w-8 text-primary" />
                <span className="text-xl font-bold tracking-tight text-foreground">Vety Portal</span>
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
                          isActive ? "bg-primary/10 text-primary" : "text-muted hover:bg-surface-hover hover:text-foreground",
                          "group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors"
                        )}
                        onClick={() => setSidebarOpen(false)}
                      >
                        <item.icon
                          className={classNames(
                            isActive ? "text-primary" : "text-muted group-hover:text-foreground",
                            "mr-3 flex-shrink-0 h-6 w-6 transition-colors"
                          )}
                          aria-hidden="true"
                        />
                        {item.name}
                      </Link>
                    );
                  })}
                </nav>
              </div>
              <div className="flex shrink-0 bg-surface border-t border-border p-4">
                <button
                  onClick={() => signOut({ callbackUrl: "/portal/login" })}
                  className="group block w-full flex-shrink-0"
                >
                  <div className="flex items-center">
                    <div>
                      <UserCircle className="inline-block h-9 w-9 rounded-full text-slate-400" />
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-foreground">{user?.name}</p>
                      <p className="text-xs font-medium text-slate-400 group-hover:text-slate-300 flex items-center gap-1 mt-1">
                        <LogOut className="h-3 w-3" /> Cerrar sesión
                      </p>
                    </div>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Static sidebar for desktop */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col lg:border-r lg:border-border lg:bg-surface">
        <div className="flex h-16 shrink-0 items-center px-6 border-b border-border gap-3">
          <PawPrint className="h-8 w-8 text-primary" />
          <span className="text-xl font-bold tracking-tight text-foreground">Vety Portal</span>
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
                    isActive ? "bg-primary/10 text-primary" : "text-muted hover:bg-surface-hover hover:text-foreground",
                    "group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors mb-1"
                  )}
                >
                  <item.icon
                    className={classNames(
                      isActive ? "text-primary" : "text-muted group-hover:text-foreground",
                      "mr-3 flex-shrink-0 h-5 w-5 transition-colors"
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
          <button onClick={() => signOut({ callbackUrl: "/portal/login" })} className="group block w-full flex-shrink-0">
            <div className="flex items-center">
              <div>
                <UserCircle className="inline-block h-9 w-9 rounded-full text-slate-400" />
              </div>
              <div className="ml-3 text-left">
                <p className="text-sm font-medium text-foreground">{user?.name}</p>
                <p className="text-xs font-medium text-slate-400 group-hover:text-slate-300 flex items-center gap-1 mt-1">
                  <LogOut className="h-3 w-3" /> Cerrar sesión
                </p>
              </div>
            </div>
          </button>
        </div>
      </div>

      <div className="flex flex-1 flex-col lg:pl-64 h-full bg-background">
        <div className="sticky top-0 z-10 bg-surface/80 backdrop-blur-md border-b border-border pl-1 pt-1 sm:pl-3 sm:pt-3 lg:hidden">
          <button
            type="button"
            className="-ml-0.5 -mt-0.5 inline-flex h-12 w-12 items-center justify-center rounded-md text-slate-400 hover:text-foreground focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary"
            onClick={() => setSidebarOpen(true)}
          >
            <span className="sr-only">Open sidebar</span>
            <Menu className="h-6 w-6" aria-hidden="true" />
          </button>
        </div>
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
