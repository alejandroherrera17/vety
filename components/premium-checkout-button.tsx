"use client";

import { CheckCircle2, Loader2, ShieldCheck, Sparkles } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

const BOLD_CHECKOUT_SCRIPT = "https://checkout.bold.co/library/boldPaymentButton.js";

type BoldCheckoutPayload = {
  orderId: string;
  amount: string;
  currency: string;
  apiKey: string;
  integritySignature: string;
  description: string;
  redirectionUrl: string;
  originUrl: string;
  renderMode: "embedded";
  customerData: string;
};

declare global {
  interface Window {
    BoldCheckout?: new (config: BoldCheckoutPayload) => { open: () => void };
  }
}

type CheckoutResponse = {
  checkout?: BoldCheckoutPayload;
  error?: string;
};

export function PremiumCheckoutButton({ disabled }: { disabled?: boolean }) {
  const [isLoading, setIsLoading] = useState(false);

  async function handleCheckout() {
    setIsLoading(true);

    try {
      const response = await fetch("/api/bold/create-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      const body = (await response.json()) as CheckoutResponse;

      if (!response.ok || !body.checkout) {
        throw new Error(body.error ?? "No pudimos preparar el pago");
      }

      await loadBoldScript();

      if (!window.BoldCheckout) {
        throw new Error("Bold Checkout no esta disponible");
      }

      const checkout = new window.BoldCheckout(body.checkout);
      checkout.open();

      toast.success("Checkout seguro abierto", {
        description: `Orden ${body.checkout.orderId}`,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "No pudimos iniciar el pago";
      toast.error("Pago no iniciado", { description: message });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Button
      type="button"
      onClick={handleCheckout}
      disabled={disabled || isLoading}
      className="h-12 w-full bg-[#27ADF5] text-white shadow-lg shadow-sky-950/20 hover:bg-[#149fe8] sm:w-auto"
    >
      {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
      Desbloquear toda la clinica
    </Button>
  );
}

export function PremiumTrustBadges() {
  const items = [
    { icon: ShieldCheck, label: "Pago validado en backend" },
    { icon: CheckCircle2, label: "Activacion automatica" },
    { icon: Sparkles, label: "Toda la clinica desbloqueada" },
  ];

  return (
    <div className="grid gap-2 sm:grid-cols-3">
      {items.map((item) => (
        <div
          key={item.label}
          className="flex items-center gap-2 rounded-lg border border-border bg-secondary px-3 py-2 text-sm font-semibold text-muted-foreground"
        >
          <item.icon className="h-4 w-4 text-[#27ADF5]" />
          {item.label}
        </div>
      ))}
    </div>
  );
}

function loadBoldScript() {
  return new Promise<void>((resolve, reject) => {
    const existingScript = document.querySelector<HTMLScriptElement>(
      `script[src="${BOLD_CHECKOUT_SCRIPT}"]`,
    );

    if (window.BoldCheckout) {
      resolve();
      return;
    }

    if (existingScript) {
      existingScript.addEventListener("load", () => resolve(), { once: true });
      existingScript.addEventListener("error", () => reject(new Error("No se pudo cargar Bold")), { once: true });
      return;
    }

    const script = document.createElement("script");
    script.src = BOLD_CHECKOUT_SCRIPT;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("No se pudo cargar Bold"));
    document.head.appendChild(script);
  });
}
