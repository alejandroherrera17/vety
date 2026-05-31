"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { CheckCircle2, Clock3, Loader2, XCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

type VerificationState = "checking" | "approved" | "pending" | "rejected" | "failed" | "not_found" | "error";

type VerificationResponse = {
  status?: VerificationState;
  isPremium?: boolean;
  premiumExpiresAt?: string | null;
  error?: string;
};

export function PremiumResultPanel({ orderId }: { orderId?: string }) {
  const router = useRouter();
  const [status, setStatus] = useState<VerificationState>(orderId ? "checking" : "not_found");
  const [expiresAt, setExpiresAt] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!orderId) {
      return;
    }

    const safeOrderId = orderId;
    let attempts = 0;
    let cancelled = false;

    async function verify() {
      attempts += 1;

      try {
        const response = await fetch(`/api/bold/verify-payment?orderId=${encodeURIComponent(safeOrderId)}`, {
          cache: "no-store",
        });
        const body = (await response.json()) as VerificationResponse;

        if (!response.ok) {
          throw new Error(body.error ?? "No pudimos verificar el pago");
        }

        if (cancelled) return;

        if (body.status === "approved" || body.isPremium) {
          setStatus("approved");
          setExpiresAt(body.premiumExpiresAt ?? null);
          router.refresh();
          return;
        }

        if (body.status === "rejected" || body.status === "failed") {
          setStatus("rejected");
          return;
        }

        setStatus("pending");

        if (attempts < 8) {
          window.setTimeout(verify, 3000);
        }
      } catch (caughtError) {
        if (cancelled) return;
        setStatus("error");
        setError(caughtError instanceof Error ? caughtError.message : "Error verificando el pago");
      }
    }

    void verify();

    return () => {
      cancelled = true;
    };
  }, [orderId, router]);

  const content = getResultContent(status, expiresAt, error);

  return (
    <section className="mx-auto grid max-w-2xl gap-5 rounded-lg border border-border bg-card/82 p-6 text-center shadow-2xl shadow-black/15 backdrop-blur-xl sm:p-8">
      <div className="mx-auto grid h-16 w-16 place-items-center rounded-lg border border-border bg-secondary text-[#27ADF5]">
        <content.icon className={content.animate ? "h-8 w-8 animate-spin" : "h-8 w-8"} />
      </div>
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#27ADF5]/75">Bold Checkout</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-foreground">{content.title}</h1>
        <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-muted-foreground">{content.description}</p>
      </div>
      {orderId ? (
        <div className="rounded-lg border border-border bg-secondary px-4 py-3 font-mono text-xs text-muted-foreground">
          {orderId}
        </div>
      ) : null}
      <div className="flex flex-col justify-center gap-3 sm:flex-row">
        <Link href="/premium">
          <Button type="button" variant="secondary" className="w-full sm:w-auto">
            Volver a Premium
          </Button>
        </Link>
        <Link href="/dashboard">
          <Button type="button" className="w-full sm:w-auto">
            Ir al panel
          </Button>
        </Link>
      </div>
    </section>
  );
}

function getResultContent(status: VerificationState, expiresAt: string | null, error: string | null) {
  if (status === "approved") {
    return {
      icon: CheckCircle2,
      title: "Suscripcion activada",
      description: `Tu clinica ya tiene acceso completo${expiresAt ? ` hasta ${new Intl.DateTimeFormat("es-CO", { dateStyle: "medium" }).format(new Date(expiresAt))}` : ""}. Todas las funciones internas quedan desbloqueadas.`,
      animate: false,
    };
  }

  if (status === "pending") {
    return {
      icon: Clock3,
      title: "Pago en verificacion",
      description:
        "Bold puede tardar unos minutos en confirmar la transaccion. Dejaremos el pago pendiente y el webhook activara Premium apenas llegue la aprobacion.",
      animate: false,
    };
  }

  if (status === "rejected") {
    return {
      icon: XCircle,
      title: "Pago rechazado",
      description: "La transaccion no fue aprobada. Puedes intentar de nuevo con otro metodo de pago.",
      animate: false,
    };
  }

  if (status === "not_found") {
    return {
      icon: XCircle,
      title: "Orden no encontrada",
      description: "No encontramos una orden valida para verificar. Inicia el pago nuevamente desde Premium.",
      animate: false,
    };
  }

  if (status === "error") {
    return {
      icon: XCircle,
      title: "No pudimos verificar",
      description: error ?? "Intenta actualizar esta pagina o revisa el estado desde Premium.",
      animate: false,
    };
  }

  return {
    icon: Loader2,
    title: "Verificando pago",
    description: "Estamos consultando tu orden con validacion de backend antes de activar Premium.",
    animate: true,
  };
}
