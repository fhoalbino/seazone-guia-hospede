// Tipos de domínio do Guia Digital do Hóspede.
// Espelham a estrutura de dados de referência fornecida no desafio.

export interface PropertyAddress {
  street: string;
  number: string;
  complement: string | null;
  neighborhood: string;
  city: string;
  state: string;
  postalCode: string;
}

/** Amenidades variam por imóvel — chave booleana. */
export type Amenities = Record<string, boolean>;

export interface PropertyOperational {
  wifiNetwork: string;
  wifiPassword: string;
  isSelfCheckin: boolean;
  propertyAccessType: string; // smart_lock | keybox | ...
  propertyAccessInstructions: string;
  propertyPassword: string | null;
  hasParkingSpot: boolean;
  parkingSpotIdentifier: string | null;
  parkingSpotInstructions: string | null;
}

export interface PropertyRules {
  checkInTime: string;
  checkOutTime: string;
  allowPet: boolean;
  smokingPermitted: boolean;
  suitableForChildren: boolean;
  suitableForBabies: boolean;
  eventsPermitted: boolean;
}

export interface PropertyHost {
  name: string;
  phone: string;
}

/** Imóvel completo (camada de dados de referência). */
export interface Property {
  code: string;
  name: string;
  propertyType: string;
  bedroomQuantity: number;
  bathroomQuantity: number;
  guestCapacity: number;
  address: PropertyAddress;
  operational: PropertyOperational;
  rules: PropertyRules;
  amenities: Amenities;
  images: string[];
  host: PropertyHost;
  /** Coordenadas exatas do imóvel (quando a fonte fornece). Usadas para ancorar o guia. */
  coords?: { lat: number; lng: number } | null;
}

// --- Guia de experiências gerado por IA ---

export interface GuidePlace {
  name: string;
  distance: string;
  description: string;
}

export interface GuideEssential extends GuidePlace {
  type: string; // pharmacy | supermarket | hospital | ...
}

export interface ExperienceGuide {
  welcomeMessage: string;
  restaurants: GuidePlace[];
  attractions: GuidePlace[];
  essentials: GuideEssential[];
  seasonalTip: string;
}
