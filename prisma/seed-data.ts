import type { Property } from "../src/lib/types";
import { mockHost, mockOperational } from "../src/lib/operational-mock";
import realProps from "./real-properties.json";

// Imóveis de referência fornecidos no desafio (PDF do desafio técnico).
const challengeProperties: Property[] = [
  {
    code: "FLN001",
    name: "Apartamento Beira-Mar Florianópolis",
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
      propertyAccessInstructions: "Use o código 4521 na fechadura eletrônica",
      propertyPassword: "4521",
      hasParkingSpot: true,
      parkingSpotIdentifier: "Vaga 12 — subsolo B1",
      parkingSpotInstructions: "Portão lateral, código 7890 no interfone",
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
    amenities: { wifi: true, tv: true, air_conditioning: true, kitchen: true, washing_machine: true, elevator: true, balcony: true },
    images: ["https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800"],
    host: { name: "Ana Paula", phone: "+5548991234567" },
  },
  {
    code: "GRM001",
    name: "Chalé Serra Gramado",
    propertyType: "Casa",
    bedroomQuantity: 3,
    bathroomQuantity: 2,
    guestCapacity: 6,
    address: {
      street: "Rua das Hortênsias",
      number: "220",
      complement: null,
      neighborhood: "Planalto",
      city: "Gramado",
      state: "RS",
      postalCode: "95670-000",
    },
    operational: {
      wifiNetwork: "ChaletSerra_GRM",
      wifiPassword: "gramado@2024",
      isSelfCheckin: false,
      propertyAccessType: "keybox",
      propertyAccessInstructions: "A chave está no cofre na entrada. Código: 1983",
      propertyPassword: "1983",
      hasParkingSpot: true,
      parkingSpotIdentifier: null,
      parkingSpotInstructions: "Garagem própria para 2 carros",
    },
    rules: {
      checkInTime: "14:00",
      checkOutTime: "12:00",
      allowPet: true,
      smokingPermitted: false,
      suitableForChildren: true,
      suitableForBabies: false,
      eventsPermitted: false,
    },
    amenities: { wifi: true, tv: true, kitchen: true, bbq_grill: true, balcony: true, dishwasher: true },
    images: ["https://images.unsplash.com/photo-1449158743715-0a90ebb6d2d8?w=800"],
    host: { name: "Carlos Eduardo", phone: "+5554998765432" },
  },
];

// --- Imóveis reais da Seazone ---
// Snapshot da API pública de busca do site (prisma/real-properties.json), salvo
// no banco para a aplicação não depender de chamada externa em runtime. A API
// expõe endereço, coordenadas, capacidade e fotos REAIS; os dados sensíveis da
// estadia (WiFi, fechadura, regras, anfitrião) não são públicos e aqui são
// preenchidos de forma determinística (em produção viriam do endpoint de reserva).

interface RealProp {
  code: string;
  title: string;
  street: string;
  number: string;
  neighborhood: string;
  city: string;
  state: string;
  postalCode: string;
  guests: number;
  bedrooms: number;
  bathrooms: number;
  images: string[];
}

/** Hash estável por código — varia regras/amenidades sem aleatoriedade. */
function hash(code: string): number {
  let h = 0;
  for (let i = 0; i < code.length; i++) h = (h * 31 + code.charCodeAt(i)) % 100000;
  return h;
}

function inferType(title: string): string {
  const t = title.toLowerCase();
  if (/studio|estúdio|estudio/.test(t)) return "Studio";
  if (/casa|chalé|chale/.test(t)) return "Casa";
  return "Apartamento";
}

/** Remove o código do imóvel quando vem no fim do título. */
function cleanName(title: string, code: string): string {
  return title.replace(new RegExp(`\\s*${code}\\s*$`, "i"), "").trim();
}

function realToProperty(p: RealProp): Property {
  const h = hash(p.code);
  const base = { wifi: true, tv: true, air_conditioning: true, kitchen: true };
  const extras: Record<string, boolean> = {};
  if (h % 2 === 0) extras.washing_machine = true;
  if (h % 3 === 0) extras.elevator = true;
  if (h % 5 === 0) extras.pool = true;
  if (h % 7 === 0) extras.bbq_grill = true;
  extras.balcony = h % 4 !== 0;

  return {
    code: p.code,
    name: cleanName(p.title, p.code),
    propertyType: inferType(p.title),
    bedroomQuantity: Math.max(1, p.bedrooms),
    bathroomQuantity: Math.max(1, p.bathrooms),
    guestCapacity: p.guests,
    address: {
      street: p.street,
      number: p.number,
      complement: null,
      neighborhood: p.neighborhood,
      city: p.city,
      state: p.state,
      postalCode: p.postalCode,
    },
    operational: mockOperational(p.code),
    rules: {
      checkInTime: h % 2 === 0 ? "15:00" : "14:00",
      checkOutTime: h % 2 === 0 ? "11:00" : "12:00",
      allowPet: h % 3 === 0,
      smokingPermitted: false,
      suitableForChildren: h % 5 !== 0,
      suitableForBabies: h % 4 === 0,
      eventsPermitted: false,
    },
    amenities: { ...base, ...extras },
    images: p.images,
    host: mockHost(p.code),
  };
}

const realProperties: Property[] = (realProps as RealProp[]).map(realToProperty);

export const properties: Property[] = [...challengeProperties, ...realProperties];
