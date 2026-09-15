import type { GeoSearchResult } from "@/lib/types";

interface NominatimPlace {
  lat: string;
  lon: string;
  display_name: string;
}

interface NominatimReversePlace {
  lat?: string;
  lon?: string;
  display_name?: string;
}

export class GeocodingError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = "GeocodingError";
    this.status = status;
  }
}

/**
 * Converts a free-text place (e.g. "Cairo, Egypt" or "Nasr City") into
 * coordinates using the free Nominatim geocoder (OpenStreetMap).
 */
export async function geocodePlace(
  query: string,
  acceptLanguage = "en"
): Promise<GeoSearchResult | null> {
  const q = query.trim();
  if (!q) return null;

  const url =
    `https://nominatim.openstreetmap.org/search` +
    `?format=jsonv2&limit=1&q=${encodeURIComponent(q)}`;

  const response = await fetch(url, {
    headers: {
      "Accept-Language": acceptLanguage,
      "User-Agent": "TestCenterFinder/1.0 (https://github.com/, educational project)",
    },
  });

  if (!response.ok) {
    throw new GeocodingError(`Nominatim request failed (${response.status})`, response.status);
  }

  const places = (await response.json()) as NominatimPlace[];
  const first = places[0];
  if (!first) return null;

  return {
    lat: Number.parseFloat(first.lat),
    lng: Number.parseFloat(first.lon),
    label: first.display_name,
  };
}

/**
 * Reverse geocoding: turns coordinates into a human-readable place label
 * (used to prettify the "Use my location" result).
 */
export async function reverseGeocode(
  lat: number,
  lng: number,
  acceptLanguage = "en"
): Promise<string | null> {
  const url =
    `https://nominatim.openstreetmap.org/reverse` +
    `?format=jsonv2&lat=${lat}&lon=${lng}&zoom=12`;

  try {
    const response = await fetch(url, {
      headers: {
        "Accept-Language": acceptLanguage,
        "User-Agent": "TestCenterFinder/1.0 (https://github.com/, educational project)",
      },
    });
    if (!response.ok) return null;
    const place = (await response.json()) as NominatimReversePlace;
    if (!place.display_name) return null;
    const parts = place.display_name.split(",").slice(0, 3).join(",");
    return parts || place.display_name;
  } catch {
    return null;
  }
}