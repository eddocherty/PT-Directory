import { CITIES } from "./taxonomy";

export type GeoPoint = { lat: number; lng: number; label: string };

/** Turn a UK postcode, postcode district or town name into coordinates using postcodes.io (free, OGL data). */
export async function geocodeUk(input: string): Promise<GeoPoint | null> {
  const q = input.trim();
  if (!q) return null;

  const city = CITIES.find((c) => c.name.toLowerCase() === q.toLowerCase() || c.slug === q.toLowerCase());
  if (city) return { lat: city.lat, lng: city.lng, label: city.name };

  const compact = q.replace(/\s+/g, "").toUpperCase();
  const opts = { next: { revalidate: 60 * 60 * 24 * 30 } } as const;
  try {
    if (/^[A-Z]{1,2}\d[A-Z\d]?\d[A-Z]{2}$/.test(compact)) {
      const r = await fetch(`https://api.postcodes.io/postcodes/${compact}`, opts);
      if (r.ok) {
        const { result } = await r.json();
        return { lat: result.latitude, lng: result.longitude, label: result.postcode };
      }
    }
    if (/^[A-Z]{1,2}\d[A-Z\d]?$/.test(compact)) {
      const r = await fetch(`https://api.postcodes.io/outcodes/${compact}`, opts);
      if (r.ok) {
        const { result } = await r.json();
        return { lat: result.latitude, lng: result.longitude, label: result.outcode };
      }
    }
    const r = await fetch(`https://api.postcodes.io/places?q=${encodeURIComponent(q)}&limit=1`, opts);
    if (r.ok) {
      const { result } = await r.json();
      if (result?.[0]) return { lat: result[0].latitude, lng: result[0].longitude, label: result[0].name_1 };
    }
  } catch {
    // network failure: fall through
  }
  return null;
}

export function milesBetween(a: { lat: number; lng: number }, b: { lat: number; lng: number }) {
  const R = 3958.8;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const s =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((a.lat * Math.PI) / 180) * Math.cos((b.lat * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(s));
}
