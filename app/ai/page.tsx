import Link from "next/link";
import { Bot, LockKeyhole, Sparkles } from "lucide-react";
import { AiChatPanel } from "@/components/ai/ai-chat-panel";
import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { requireWorkspace } from "@/lib/session";

export default async function AiAssistantPage() {
  const workspace = await requireWorkspace();

  if (!workspace.isPremium) {
    return (
      <AppShell>
        <div className="grid min-h-[calc(100dvh-8rem)] place-items-center">
          <Card className="max-w-2xl p-6 text-center shadow-2xl sm:p-8">
            <span className="mx-auto grid h-16 w-16 place-items-center rounded-lg border border-sky-200/25 bg-sky-300/10 text-[#147fba]">
              <LockKeyhole className="h-7 w-7" />
            </span>
            <p className="mt-5 text-sm font-semibold uppercase tracking-[0.18em] text-[#147fba]/70">Premium</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-foreground">
              VettiPets AI esta incluido en Premium
            </h1>
            <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-muted-foreground">
              Activa Premium para usar el asistente con contexto vivo de pacientes, agenda, vacunas, equipo y notas clinicas de {workspace.organizationName}.
            </p>
            <div className="mt-6 flex justify-center">
              <Link href="/premium">
                <Button type="button">
                  <Sparkles className="h-4 w-4" />
                  Activar Premium
                </Button>
              </Link>
            </div>
          </Card>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="grid h-[calc(100dvh-3rem)] grid-rows-[auto_minmax(0,1fr)] gap-3 overflow-hidden">
        <div className="shrink-0 overflow-hidden rounded-lg border border-border bg-white p-3 shadow-2xl shadow-black/10 backdrop-blur-xl sm:p-4">
          <div className="flex flex-col justify-between gap-3 lg:flex-row lg:items-center">
            <div>
              <p className="flex items-center gap-2 text-sm font-semibold text-[#147fba]">
                <Sparkles className="h-4 w-4" />
                VettiPets AI
              </p>
              <h1 className="mt-1 text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
                Asistente inteligente de {workspace.organizationName}
              </h1>
              <p className="mt-1 hidden max-w-2xl text-sm leading-6 text-muted-foreground sm:block">
                Un copiloto clinico y operativo conectado a la informacion viva de tu workspace.
              </p>
            </div>
            <div className="hidden w-fit items-center gap-3 rounded-lg border border-sky-200/20 bg-sky-300/10 px-4 py-3 text-sm font-semibold text-[#147fba] sm:flex">
              <Bot className="h-4 w-4" />
              Gemini conectado
            </div>
          </div>
        </div>
        <div className="min-h-0 flex-1">
          <AiChatPanel />
        </div>
      </div>
    </AppShell>
  );
}
