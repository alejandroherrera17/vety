import { Bot, Sparkles } from "lucide-react";
import { AiChatPanel } from "@/components/ai/ai-chat-panel";
import { AppShell } from "@/components/app-shell";
import { requirePremiumWorkspace } from "@/lib/session";

export default async function AiAssistantPage() {
  const workspace = await requirePremiumWorkspace();

  return (
    <AppShell>
      <div className="grid h-[calc(100dvh-3rem)] grid-rows-[auto_minmax(0,1fr)] gap-3 overflow-hidden">
        <div className="shrink-0 overflow-hidden rounded-lg border border-border bg-white p-3 shadow-2xl shadow-black/10 backdrop-blur-xl sm:p-4">
          <div className="flex flex-col justify-between gap-3 lg:flex-row lg:items-center">
            <div>
              <p className="flex items-center gap-2 text-sm font-semibold text-[#27ADF5]">
                <Sparkles className="h-4 w-4" />
                VettiPets AI
              </p>
              <h1 className="mt-1 text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
                Asistente inteligente de {workspace.organizationName}
              </h1>
              <p className="mt-1 hidden max-w-2xl text-sm leading-6 text-muted-foreground sm:block">
                El plan de la clinica desbloquea este asistente junto con el resto de funciones operativas.
              </p>
            </div>
            <div className="hidden w-fit items-center gap-3 rounded-lg border border-sky-200/20 bg-sky-300/10 px-4 py-3 text-sm font-semibold text-[#27ADF5] sm:flex">
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
