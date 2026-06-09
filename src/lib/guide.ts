import { generateObject } from "ai";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { GUIDE_MODEL, currentMonthPt, guideModel } from "@/lib/ai";
import type { ExperienceGuide, Property } from "@/lib/types";

const placeSchema = z.object({
  name: z.string().describe("Nome real do estabelecimento/local"),
  distance: z.string().describe("Distância aproximada, ex: 'Aprox. 1,2 km'"),
  description: z.string().describe("Descrição curta (1 frase) do local"),
});

const essentialSchema = placeSchema.extend({
  type: z.string().describe("Categoria: pharmacy | supermarket | hospital"),
});

const guideSchema = z.object({
  welcomeMessage: z
    .string()
    .describe("Mensagem de boas-vindas calorosa e personalizada para o imóvel e bairro"),
  restaurants: z.array(placeSchema).min(4).max(5),
  attractions: z.array(placeSchema).min(3).max(4),
  essentials: z.array(essentialSchema).min(2).max(4),
  seasonalTip: z
    .string()
    .describe("Dica relevante para a época do ano atual na região"),
});

function buildPrompt(property: Property): string {
  const { address } = property;
  return [
    `Você é um anfitrião local especialista na região. Crie um guia de experiências para um hóspede da Seazone hospedado neste imóvel:`,
    ``,
    `Imóvel: ${property.name} (${property.propertyType})`,
    `Endereço: ${address.street}, ${address.number} — bairro ${address.neighborhood}, ${address.city}/${address.state} (CEP ${address.postalCode})`,
    ``,
    `Gere conteúdo REAL e contextualizado para ESTE endereço específico:`,
    `- restaurantes, atrações e serviços essenciais que de fato existem próximos a este bairro/cidade;`,
    `- distâncias aproximadas coerentes com a localização;`,
    `- a dica sazonal deve considerar que estamos em ${currentMonthPt()} (clima/eventos típicos da região nesta época);`,
    `- escreva tudo em português do Brasil, tom acolhedor e objetivo.`,
  ].join("\n");
}

/**
 * Retorna o guia de experiências do imóvel. Gera via IA na primeira vez e
 * persiste no banco — acessos seguintes leem do banco (não regenera).
 */
export async function getOrCreateGuide(
  property: Property,
): Promise<ExperienceGuide> {
  const existing = await prisma.experienceGuide.findUnique({
    where: { propertyCode: property.code },
  });

  if (existing) {
    return {
      welcomeMessage: existing.welcomeMessage,
      restaurants: existing.restaurants as unknown as ExperienceGuide["restaurants"],
      attractions: existing.attractions as unknown as ExperienceGuide["attractions"],
      essentials: existing.essentials as unknown as ExperienceGuide["essentials"],
      seasonalTip: existing.seasonalTip,
    };
  }

  const { object } = await generateObject({
    model: guideModel,
    schema: guideSchema,
    prompt: buildPrompt(property),
  });

  await prisma.experienceGuide.create({
    data: {
      propertyCode: property.code,
      welcomeMessage: object.welcomeMessage,
      restaurants: object.restaurants,
      attractions: object.attractions,
      essentials: object.essentials,
      seasonalTip: object.seasonalTip,
      model: GUIDE_MODEL,
    },
  });

  return object;
}
