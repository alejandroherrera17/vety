import Link from "next/link";
import { Bot, Crown, LockKeyhole, ShieldCheck, Sparkles, Zap } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { PremiumCheckoutButton, PremiumTrustBadges } from "@/components/premium-checkout-button";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { BOLD_PREMIUM_AMOUNT, BOLD_PREMIUM_CURRENCY, PREMIUM_DAYS } from "@/lib/bold";
import { prisma } from "@/lib/prisma";
import { requireWorkspace } from "@/lib/session";

const benefits = [
  {
    icon: Bot,
    title: "VettiPets AI desbloqueado",
    description: "Asistente clinico con contexto de pacientes, agenda, vacunas e historial.",
  },
  {
    icon: ShieldCheck,
    title: "Validacion segura",
    description: "El pago se confirma por webhook y se valida contra monto, moneda y orderId.",
  },
  {
    icon: Zap,
    title: "Activacion inmediata",
    description: "Cuando Bold aprueba la orden, el workspace premium queda activo automaticamente.",
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
      where: { organizationId: workspace.organizationId },
      orderBy: { createdAt: "desc" },
      take: 4,
      select: { orderId: true, amount: true, currency: true, status: true, createdAt: true },
    }),
  ]);
  const premiumIsActive =
    Boolean(organization?.isPremium) &&
    (!organization?.premiumExpiresAt || organization.premiumExpiresAt > new Date());

  return (
    <AppShell>
      <div className="grid gap-5">
        <section className="overflow-hidden rounded-lg border border-white/10 bg-white/[0.06] shadow-2xl shadow-black/10 backdrop-blur-xl">
          <div className="grid gap-6 p-5 sm:p-7 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-center">
            <div>
              <Badge className="border-emerald-200/25 bg-emerald-300/10 text-emerald-100">
                <Crown className="h-3.5 w-3.5" />
                Premium workspace
              </Badge>
              <h1 className="mt-4 max-w-3xl text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
                Lleva tu clinica a un flujo premium con IA y automatizacion segura.
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
                Acceso premium por {PREMIUM_DAYS} dias para desbloquear funciones avanzadas en VettiPets. El pago se procesa con Bold y se confirma desde backend antes de activar el acceso.
              </p>
              <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center">
                <PremiumCheckoutButton disabled={premiumIsActive} />
                {premiumIsActive ? (
                  <Link href="/ai">
                    <Button type="button" variant="secondary" className="w-full sm:w-auto">
                      <Sparkles className="h-4 w-4" />
                      Abrir VettiPets AI
                    </Button>
                  </Link>
                ) : null}
              </div>
            </div>

            <div className="rounded-lg border border-emerald-200/20 bg-slate-950/35 p-5 shadow-2xl shadow-emerald-950/20">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-emerald-100">Plan Premium</p>
                  <p className="mt-2 text-4xl font-bold text-foreground">
                    {new Intl.NumberFormat("es-CO", {
                      style: "currency",
                      currency: BOLD_PREMIUM_CURRENCY,
                      maximumFractionDigits: 0,
                    }).format(BOLD_PREMIUM_AMOUNT)}
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">por workspace / {PREMIUM_DAYS} dias</p>
                </div>
                <span className="grid h-12 w-12 place-items-center rounded-lg border border-emerald-200/25 bg-emerald-300/10 text-emerald-100">
                  <Crown className="h-5 w-5" />
                </span>
              </div>
              <div className="mt-5 rounded-lg border border-white/10 bg-white/[0.045] p-4">
                <p className="text-sm font-semibold text-foreground">
                  {premiumIsActive ? "Actualmente tienes Premium activo" : "Premium listo para activar"}
                </p>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  {premiumIsActive && organization?.premiumExpiresAt
                    ? `Tu servicio premium esta activo y vence el ${new Intl.DateTimeFormat("es-CO", { dateStyle: "medium" }).format(organization.premiumExpiresAt)}. Todas las funciones premium estan desbloqueadas en este workspace.`
                    : `Pagas una orden unica por ${PREMIUM_DAYS} dias. Puedes renovar antes del vencimiento.`}
                </p>
              </div>
            </div>
          </div>
          <div className="border-t border-white/10 p-5 sm:p-7">
            <PremiumTrustBadges />
          </div>
        </section>

        <section className="grid gap-4 lg:grid-cols-3">
          {benefits.map((benefit) => (
            <Card key={benefit.title} className="p-5 transition hover:-translate-y-0.5 hover:border-emerald-200/25">
              <span className="grid h-11 w-11 place-items-center rounded-lg border border-emerald-200/20 bg-emerald-300/10 text-emerald-100">
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
              <ShieldCheck className="h-5 w-5 text-emerald-100" />
              Historial de pagos
            </h2>
            <div className="mt-4 grid gap-3">
              {recentPayments.length ? (
                recentPayments.map((payment) => (
                  <div
                    key={payment.orderId}
                    className="flex flex-col justify-between gap-3 rounded-lg border border-white/10 bg-white/[0.035] p-4 sm:flex-row sm:items-center"
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
                <div className="rounded-lg border border-dashed border-white/15 bg-white/[0.035] p-6 text-sm text-muted-foreground">
                  Aun no hay pagos registrados para este workspace.
                </div>
              )}
            </div>
          </Card>

          <Card className="p-5">
            <h2 className="flex items-center gap-2 text-lg font-bold text-foreground">
              <LockKeyhole className="h-5 w-5 text-emerald-100" />
              Seguridad
            </h2>
            <div className="mt-4 grid gap-3 text-sm leading-6 text-muted-foreground">
              <p>El frontend nunca activa premium por si solo.</p>
              <p>El webhook valida firma, monto, moneda y orderId antes de actualizar la clinica.</p>
              <p>Las notificaciones duplicadas quedan protegidas por estado aprobado e idempotencia.</p>
            </div>
          </Card>
        </section>
      </div>
    </AppShell>
  );
}

function statusClass(status: string) {
  if (status === "approved") return "border-emerald-300/25 bg-emerald-300/10 text-emerald-100";
  if (status === "rejected" || status === "failed") return "border-red-300/25 bg-red-300/10 text-red-100";

  return "border-amber-300/25 bg-amber-300/10 text-amber-100";
}
