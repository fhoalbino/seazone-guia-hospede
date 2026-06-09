import { describe, expect, it } from "vitest";
import { buildChatSystemPrompt } from "@/lib/chat-context";
import type { ExperienceGuide, Property } from "@/lib/types";

const property: Property = {
  code: "FLN001",
  name: "Apartamento Beira-Mar",
  propertyType: "Apartamento",
  bedroomQuantity: 2,
  bathroomQuantity: 1,
  guestCapacity: 4,
  address: {
    street: "Rua Lauro Linhares",
    number: "589",
    complement: "Apto 301",
    neighborhood: "Trindade",
    city: "Florianópolis",
    state: "SC",
    postalCode: "88036-001",
  },
  operational: {
    wifiNetwork: "SeaHome_FLN001",
    wifiPassword: "floripa2024",
    isSelfCheckin: true,
    propertyAccessType: "smart_lock",
    propertyAccessInstructions: "Use o código 4521",
    propertyPassword: "4521",
    hasParkingSpot: true,
    parkingSpotIdentifier: "Vaga 12",
    parkingSpotInstructions: "Portão lateral",
  },
  rules: {
    checkInTime: "15:00",
    checkOutTime: "11:00",
    allowPet: false,
    smokingPermitted: false,
    suitableForChildren: true,
    suitableForBabies: true,
    eventsPermitted: false,
  },
  amenities: { wifi: true, elevator: true },
  images: [],
  host: { name: "Ana Paula", phone: "+5548991234567" },
};

const guide: ExperienceGuide = {
  welcomeMessage: "Bem-vindo à Trindade!",
  restaurants: [
    { name: "Box 32", distance: "1,2 km", description: "Petiscos" },
  ],
  attractions: [
    { name: "Lagoa da Conceição", distance: "8 km", description: "Surf" },
  ],
  essentials: [
    {
      name: "Farmácia Catarinense",
      type: "pharmacy",
      distance: "300 m",
      description: "24h",
    },
  ],
  seasonalTip: "Junho é frio, leve casaco.",
};

describe("buildChatSystemPrompt", () => {
  const prompt = buildChatSystemPrompt(property, guide);

  it("inclui as credenciais de acesso reais", () => {
    expect(prompt).toContain("floripa2024");
    expect(prompt).toContain("SeaHome_FLN001");
    expect(prompt).toContain("Use o código 4521");
  });

  it("inclui horários e políticas", () => {
    expect(prompt).toContain("15:00");
    expect(prompt).toContain("Animais permitidos: Não");
  });

  it("inclui o anfitrião com telefone formatado", () => {
    expect(prompt).toContain("Ana Paula");
    expect(prompt).toContain("+55 (48) 99123-4567");
  });

  it("inclui o guia da região gerado", () => {
    expect(prompt).toContain("Box 32");
    expect(prompt).toContain("Lagoa da Conceição");
    expect(prompt).toContain("Junho é frio");
  });

  it("contém a regra de grounding anti-alucinação", () => {
    expect(prompt).toContain("NUNCA invente");
    expect(prompt).toMatch(/Responda SOMENTE com base nos dados/i);
  });
});
