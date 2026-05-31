import Link from "next/link";
import { Bot, CalendarDays, Crown, FileText, LayoutDashboard, PawPrint, ShieldCheck, Sparkles, Users, Zap } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { PremiumCheckoutButton, PremiumTrustBadges } from "@/components/premium-checkout-button";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { BOLD_PREMIUM_AMOUNT, BOLD_PREMIUM_CURRENCY, PREMIUM_DAYS } from "@/lib/bold";
import { prisma } from "@/lib/prisma";
import { requireWorkspace } from "@/lib/session";

const offerings = [
  {
    icon: LayoutDashboard,
    title: "Panel completo de la clinica",
    description: "Maneja el dia a dia con una vista central clara para trabajo rapido y ordenado.",
  },
  {
    icon: CalendarDays,
    title: "Agenda y solicitudes",
    description: "Organiza citas, revisa solicitudes del portal y mantiene la operacion en movimiento.",
  },
  {
    icon: PawPrint,
    title: "Clientes y mascotas",
    description: "Consulta historiales, perfiles, datos de contacto y la relacion de cada paciente.",
  },
  {
    icon: FileText,
    title: "Historias, recetas y PDFs",
    description: "Genera documentos listos para compartir con una identidad profesional de la clinica.",
  },
  {
    icon: Bot,
    title: "VettiPets AI",
    description: "Apoyo inteligente para consultas, resumenes y tareas que ahorran tiempo al equipo.",
  },
  {
    icon: Users,
    title: "Equipo con acceso compartido",
    description: "La suscripcion la paga la clinica y queda disponible para todos los veterinarios asociados.",
  },
  {
    icon: Sparkles,
    title: "Portal del cliente",
    description: "El propietario de la mascota reserva, sigue solicitudes y se mantiene conectado sin pagar.",
  },
  {
    icon: ShieldCheck,
    title: "Imagen confiable de marca",
    description: "Logo, nombre y presencia de la veterinaria en una experiencia limpia y coherente.",
  },
  {
    icon: Zap,
    title: "Activacion inmediata",
    description: "Cuando el pago se aprueba, todo el acceso premium de la clinica queda activo sin pasos extra.",
  },
];

export default async function PremiumPage() {
  const workspace = await requireWorkspace();
  const [organization, recentPayments] = await Promise.all([
    prisma.organization.findUnique({
      where: { id: workspace.organizationId },
      select: { isPremium: true, premiumSince: true, premiumExpiresAt: true },
    }),
    prisma.payment.findMany({
      where: {
        organizationId: workspace.organizationId,
        userId: workspace.userId,
        userEmail: workspace.email,
      },
      orderBy: { createdAt: "desc" },
      take: 4,
      select: { orderId: true, amount: true, currency: true, status: true, createdAt: true, userEmail: true },
    }),
  ]);
  const premiumIsActive =
    Boolean(organization?.isPremium) &&
    (!organization?.premiumExpiresAt || organization.premiumExpiresAt > new Date());

  return (
    <AppShell>
      <div className="grid gap-5">
        <section className="overflow-hidden rounded-lg border border-border bg-white shadow-2xl shadow-black/10 backdrop-blur-xl">
          <div className="grid gap-6 p-5 sm:p-7 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-center">
            <div>
              <Badge className="border-sky-200/25 bg-sky-300/10 text-[#27ADF5]">
                <Crown className="h-3.5 w-3.5" />
                Suscripcion de la clinica
              </Badge>
              <h1 className="mt-4 max-w-3xl text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
                {premiumIsActive
                  ? "Tu clinica ya tiene todas las funciones desbloqueadas."
                  : "Desbloquea todas las funciones de la clinica con una sola suscripcion."}
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
                La suscripcion vive a nivel de clinica, asi que todos los veterinarios asociados heredan el mismo acceso. Aqui encuentras todo lo que la plataforma puede darte en un solo lugar.
              </p>
              <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center">
                {premiumIsActive ? (
                  <>
                    <div className="inline-flex w-full items-center gap-2 rounded-lg border border-sky-200 bg-sky-50 px-4 py-3 text-sm font-semibold text-sky-700 sm:w-auto">
                      <ShieldCheck className="h-4 w-4" />
                      Suscripcion activa para toda la clinica
                    </div>
                    <Link href="/ai">
                      <Button type="button" variant="secondary" className="w-full sm:w-auto">
                        <Sparkles className="h-4 w-4" />
                        Explorar la plataforma
                      </Button>
                    </Link>
                  </>
                ) : (
                  <PremiumCheckoutButton />
                )}
              </div>
            </div>

            <div className="rounded-lg border border-border bg-white p-5 shadow-xl shadow-sky-950/10">
              <div className="flex items-start justify-between gap-4">
                <div>
                <p className="text-sm font-semibold text-[#27ADF5]">Plan Premium</p>
                  <p className="mt-2 text-4xl font-bold text-foreground">
                    {new Intl.NumberFormat("es-CO", {
                      style: "currency",
                      currency: BOLD_PREMIUM_CURRENCY,
                      maximumFractionDigits: 0,
                    }).format(BOLD_PREMIUM_AMOUNT)}
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">por clinica / {PREMIUM_DAYS} dias</p>
                </div>
                <span className="grid h-12 w-12 place-items-center rounded-lg border border-sky-200/25 bg-sky-300/10 text-[#27ADF5]">
                  <Crown className="h-5 w-5" />
                </span>
              </div>
              <div className="mt-5 rounded-lg border border-border bg-secondary p-4">
                <p className="text-sm font-semibold text-foreground">
                  {premiumIsActive ? "Actualmente tienes la suscripcion activa" : "Suscripcion lista para activar"}
                </p>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  {premiumIsActive && organization?.premiumExpiresAt
                    ? `Tu suscripcion esta activa y vence el ${new Intl.DateTimeFormat("es-CO", { dateStyle: "medium" }).format(organization.premiumExpiresAt)}. Toda la clinica comparte el acceso completo.`
                    : `Con una sola compra de ${new Intl.NumberFormat("es-CO", {
                        style: "currency",
                        currency: BOLD_PREMIUM_CURRENCY,
                        maximumFractionDigits: 0,
                      }).format(BOLD_PREMIUM_AMOUNT)} desbloqueas toda la experiencia de la plataforma durante ${PREMIUM_DAYS} dias.`}
                </p>
              </div>
            </div>
          </div>
          <div className="border-t border-border p-5 sm:p-7">
            <PremiumTrustBadges />
          </div>
        </section>

        <section className="grid gap-4 lg:grid-cols-3">
          {offerings.map((benefit) => (
            <Card key={benefit.title} className="p-5 transition hover:-translate-y-0.5 hover:border-sky-200/25">
              <span className="grid h-11 w-11 place-items-center rounded-lg border border-sky-200/20 bg-sky-300/10 text-[#27ADF5]">
                <benefit.icon className="h-5 w-5" />
              </span>
              <h2 className="mt-4 text-lg font-bold text-foreground">{benefit.title}</h2>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">{benefit.description}</p>
            </Card>
          ))}
        </section>

        <section className="grid gap-4 lg:grid-cols-[1fr_360px]">
          <Card className="p-5">
            <h2 className="flex items-center gap-2 text-lg font-bold text-foreground">
              <ShieldCheck className="h-5 w-5 text-[#27ADF5]" />
              Historial de esta cuenta
            </h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Aqui solo aparecen los pagos creados desde este acceso. La suscripcion, cuando se activa, sigue siendo de toda la clinica.
            </p>
            <div className="mt-4 grid gap-3">
              {recentPayments.length ? (
                recentPayments.map((payment) => (
                  <div
                    key={payment.orderId}
                    className="flex flex-col justify-between gap-3 rounded-lg border border-border bg-white p-4 sm:flex-row sm:items-center"
                  >
                    <div>
                      <p className="font-mono text-xs text-muted-foreground">{payment.orderId}</p>
                      <p className="mt-1 text-sm font-semibold text-foreground">
                        {new Intl.NumberFormat("es-CO", {
                          style: "currency",
                          currency: payment.currency,
                          maximumFractionDigits: 0,
                        }).format(payment.amount)}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-muted-foreground">
                        {new Intl.DateTimeFormat("es-CO", { dateStyle: "medium" }).format(payment.createdAt)}
                      </span>
                      <Badge className={statusClass(payment.status)}>{payment.status}</Badge>
                      {payment.status === "pending" ? (
                        <Link href={`/premium/resultado?orderId=${payment.orderId}`}>
                          <Button type="button" variant="ghost" size="sm">
                            Verificar
                          </Button>
                        </Link>
                      ) : null}
                    </div>
                  </div>
                ))
              ) : (
                <div className="rounded-lg border border-dashed border-border bg-white p-6 text-sm text-muted-foreground">
                  Esta cuenta aun no ha realizado pagos.
                </div>
              )}
            </div>
          </Card>

          <Card className="p-5">
            <h2 className="flex items-center gap-2 text-lg font-bold text-foreground">
              <Sparkles className="h-5 w-5 text-[#27ADF5]" />
              Lo que tu clinica gana
            </h2>
            <div className="mt-4 grid gap-3 text-sm leading-6 text-muted-foreground">
              <p>Una experiencia mas ordenada para tu equipo y para tus pacientes.</p>
              <p>Una marca mas profesional cuando compartes PDFs, historial y documentos.</p>
              <p>Una sola suscripcion que cubre a toda la clinica, sin pagar por cada veterinario.</p>
            </div>
          </Card>
        </section>
      </div>
    </AppShell>
  );
}

function statusClass(status: string) {
  if (status === "approved") return "border-sky-300/25 bg-sky-300/10 text-[#27ADF5]";
  if (status === "rejected" || status === "failed") return "border-red-300/25 bg-red-300/10 text-[#F52727]";

  return "border-amber-300/25 bg-amber-300/10 text-amber-700";
}
