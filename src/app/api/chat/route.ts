import { convertToModelMessages, streamText, type UIMessage } from "ai";
import { chatModel } from "@/lib/ai";
import { prisma } from "@/lib/db";
import { getProperty } from "@/lib/properties";
import { buildChatSystemPrompt } from "@/lib/chat-context";
import type { ExperienceGuide } from "@/lib/types";

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

  // Só lê o guia do banco — nunca gera aqui para evitar race condition
  // com a geração já em andamento pela página.
  const row = await prisma.experienceGuide.findUnique({
    where: { propertyCode: property.code },
  });
  const guide: ExperienceGuide | null = row
    ? {
        welcomeMessage: row.welcomeMessage,
        restaurants: row.restaurants as unknown as ExperienceGuide["restaurants"],
        attractions: row.attractions as unknown as ExperienceGuide["attractions"],
        essentials: row.essentials as unknown as ExperienceGuide["essentials"],
        seasonalTip: row.seasonalTip,
      }
    : null;
  const system = buildChatSystemPrompt(property, guide);

  const result = streamText({
    model: chatModel,
    system,
    messages: await convertToModelMessages(messages),
  });

  return result.toUIMessageStreamResponse();
}
