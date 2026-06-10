import { prisma } from "@/lib/db";
import type { Amenities, Property } from "@/lib/types";
import type { PropertyModel as PropertyRow } from "@/generated/prisma/models";

/** Mapeia a linha plana do banco para o tipo de domínio aninhado. */
function toProperty(row: PropertyRow): Property {
  return {
    code: row.code,
    name: row.name,
    propertyType: row.propertyType,
    bedroomQuantity: row.bedroomQuantity,
    bathroomQuantity: row.bathroomQuantity,
    guestCapacity: row.guestCapacity,
    address: {
      street: row.street,
      number: row.number,
      complement: row.complement,
      neighborhood: row.neighborhood,
      city: row.city,
      state: row.state,
      postalCode: row.postalCode,
    },
    operational: {
      wifiNetwork: row.wifiNetwork,
      wifiPassword: row.wifiPassword,
      isSelfCheckin: row.isSelfCheckin,
      propertyAccessType: row.propertyAccessType,
      propertyAccessInstructions: row.propertyAccessInstructions,
      propertyPassword: row.propertyPassword,
      hasParkingSpot: row.hasParkingSpot,
      parkingSpotIdentifier: row.parkingSpotIdentifier,
      parkingSpotInstructions: row.parkingSpotInstructions,
    },
    rules: {
      checkInTime: row.checkInTime,
      checkOutTime: row.checkOutTime,
      allowPet: row.allowPet,
      smokingPermitted: row.smokingPermitted,
      suitableForChildren: row.suitableForChildren,
      suitableForBabies: row.suitableForBabies,
      eventsPermitted: row.eventsPermitted,
    },
    amenities: (row.amenities ?? {}) as Amenities,
    images: row.images,
    host: {
      name: row.hostName,
      phone: row.hostPhone,
    },
  };
}

/**
 * Busca um imóvel pelo código (ex: FLN001). Normaliza para maiúsculas.
 * Os dados ficam todos no banco (imóveis-exemplo do desafio + um snapshot de
 * imóveis reais da Seazone, populados pelo seed). Retorna null se não existir.
 */
export async function getProperty(code: string): Promise<Property | null> {
  const row = await prisma.property.findUnique({
    where: { code: code.toUpperCase() },
  });
  return row ? toProperty(row) : null;
}

/** Lista todos os códigos de imóvel — usado para gerar páginas estáticas. */
export async function getAllPropertyCodes(): Promise<string[]> {
  const rows = await prisma.property.findMany({ select: { code: true } });
  return rows.map((r) => r.code);
}

/** Dados resumidos de todos os imóveis para os cards da landing. */
export async function getAllPropertyCards(): Promise<
  { code: string; name: string; city: string; state: string; image?: string }[]
> {
  const rows = await prisma.property.findMany({
    select: { code: true, name: true, city: true, state: true, images: true },
    orderBy: { code: "asc" },
  });
  return rows.map((r) => ({
    code: r.code,
    name: r.name,
    city: r.city,
    state: r.state,
    image: r.images[0],
  }));
}
