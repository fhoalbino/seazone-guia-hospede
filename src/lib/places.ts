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

/** Distância em linha reta entre dois pontos (fórmula de Haversine). */
function haversineKm(a: LatLng, b: LatLng): number {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((a.lat * Math.PI) / 180) *
      Math.cos((b.lat * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.asin(Math.sqrt(h));
}

interface PlacesApiPlace {
  displayName?: { text?: string };
  location?: { latitude?: number; longitude?: number };
}

/** Busca lugares próximos de dados tipos via Places API (New). */
async function searchNearby(
  origin: LatLng,
  includedTypes: string[],
  maxResultCount: number,
  radiusMeters = 3000,
): Promise<{ name: string; distanceMeters: number }[]> {
  const res = await fetch(NEARBY_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Goog-Api-Key": apiKey(),
      "X-Goog-FieldMask": "places.displayName,places.location",
    },
    body: JSON.stringify({
      includedTypes,
      maxResultCount,
      locationRestriction: {
        circle: {
          center: { latitude: origin.lat, longitude: origin.lng },
          radius: radiusMeters,
        },
      },
      languageCode: "pt-BR",
    }),
    next: { revalidate: 86400 },
  });
  if (!res.ok) return [];
  const data = await res.json();
  const places: PlacesApiPlace[] = data.places ?? [];
  return places
    .filter((p) => p.displayName?.text && p.location?.latitude != null)
    .map((p) => {
      const placeLatLng: LatLng = {
        lat: p.location!.latitude!,
        lng: p.location!.longitude!,
      };
      return {
        name: p.displayName!.text!,
        distanceMeters: Math.round(haversineKm(origin, placeLatLng) * 1000),
      };
    });
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
      searchNearby(origin, ["restaurant"], 6, 3000),
      searchNearby(origin, ["tourist_attraction", "beach", "park"], 5, 25000),
      searchNearby(origin, ["pharmacy"], 2, 3000),
      searchNearby(origin, ["supermarket"], 2, 3000),
      searchNearby(origin, ["hospital"], 1, 10000),
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
