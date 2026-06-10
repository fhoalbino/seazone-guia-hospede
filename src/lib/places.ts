// Integração Google Maps Platform: geocoding + Places (New) Nearby Search.
// Fornece lugares REAIS próximos ao imóvel para ancorar o guia gerado por IA.

const GEOCODE_URL = "https://maps.googleapis.com/maps/api/geocode/json";
const NEARBY_URL = "https://places.googleapis.com/v1/places:searchNearby";

export interface LatLng {
  lat: number;
  lng: number;
}

export interface NearbyPlace {
  name: string;
  distance: string; // ex: "Aprox. 1,2 km"
  type?: string; // pharmacy | supermarket | hospital (para essenciais)
}

export interface NearbyResult {
  restaurants: NearbyPlace[];
  attractions: NearbyPlace[];
  essentials: NearbyPlace[];
}

function apiKey(): string {
  const k = process.env.GOOGLE_API_KEY;
  if (!k) throw new Error("GOOGLE_API_KEY não definida");
  return k;
}

function formatDistance(km: number): string {
  const meters = Math.round(km * 1000);
  if (meters < 60) return "a poucos passos";
  if (km < 1) return `Aprox. ${meters} m`;
  return `Aprox. ${km.toFixed(1).replace(".", ",")} km`;
}

/** Converte um endereço em coordenadas via Geocoding API. */
export async function geocodeAddress(address: string): Promise<LatLng | null> {
  const url = `${GEOCODE_URL}?address=${encodeURIComponent(address)}&key=${apiKey()}`;
  const res = await fetch(url, { next: { revalidate: 86400 } });
  if (!res.ok) return null;
  const data = await res.json();
  const loc = data.results?.[0]?.geometry?.location;
  if (!loc) return null;
  return { lat: loc.lat, lng: loc.lng };
}

interface PlacesApiPlace {
  displayName?: { text?: string };
  distanceMeters?: number;
}

/** Busca lugares próximos de dados tipos via Places API (New). */
async function searchNearby(
  origin: LatLng,
  includedTypes: string[],
  maxResultCount: number,
  radius = 3000,
): Promise<{ name: string; distanceMeters: number }[]> {
  const res = await fetch(NEARBY_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Goog-Api-Key": apiKey(),
      "X-Goog-FieldMask": "places.displayName,places.distanceMeters",
    },
    body: JSON.stringify({
      includedTypes,
      maxResultCount,
      locationRestriction: {
        circle: { center: { latitude: origin.lat, longitude: origin.lng }, radius },
      },
      rankPreference: "DISTANCE",
      languageCode: "pt-BR",
    }),
    next: { revalidate: 86400 },
  });
  if (!res.ok) return [];
  const data = await res.json();
  const places: PlacesApiPlace[] = data.places ?? [];
  return places
    .filter((p) => p.displayName?.text && p.distanceMeters != null)
    .map((p) => ({
      name: p.displayName!.text!,
      distanceMeters: p.distanceMeters!,
    }));
}

function toNearby(
  items: { name: string; distanceMeters: number }[],
  type?: string,
): NearbyPlace[] {
  return items.map((it) => ({
    name: it.name,
    distance: formatDistance(it.distanceMeters / 1000),
    ...(type ? { type } : {}),
  }));
}

/**
 * Reúne lugares reais próximos para alimentar o guia.
 * Lança se a API falhar — o chamador faz fallback para geração sem ancoragem.
 */
export async function getNearbyForGuide(origin: LatLng): Promise<NearbyResult> {
  const [restaurants, attractions, pharmacies, markets, hospitals] =
    await Promise.all([
      searchNearby(origin, ["restaurant"], 6),
      searchNearby(origin, ["tourist_attraction"], 5),
      searchNearby(origin, ["pharmacy"], 2),
      searchNearby(origin, ["supermarket"], 2),
      searchNearby(origin, ["hospital"], 1),
    ]);

  return {
    restaurants: toNearby(restaurants),
    attractions: toNearby(attractions),
    essentials: [
      ...toNearby(pharmacies, "pharmacy"),
      ...toNearby(markets, "supermarket"),
      ...toNearby(hospitals, "hospital"),
    ],
  };
}
