import { mockHost, mockOperational } from "@/lib/operational-mock";
import type { Amenities, Property } from "@/lib/types";

const BASE_URL = "https://api.seazone.com.br";

// Tradução dos tipos retornados pela API (inglês) para exibição.
const PROPERTY_TYPE_PT: Record<string, string> = {
  Apartment: "Apartamento",
  House: "Casa",
  Studio: "Estúdio",
  Condo: "Condomínio",
  Cabin: "Chalé",
  Loft: "Loft",
};

interface SeazoneDetails {
  id: number;
  code: string;
  type: string;
  listing_title: string;
  room_quantity: number;
  bed_quantity: number;
  bathroom_quantity: number;
  guest_capacity: number;
  address: {
    state_code: string;
    city: string;
    neighborhood: string;
    street: string;
    number: string;
    complement: string | null;
    postal_code: string;
  };
  rules: {
    baby_allowed: boolean;
    pet_allowed: boolean;
    check_in_time: string;
    check_out_time: string;
  };
  location_info?: { latitude: string | number; longitude: string | number };
  images?: { images?: { url: string }[] };
}

interface SeazoneAmenities {
  main_amenities?: { name: string }[];
}

async function fetchAmenities(id: number): Promise<Amenities> {
  try {
    const res = await fetch(`${BASE_URL}/properties/${id}/amenities`, {
      next: { revalidate: 3600 },
    });
    if (!res.ok) return { "Wi-Fi": true };
    const data: SeazoneAmenities = await res.json();
    const list = data.main_amenities ?? [];
    if (list.length === 0) return { "Wi-Fi": true };
    return Object.fromEntries(list.map((a) => [a.name, true]));
  } catch {
    return { "Wi-Fi": true };
  }
}

/**
 * Busca um imóvel REAL na API pública da Seazone e o adapta ao domínio.
 * Os campos sensíveis (WiFi, fechadura, anfitrião) são preenchidos com dados
 * de demonstração (ver operational-mock). Retorna null se o código não existir.
 */
export async function fetchSeazoneProperty(
  code: string,
): Promise<Property | null> {
  let details: SeazoneDetails;
  try {
    const res = await fetch(`${BASE_URL}/properties/${code}/details`, {
      next: { revalidate: 3600 },
    });
    if (!res.ok) return null; // 404 = código inexistente
    details = await res.json();
  } catch {
    return null;
  }

  const a = details.address;
  const amenities = await fetchAmenities(details.id);

  const loc = details.location_info;
  const coords = loc
    ? { lat: Number(loc.latitude), lng: Number(loc.longitude) }
    : null;

  return {
    code: details.code,
    name: details.listing_title,
    propertyType: PROPERTY_TYPE_PT[details.type] ?? details.type,
    bedroomQuantity: details.room_quantity,
    bathroomQuantity: Math.round(details.bathroom_quantity),
    guestCapacity: details.guest_capacity,
    address: {
      street: a.street,
      number: a.number,
      complement: a.complement,
      neighborhood: a.neighborhood,
      city: a.city,
      state: a.state_code,
      postalCode: a.postal_code,
    },
    rules: {
      checkInTime: details.rules.check_in_time,
      checkOutTime: details.rules.check_out_time,
      allowPet: details.rules.pet_allowed,
      smokingPermitted: false,
      suitableForChildren: true,
      suitableForBabies: details.rules.baby_allowed,
      eventsPermitted: false,
    },
    amenities,
    images: (details.images?.images ?? []).map((img) => img.url).slice(0, 1),
    coords,
    operational: mockOperational(details.code),
    host: mockHost(details.code),
  };
}
