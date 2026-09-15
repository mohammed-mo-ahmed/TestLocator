export type TestCenterCountry = "eg" | "sa";

export interface TestCenter {
  code: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  country: TestCenterCountry;
  city?: string;
  link: string;
}

export interface UserLocation {
  lat: number;
  lng: number;
  label: string;
}

export interface TestCenterWithDistance extends TestCenter {
  distanceKm?: number;
  availability: Record<string, number>;
}

export interface TestInfo {
  code: string;
  available: boolean;
  dates: string[];
}

export interface GeoSearchResult {
  lat: number;
  lng: number;
  label: string;
}