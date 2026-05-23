"use client";

import { useEffect, useMemo, useRef, useState } from "react";

export type AiChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt: string;
};

const STORAGE_KEY = "vetypets-ai-chat";

const starterMessages: AiChatMessage[] = [
  {
    id: "welcome",
    role: "assistant",
    content:
      "Hola, soy VettiPets AI. Puedo ayudarte con agenda, pacientes, vacunas, solicitudes y resumenes clinicos usando el contexto de esta clinica.",
    createdAt: new Date().toISOString(),
  },
];

function createMessage(role: AiChatMessage["role"], content: string): AiChatMessage {
  return {
    id: typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`,
    role,
    content,
    createdAt: new Date().toISOString(),
  };
}

export function useAiChat() {
  const [messages, setMessages] = useState<AiChatMessage[]>(() => {
    if (typeof window === "undefined") return starterMessages;

    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (!saved) return starterMessages;

    try {
      const parsed = JSON.parse(saved) as AiChatMessage[];
      return Array.isArray(parsed) && parsed.length ? parsed : starterMessages;
    } catch {
      window.localStorage.removeItem(STORAGE_KEY);
      return starterMessages;
    }
  });
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortController = useRef<AbortController | null>(null);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(messages.slice(-24)));
  }, [messages]);

  const apiMessages = useMemo(
    () =>
      messages
        .filter((message) => message.id !== "welcome")
        .map((message) => ({ role: message.role, content: message.content })),
    [messages],
  );

  async function sendMessage(content = input) {
    const trimmed = content.trim();
    if (!trimmed || isLoading) return;

    const userMessage = createMessage("user", trimmed);
    const assistantMessage = createMessage("assistant", "");
    const nextMessages = [...apiMessages, { role: "user" as const, content: trimmed }];

    setMessages((current) => [...current, userMessage, assistantMessage]);
    setInput("");
    setIsLoading(true);
    setError(null);

    const controller = new AbortController();
    abortController.current = controller;

    try {
      const response = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: nextMessages }),
        signal: controller.signal,
      });

      if (!response.ok || !response.body) {
        const body = await response.json().catch(() => null);
        throw new Error(body?.error ?? "No pude conectar con VettiPets AI.");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        setMessages((current) =>
          current.map((message) =>
            message.id === assistantMessage.id
              ? { ...message, content: `${message.content}${chunk}` }
              : message,
          ),
        );
      }
    } catch (sendError) {
      if (sendError instanceof DOMException && sendError.name === "AbortError") {
        return;
      }

      const message = sendError instanceof Error ? sendError.message : "Ocurrio un error con el asistente.";
      setError(message);
      setMessages((current) =>
        current.map((item) =>
          item.id === assistantMessage.id
            ? { ...item, content: message }
            : item,
        ),
      );
    } finally {
      setIsLoading(false);
      abortController.current = null;
    }
  }

  function stop() {
    abortController.current?.abort();
    setIsLoading(false);
  }

  function clear() {
    setMessages(starterMessages);
    setError(null);
    window.localStorage.removeItem(STORAGE_KEY);
  }

  return {
    messages,
    input,
    setInput,
    sendMessage,
    isLoading,
    error,
    stop,
    clear,
  };
}
