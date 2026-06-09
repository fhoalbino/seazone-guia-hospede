import type { LatLng } from "@/lib/places";

// Clima atual via Open-Meteo (grátis, sem API key) para tornar a dica sazonal real.

export interface WeatherInfo {
  tempMin: number;
  tempMax: number;
  current: number;
}

/** Faixa de temperatura prevista para hoje na localização. Null se falhar. */
export async function getWeather(origin: LatLng): Promise<WeatherInfo | null> {
  const url =
    `https://api.open-meteo.com/v1/forecast?latitude=${origin.lat}&longitude=${origin.lng}` +
    `&current=temperature_2m&daily=temperature_2m_min,temperature_2m_max&timezone=auto&forecast_days=1`;
  try {
    const res = await fetch(url, { next: { revalidate: 21600 } });
    if (!res.ok) return null;
    const data = await res.json();
    const min = data.daily?.temperature_2m_min?.[0];
    const max = data.daily?.temperature_2m_max?.[0];
    const current = data.current?.temperature_2m;
    if (min == null || max == null) return null;
    return { tempMin: Math.round(min), tempMax: Math.round(max), current: Math.round(current ?? max) };
  } catch {
    return null;
  }
}
