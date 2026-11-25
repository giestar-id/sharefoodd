/**
 * Geospatial utilities for ShareFood:
 * - Haversine distance calculation (km)
 * - Google Maps / short-link (share.google, maps.app.goo.gl) coordinate extraction
 */

export interface Coordinates {
  lat: number;
  lng: number;
}

/**
 * Calculate great-circle distance between two coordinates in kilometers (Haversine formula).
 */
export function calculateDistanceKm(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Extract lat/lng coordinates directly from a URL or HTML snippet.
 */
export function extractCoordsFromText(text: string): Coordinates | null {
  if (!text) return null;

  // 1. Exact place pin in Google Maps URLs: !3d-7.4290!4d109.2350
  const pinMatch = text.match(/!3d(-?\d+\.\d+)!4d(-?\d+\.\d+)/);
  if (pinMatch) {
    return { lat: parseFloat(pinMatch[1]), lng: parseFloat(pinMatch[2]) };
  }

  // 2. Viewport / center coordinates: @-7.4290,109.2350
  const atMatch = text.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
  if (atMatch) {
    return { lat: parseFloat(atMatch[1]), lng: parseFloat(atMatch[2]) };
  }

  // 3. Query parameter coordinates: ?q=-7.4290,109.2350 or &ll=-7.4290,109.2350 or &center=...
  const queryMatch = text.match(/[?&](?:q|ll|center)=(-?\d+\.\d+)(?:,|%2C)(-?\d+\.\d+)/i);
  if (queryMatch) {
    return { lat: parseFloat(queryMatch[1]), lng: parseFloat(queryMatch[2]) };
  }

  // 4. Static map / og:image center in HTML: center=-7.4290%2C109.2350
  const centerMatch = text.match(/center=(-?\d+\.\d+)(?:,|%2C)(-?\d+\.\d+)/i);
  if (centerMatch) {
    return { lat: parseFloat(centerMatch[1]), lng: parseFloat(centerMatch[2]) };
  }

  return null;
}

/**
 * Server-side resolver for Google Maps URLs including short links like
 * https://share.google/... or https://maps.app.goo.gl/...
 */
export async function resolveMapsCoordinates(
  rawUrl: string
): Promise<Coordinates | null> {
  if (!rawUrl || !rawUrl.trim()) return null;
  const trimmed = rawUrl.trim();

  // Fast path: check if coordinates are already in the URL
  const direct = extractCoordsFromText(trimmed);
  if (direct) return direct;

  if (!trimmed.startsWith('http://') && !trimmed.startsWith('https://')) {
    return null;
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 5000);

  try {
    const res = await fetch(trimmed, {
      method: 'GET',
      redirect: 'follow',
      signal: controller.signal,
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      },
    });

    // Check resolved final URL
    if (res.url) {
      const fromResolvedUrl = extractCoordsFromText(res.url);
      if (fromResolvedUrl) return fromResolvedUrl;
    }

    // Check HTML body (meta tags / embedded Maps links)
    const html = await res.text();
    const snippet = html.slice(0, 60000);
    const fromHtml = extractCoordsFromText(snippet);
    if (fromHtml) return fromHtml;

    // Fallback: if redirected URL has ?q=Place+Name, geocode via OpenStreetMap Nominatim
    try {
      const parsed = new URL(res.url || trimmed);
      const q = parsed.searchParams.get('q');
      if (q && q.length > 2) {
        const nomRes = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(q)}`,
          {
            signal: controller.signal,
            headers: { 'User-Agent': 'ShareFood-App/1.0' },
          }
        );
        if (nomRes.ok) {
          const nomData = await nomRes.json();
          if (Array.isArray(nomData) && nomData[0]?.lat && nomData[0]?.lon) {
            return {
              lat: parseFloat(nomData[0].lat),
              lng: parseFloat(nomData[0].lon),
            };
          }
        }
      }
    } catch {
      // Ignore fallback geocoding errors
    }

    return null;
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}
