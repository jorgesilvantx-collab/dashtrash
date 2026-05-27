export type LatLng = { lat: number; lng: number };

export function haversineMiles(a: LatLng, b: LatLng): number {
  const R = 3958.8;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

export function clusterKeyFromLatLng(lat: number, lng: number): string {
  const round = (n: number) => Math.round(n * 50) / 50;
  return `${round(lat).toFixed(2)},${round(lng).toFixed(2)}`;
}

const MAPBOX = process.env.MAPBOX_TOKEN || process.env.MAPBOX_SECRET_TOKEN || "";

export type GeocodeResult = { lat: number; lng: number; display: string } | null;

export async function geocodeAddress(query: string): Promise<GeocodeResult> {
  if (!query.trim()) return null;
  if (MAPBOX) {
    try {
      const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?country=US&limit=1&access_token=${MAPBOX}`;
      const res = await fetch(url);
      if (!res.ok) return null;
      const data = (await res.json()) as { features?: Array<{ center: [number, number]; place_name: string }> };
      const f = data.features?.[0];
      if (!f) return null;
      return { lat: f.center[1], lng: f.center[0], display: f.place_name };
    } catch {
      return null;
    }
  }
  try {
    const url = `https://nominatim.openstreetmap.org/search?format=json&limit=1&countrycodes=us&q=${encodeURIComponent(query)}`;
    const res = await fetch(url, { headers: { "User-Agent": "DashTrash/1.0" } });
    if (!res.ok) return null;
    const data = (await res.json()) as Array<{ lat: string; lon: string; display_name: string }>;
    if (!data.length) return null;
    return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon), display: data[0].display_name };
  } catch {
    return null;
  }
}

export type Suggestion = {
  id: string;
  label: string;
  street?: string;
  city?: string;
  state?: string;
  zip?: string;
  lat: number;
  lng: number;
};

export async function suggestAddresses(query: string, proximity?: LatLng): Promise<Suggestion[]> {
  if (!query.trim() || query.trim().length < 3) return [];
  if (!MAPBOX) return [];
  try {
    const prox = proximity ? `&proximity=${proximity.lng},${proximity.lat}` : "&proximity=-96.797,32.7767";
    const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?country=US&limit=6&autocomplete=true&types=address${prox}&access_token=${MAPBOX}`;
    const res = await fetch(url);
    if (!res.ok) return [];
    const data = (await res.json()) as {
      features?: Array<{
        id: string;
        place_name: string;
        text: string;
        address?: string;
        center: [number, number];
        context?: Array<{ id: string; text: string; short_code?: string }>;
      }>;
    };
    return (data.features ?? []).map((f) => {
      const ctx = f.context ?? [];
      const place = ctx.find((c) => c.id.startsWith("place"))?.text;
      const region = ctx.find((c) => c.id.startsWith("region"))?.short_code?.split("-").pop()?.toUpperCase();
      const postcode = ctx.find((c) => c.id.startsWith("postcode"))?.text;
      const street = [f.address, f.text].filter(Boolean).join(" ");
      return {
        id: f.id,
        label: f.place_name,
        street,
        city: place,
        state: region,
        zip: postcode,
        lat: f.center[1],
        lng: f.center[0],
      };
    });
  } catch {
    return [];
  }
}
