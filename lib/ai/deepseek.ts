import "server-only";

import { VETTI_SYSTEM_PROMPT } from "@/lib/ai/prompts";

type DeepSeekMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

type StreamDeepSeekOptions = {
  prompt: string;
};

export class DeepSeekApiError extends Error {
  status: number;
  providerMessage: string;

  constructor(status: number, providerMessage: string) {
    super(providerMessage);
    this.name = "DeepSeekApiError";
    this.status = status;
    this.providerMessage = providerMessage;
  }
}

function getDeepSeekApiKey() {
  const apiKey = process.env.DEEPSEEK_API_KEY;

  if (!apiKey) {
    throw new Error("DEEPSEEK_API_KEY is not configured");
  }

  return apiKey;
}

export async function streamDeepSeekChat({ prompt }: StreamDeepSeekOptions) {
  const messages: DeepSeekMessage[] = [
    { role: "system", content: VETTI_SYSTEM_PROMPT },
    { role: "user", content: prompt },
  ];

  const response = await fetch("https://api.deepseek.com/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getDeepSeekApiKey()}`,
    },
    body: JSON.stringify({
      model: "deepseek-chat",
      messages,
      stream: true,
      temperature: 0.2,
      max_tokens: 1200,
    }),
  });

  if (!response.ok || !response.body) {
    const errorText = await response.text().catch(() => "");
    let providerMessage = errorText || "DeepSeek request failed";

    try {
      const parsed = JSON.parse(errorText) as { error?: { message?: string } };
      providerMessage = parsed.error?.message ?? providerMessage;
    } catch {
      // Keep the raw provider text when it is not JSON.
    }

    throw new DeepSeekApiError(response.status, providerMessage);
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
            if (data === "[DONE]") {
              controller.close();
              return;
            }

            try {
              const parsed = JSON.parse(data) as {
                choices?: { delta?: { content?: string } }[];
              };
              const content = parsed.choices?.[0]?.delta?.content;

              if (content) {
                controller.enqueue(encoder.encode(content));
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
