import { NextResponse } from "next/server";
import { buildClinicContext } from "@/lib/ai/context";
import { GeminiApiError, streamGeminiChat } from "@/lib/ai/gemini";
import { buildUserPrompt, type ChatMessage } from "@/lib/ai/prompts";
import { getCurrentWorkspace } from "@/lib/session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type AiChatRequest = {
  messages?: ChatMessage[];
};

function isValidMessage(value: unknown): value is ChatMessage {
  if (!value || typeof value !== "object") return false;
  const message = value as Record<string, unknown>;
  return (
    (message.role === "user" || message.role === "assistant") &&
    typeof message.content === "string" &&
    message.content.trim().length > 0
  );
}

export async function POST(request: Request) {
  try {
    const workspace = await getCurrentWorkspace();

    if (!workspace) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!workspace.isPremium) {
      return NextResponse.json(
        { error: "VettiPets AI requiere Premium activo" },
        { status: 402 },
      );
    }

    const body = (await request.json()) as AiChatRequest;
    const messages = Array.isArray(body.messages) ? body.messages.filter(isValidMessage) : [];
    const latestUserMessage = [...messages].reverse().find((message) => message.role === "user");

    if (!latestUserMessage) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    const clinicContext = await buildClinicContext({
      question: latestUserMessage.content,
      workspace,
    });
    const prompt = buildUserPrompt({ clinicContext, messages });
    const stream = await streamGeminiChat({ prompt });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache, no-transform",
      },
    });
  } catch (error) {
    if (error instanceof GeminiApiError) {
      const message = `Gemini rechazo la solicitud: ${error.providerMessage}`;

      return NextResponse.json({ error: message }, { status: error.status });
    }

    const message = error instanceof Error ? error.message : "AI assistant failed";
    const status = message.includes("GEMINI_API_KEY") ? 500 : 400;

    return NextResponse.json({ error: message }, { status });
  }
}
