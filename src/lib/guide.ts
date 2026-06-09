import { generateObject } from "ai";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { GUIDE_MODEL, currentMonthPt, guideModel } from "@/lib/ai";
import { geocodeAddress, getNearbyForGuide, type NearbyResult } from "@/lib/places";
import { getWeather, type WeatherInfo } from "@/lib/weather";
import type { ExperienceGuide, Property } from "@/lib/types";

const placeSchema = z.object({
  name: z.string().describe("Nome real do estabelecimento/local"),
  distance: z.string().describe("Distância aproximada, ex: 'Aprox. 1,2 km'"),
  description: z.string().describe("Descrição curta (1 frase) do local"),
});

const essentialSchema = placeSchema.extend({
  type: z.string().describe("Categoria: pharmacy | supermarket | hospital"),
});

// Limites tolerantes (o prompt pede 4-5 / 3-4): evita que uma saída válida porém
// ligeiramente fora do alvo estoure a validação do modelo de raciocínio.
const guideSchema = z.object({
  welcomeMessage: z
    .string()
    .describe("Mensagem de boas-vindas calorosa e personalizada para o imóvel e bairro"),
  restaurants: z.array(placeSchema).min(3).max(6),
  attractions: z.array(placeSchema).min(2).max(5),
  essentials: z.array(essentialSchema).min(1).max(6),
  seasonalTip: z
    .string()
    .describe("Dica relevante para a época do ano atual na região"),
});

type GuideObject = z.infer<typeof guideSchema>;

/** Gera o objeto do guia com retry — modelos de raciocínio às vezes falham o structured output. */
async function generateGuideObject(prompt: string): Promise<GuideObject> {
  let lastErr: unknown;
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const { object } = await generateObject({
        model: guideModel,
        schema: guideSchema,
        prompt,
      });
      return object;
    } catch (err) {
      lastErr = err;
    }
  }
  throw lastErr;
}

function propertyHeader(property: Property): string {
  const { address: a } = property;
  return [
    `Imóvel: ${property.name} (${property.propertyType})`,
    `Endereço: ${a.street}, ${a.number} — bairro ${a.neighborhood}, ${a.city}/${a.state} (CEP ${a.postalCode})`,
  ].join("\n");
}

function weatherLine(weather: WeatherInfo | null): string {
  if (!weather) return `Estamos em ${currentMonthPt()}.`;
  return `Estamos em ${currentMonthPt()}; a previsão de hoje na região é de ${weather.tempMin}°C a ${weather.tempMax}°C.`;
}

/** Prompt ancorado em lugares REAIS do Google Places. */
function buildGroundedPrompt(
  property: Property,
  nearby: NearbyResult,
  weather: WeatherInfo | null,
): string {
  const list = (items: { name: string; distance: string; type?: string }[]) =>
    items.map((i) => `- ${i.name} (${i.distance})${i.type ? ` [${i.type}]` : ""}`).join("\n");

  return [
    `Você é um anfitrião local. Monte o guia de experiências do hóspede usando APENAS os lugares reais listados abaixo (não invente outros nem altere os nomes/distâncias).`,
    ``,
    propertyHeader(property),
    ``,
    `RESTAURANTES PRÓXIMOS (reais):\n${list(nearby.restaurants)}`,
    ``,
    `ATRAÇÕES PRÓXIMAS (reais):\n${list(nearby.attractions)}`,
    ``,
    `SERVIÇOS ESSENCIAIS (reais):\n${list(nearby.essentials)}`,
    ``,
    `Tarefa:`,
    `- Selecione os melhores (4-5 restaurantes, 3-4 atrações) e os serviços essenciais relevantes.`,
    `- Para cada um, escreva uma descrição curta (1 frase). Mantenha o nome e a distância exatos da lista.`,
    `- Escreva uma mensagem de boas-vindas calorosa citando o bairro/cidade.`,
    `- ${weatherLine(weather)} Faça a dica sazonal coerente com esse clima e a época.`,
    `- Tudo em português do Brasil, tom acolhedor.`,
  ].join("\n");
}

/** Prompt de fallback (sem ancoragem) — usado se o Google Places falhar. */
function buildFallbackPrompt(property: Property): string {
  return [
    `Você é um anfitrião local especialista na região. Crie um guia de experiências para o hóspede deste imóvel:`,
    ``,
    propertyHeader(property),
    ``,
    `Gere conteúdo REAL e contextualizado para este endereço (restaurantes, atrações e serviços que existem próximos), com distâncias coerentes.`,
    `Dica sazonal: estamos em ${currentMonthPt()}. Tudo em português do Brasil, tom acolhedor.`,
  ].join("\n");
}

/** Tenta montar o prompt ancorado em dados reais; cai no fallback se o Google falhar. */
async function buildPrompt(property: Property): Promise<string> {
  try {
    const { address: a } = property;
    const full = `${a.street}, ${a.number}, ${a.neighborhood}, ${a.city}, ${a.state}, Brasil`;
    const origin = await geocodeAddress(full);
    if (!origin) return buildFallbackPrompt(property);

    const [nearby, weather] = await Promise.all([
      getNearbyForGuide(origin),
      getWeather(origin),
    ]);
    if (nearby.restaurants.length === 0 && nearby.attractions.length === 0) {
      return buildFallbackPrompt(property);
    }
    return buildGroundedPrompt(property, nearby, weather);
  } catch {
    return buildFallbackPrompt(property);
  }
}

/**
 * Retorna o guia de experiências do imóvel. Gera via IA na primeira vez
 * (ancorado em lugares reais do Google Places) e persiste no banco — acessos
 * seguintes leem do banco (não regenera).
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

  const prompt = await buildPrompt(property);
  const object = await generateGuideObject(prompt);

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
