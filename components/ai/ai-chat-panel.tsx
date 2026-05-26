"use client";

import { Bot, CalendarDays, Loader2, PawPrint, RotateCcw, Send, ShieldCheck, Square, Syringe } from "lucide-react";
import { FormEvent, useEffect, useRef } from "react";
import { useAiChat, type AiChatMessage } from "@/hooks/use-ai-chat";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const suggestions = [
  { icon: CalendarDays, label: "Muestrame las citas de hoy" },
  { icon: Syringe, label: "Que vacunas proximas debo revisar?" },
  { icon: PawPrint, label: "Resume los pacientes con alertas clinicas" },
  { icon: ShieldCheck, label: "Que solicitudes estan pendientes?" },
];

export function AiChatPanel() {
  const { messages, input, setInput, sendMessage, isLoading, error, stop, clear } = useAiChat();
  const scrollRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ block: "end", behavior: "auto" });
  }, [messages]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void sendMessage();
  }

  return (
    <section className="grid h-full min-h-0 overflow-hidden rounded-lg border border-border bg-card/82 shadow-2xl shadow-black/15 backdrop-blur-xl ring-1 ring-white/[0.035] lg:grid-cols-[280px_minmax(0,1fr)]">
      <aside className="hidden min-h-0 overflow-y-auto border-r border-border bg-white p-4 lg:block">
        <div className="flex items-center gap-3">
          <span className="grid h-12 w-12 place-items-center rounded-lg border border-sky-200/25 bg-sky-300/10 text-[#147fba] shadow-[0_0_38px_rgba(39,173,245,0.14)]">
            <Bot className="h-5 w-5" />
          </span>
          <div>
            <p className="text-lg font-bold tracking-tight text-foreground">VettiPets AI</p>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#147fba]/70">Clinic copilot</p>
          </div>
        </div>

        <div className="mt-5 rounded-lg border border-border bg-background/35 p-4">
          <p className="text-sm font-semibold text-foreground">Contexto activo</p>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Responde con datos de mascotas, propietarios, citas, vacunas, equipo y notas clinicas del workspace actual.
          </p>
        </div>

        <div className="mt-5 grid gap-2">
          {suggestions.map((suggestion) => (
            <button
              key={suggestion.label}
              type="button"
              onClick={() => void sendMessage(suggestion.label)}
              disabled={isLoading}
              className="group flex items-center gap-3 rounded-lg border border-border bg-white px-3 py-3 text-left text-sm font-semibold text-muted-foreground transition hover:-translate-y-0.5 hover:border-sky-200/30 hover:bg-[#edf8ff] hover:text-foreground disabled:pointer-events-none disabled:opacity-50"
            >
              <suggestion.icon className="h-4 w-4 text-[#147fba]/75 transition group-hover:text-[#147fba]" />
              <span>{suggestion.label}</span>
            </button>
          ))}
        </div>

        <Button type="button" variant="ghost" className="mt-5 w-full justify-start" onClick={clear}>
          <RotateCcw className="h-4 w-4" />
          Nueva conversacion
        </Button>
      </aside>

      <div className="grid min-h-0 grid-rows-[auto_minmax(0,1fr)_auto]">
        <div className="flex min-h-0 items-center justify-between border-b border-border px-4 py-3 sm:px-5">
          <div>
            <h2 className="text-base font-bold text-foreground">Asistente clinico</h2>
            <p className="hidden text-sm text-muted-foreground sm:block">Consultas operativas y resumenes con contexto de base de datos.</p>
          </div>
          {isLoading ? (
            <Button type="button" variant="secondary" size="sm" onClick={stop}>
              <Square className="h-3.5 w-3.5" />
              Detener
            </Button>
          ) : null}
        </div>

        <div ref={scrollRef} className="min-h-0 overflow-y-auto px-4 py-4 scroll-smooth sm:px-6">
          <div className="mx-auto grid max-w-3xl gap-4">
            {messages.map((message) => (
              <MessageBubble key={message.id} message={message} isLoading={isLoading && message.role === "assistant" && !message.content} />
            ))}
            <div ref={bottomRef} aria-hidden="true" />
          </div>
        </div>

        <form onSubmit={handleSubmit} className="z-10 border-t border-border bg-background/95 p-3 backdrop-blur-xl sm:p-4">
          {error ? (
            <div className="mb-3 rounded-lg border border-red-300/20 bg-red-400/10 px-3 py-2 text-sm text-red-100">
              {error}
            </div>
          ) : null}
          <div className="mx-auto flex max-w-3xl items-end gap-3 rounded-lg border border-border bg-secondary p-2 shadow-inner">
            <textarea
              value={input}
              onChange={(event) => setInput(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter" && !event.shiftKey) {
                  event.preventDefault();
                  void sendMessage();
                }
              }}
              placeholder="Pregunta por pacientes, agenda, vacunas o historial clinico..."
              rows={1}
              className="max-h-36 min-h-11 flex-1 resize-none bg-transparent px-3 py-3 text-sm leading-5 text-foreground outline-none placeholder:text-muted-foreground"
            />
            <Button type="submit" size="icon" disabled={isLoading || !input.trim()} aria-label="Enviar">
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </Button>
          </div>
        </form>
      </div>
    </section>
  );
}

function MessageBubble({ message, isLoading }: { message: AiChatMessage; isLoading?: boolean }) {
  const isUser = message.role === "user";

  return (
    <article className={cn("flex gap-3", isUser && "justify-end")}>
      {!isUser ? (
        <span className="mt-1 grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-sky-200/25 bg-sky-300/10 text-[#147fba]">
          <Bot className="h-4 w-4" />
        </span>
      ) : null}
      <div
        className={cn(
          "max-w-[86%] rounded-lg border px-4 py-3 text-sm leading-6 shadow-lg",
          isUser
            ? "border-sky-200/25 bg-primary text-primary-foreground shadow-sky-950/10"
            : "border-border bg-secondary text-foreground shadow-black/10",
        )}
      >
        {isLoading ? (
          <div className="flex items-center gap-2 text-muted-foreground">
            <span className="h-2 w-2 animate-pulse rounded-full bg-[#27ADF5]" />
            <span className="h-2 w-2 animate-pulse rounded-full bg-[#27ADF5] [animation-delay:120ms]" />
            <span className="h-2 w-2 animate-pulse rounded-full bg-[#27ADF5] [animation-delay:240ms]" />
          </div>
        ) : (
          <MarkdownText content={message.content} />
        )}
      </div>
    </article>
  );
}

function MarkdownText({ content }: { content: string }) {
  const blocks = content.split(/\n{2,}/).filter(Boolean);

  return (
    <div className="grid gap-3">
      {blocks.map((block, index) => {
        const lines = block.split("\n");
        const isList = lines.every((line) => /^[-*]\s+/.test(line.trim()));

        if (isList) {
          return (
            <ul key={`${block}-${index}`} className="list-disc space-y-1 pl-5">
              {lines.map((line) => (
                <li key={line}>{renderInline(line.replace(/^[-*]\s+/, ""))}</li>
              ))}
            </ul>
          );
        }

        return (
          <p key={`${block}-${index}`} className="whitespace-pre-wrap">
            {renderInline(block)}
          </p>
        );
      })}
    </div>
  );
}

function renderInline(text: string) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);

  return parts.map((part, index) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={`${part}-${index}`}>{part.slice(2, -2)}</strong>;
    }

    return <span key={`${part}-${index}`}>{part}</span>;
  });
}
