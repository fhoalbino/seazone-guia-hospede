import { convertToModelMessages, streamText, type UIMessage } from "ai";
import { chatModel } from "@/lib/ai";
import { getProperty } from "@/lib/properties";
import { getOrCreateGuide } from "@/lib/guide";
import { buildChatSystemPrompt } from "@/lib/chat-context";

export const maxDuration = 30;

interface ChatRequestBody {
  messages: UIMessage[];
  code: string;
}

export async function POST(req: Request) {
  let body: ChatRequestBody;
  try {
    body = await req.json();
  } catch {
    return new Response("Corpo inválido", { status: 400 });
  }

  const { messages, code } = body;
  if (!code || !Array.isArray(messages)) {
    return new Response("Parâmetros ausentes", { status: 400 });
  }

  const property = await getProperty(code);
  if (!property) {
    return new Response("Imóvel não encontrado", { status: 404 });
  }

  // O guia já está persistido (gerado no carregamento da página); aqui só lê.
  const guide = await getOrCreateGuide(property);
  const system = buildChatSystemPrompt(property, guide);

  const result = streamText({
    model: chatModel,
    system,
    messages: await convertToModelMessages(messages),
  });

  return result.toUIMessageStreamResponse();
}
