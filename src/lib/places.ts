// Integração Google Maps Platform: geocoding + Places (New) Nearby Search + Distance Matrix.
// Fornece lugares REAIS próximos ao imóvel para ancorar o guia gerado por IA.

const GEOCODE_URL = "https://maps.googleapis.com/maps/api/geocode/json";
const NEARBY_URL = "https://places.googleapis.com/v1/places:searchNearby";
const DISTANCE_MATRIX_URL = "https://maps.googleapis.com/maps/api/distancematrix/json";

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

function formatDistance(meters: number): string {
  if (meters < 60) return "a poucos passos";
  if (meters < 1000) return `Aprox. ${meters} m`;
  const km = meters / 1000;
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
  location?: { latitude?: number; longitude?: number };
}

interface PlaceRaw {
  name: string;
  location: LatLng;
}

/** Busca lugares próximos via Places API (New). Retorna nome + coordenadas do lugar. */
async function searchNearby(
  origin: LatLng,
  includedTypes: string[],
  maxResultCount: number,
  radiusMeters = 3000,
): Promise<PlaceRaw[]> {
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
    .map((p) => ({
      name: p.displayName!.text!,
      location: { lat: p.location!.latitude!, lng: p.location!.longitude! },
    }));
}

/**
 * Busca distâncias de carro (metros) de um ponto de origem para uma lista de
 * destinos via Distance Matrix API. Retorna array na mesma ordem dos destinos.
 * Fallback: 0 se a rota não existir ou a API falhar.
 */
async function getDrivingDistances(
  origin: LatLng,
  destinations: LatLng[],
): Promise<number[]> {
  if (destinations.length === 0) return [];
  const destStr = destinations.map((d) => `${d.lat},${d.lng}`).join("|");
  const url =
    `${DISTANCE_MATRIX_URL}?origins=${origin.lat},${origin.lng}` +
    `&destinations=${encodeURIComponent(destStr)}` +
    `&mode=driving&language=pt-BR&key=${apiKey()}`;
  const res = await fetch(url, { next: { revalidate: 86400 } });
  if (!res.ok) return destinations.map(() => 0);
  const data = await res.json();
  const elements: { status: string; distance?: { value: number } }[] =
    data.rows?.[0]?.elements ?? [];
  return elements.map((el) => (el.status === "OK" ? (el.distance?.value ?? 0) : 0));
}

function toNearby(
  items: { name: string; drivingMeters: number }[],
  type?: string,
): NearbyPlace[] {
  return items.map((it) => ({
    name: it.name,
    distance: formatDistance(it.drivingMeters),
    ...(type ? { type } : {}),
  }));
}

/**
 * Reúne lugares reais próximos para alimentar o guia.
 * Distâncias calculadas via Distance Matrix API (carro).
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

  // Uma chamada em batch para a Distance Matrix com todos os destinos de uma vez.
  const groups = [restaurants, attractions, pharmacies, markets, hospitals];
  const allPlaces = groups.flat();
  const drivingDistances = await getDrivingDistances(
    origin,
    allPlaces.map((p) => p.location),
  );

  // Reanexa distâncias na ordem original dos grupos.
  let idx = 0;
  const [r, a, ph, mk, ho] = groups.map((group) =>
    group.map((place) => ({ name: place.name, drivingMeters: drivingDistances[idx++] ?? 0 })),
  );

  return {
    restaurants: toNearby(r),
    attractions: toNearby(a),
    essentials: [
      ...toNearby(ph, "pharmacy"),
      ...toNearby(mk, "supermarket"),
      ...toNearby(ho, "hospital"),
    ],
  };
}
