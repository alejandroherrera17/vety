import "server-only";

import { VETTI_SYSTEM_PROMPT } from "@/lib/ai/prompts";

type StreamGeminiOptions = {
  prompt: string;
};

type GeminiStreamChunk = {
  candidates?: {
    content?: {
      parts?: { text?: string }[];
    };
  }[];
};

export class GeminiApiError extends Error {
  status: number;
  providerMessage: string;

  constructor(status: number, providerMessage: string) {
    super(providerMessage);
    this.name = "GeminiApiError";
    this.status = status;
    this.providerMessage = providerMessage;
  }
}

function getGeminiApiKey() {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not configured");
  }

  return apiKey;
}

export async function streamGeminiChat({ prompt }: StreamGeminiOptions) {
  const model = process.env.GEMINI_MODEL || "gemini-2.5-flash";
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:streamGenerateContent?alt=sse`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": getGeminiApiKey(),
      },
      body: JSON.stringify({
        systemInstruction: {
          parts: [{ text: VETTI_SYSTEM_PROMPT }],
        },
        contents: [
          {
            role: "user",
            parts: [{ text: prompt }],
          },
        ],
        generationConfig: {
          temperature: 0.2,
          maxOutputTokens: 1200,
        },
      }),
    },
  );

  if (!response.ok || !response.body) {
    const errorText = await response.text().catch(() => "");
    let providerMessage = errorText || "Gemini request failed";

    try {
      const parsed = JSON.parse(errorText) as { error?: { message?: string } };
      providerMessage = parsed.error?.message ?? providerMessage;
    } catch {
      // Keep the raw provider text when it is not JSON.
    }

    throw new GeminiApiError(response.status, providerMessage);
  }

  const encoder = new TextEncoder();
  const decoder = new TextDecoder();

  return new ReadableStream<Uint8Array>({
    async start(controller) {
      const reader = response.body!.getReader();
      let buffer = "";

      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() ?? "";

          for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed.startsWith("data:")) continue;

            const data = trimmed.slice(5).trim();
            if (!data || data === "[DONE]") continue;

            try {
              const parsed = JSON.parse(data) as GeminiStreamChunk;
              const text = parsed.candidates?.[0]?.content?.parts
                ?.map((part) => part.text)
                .filter(Boolean)
                .join("");

              if (text) {
                controller.enqueue(encoder.encode(text));
              }
            } catch {
              // Ignore malformed provider chunks and continue streaming.
            }
          }
        }

        controller.close();
      } catch (error) {
        controller.error(error);
      } finally {
        reader.releaseLock();
      }
    },
  });
}
