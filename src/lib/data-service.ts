import { createClient, type SupabaseClient } from "@supabase/supabase-js";

import { buildSchedule } from "@/data/availability";
import { TEST_CENTERS } from "@/data/test-centers";
import { TEST_CENTER_COORDINATES } from "@/data/test-center-coordinates";
import { getTestByCode } from "@/data/test-dates";
import { getSupabaseEnv, isSupabaseConfigured } from "./supabase";
import type { TestCenter, TestInfo } from "./types";

type CenterRow = {
  code: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  country: "eg" | "sa";
  city: string | null;
  link: string | null;
};

let clientRef: SupabaseClient | null = null;

function getClient(): SupabaseClient | null {
  if (!isSupabaseConfigured()) return null;
  if (!clientRef) {
    const config = getSupabaseEnv();
    if (!config) return null;
    clientRef = createClient(config.url, config.anonKey);
  }
  return clientRef;
}

function monthColumn(date: string): string {
  return `m${date.replace(/-/g, "_")}`;
}

export function getLocalCenters(): TestCenter[] {
  const centers: TestCenter[] = [];
  for (const seed of TEST_CENTERS) {
    const coords = TEST_CENTER_COORDINATES[seed.code];
    if (!coords) continue;
    centers.push({
      code: seed.code,
      name: seed.name,
      address: seed.address,
      lat: coords.lat,
      lng: coords.lng,
      country: seed.country,
      city: seed.city || undefined,
      link: seed.link,
    });
  }
  return centers;
}

export async function fetchCenters(): Promise<TestCenter[]> {
  const client = getClient();
  if (!client) return getLocalCenters();

  try {
    const { data, error } = await client
      .from("test_centers")
      .select("code, name, address, lat, lng, country, city, link")
      .order("code");

    if (error) throw error;

    const centers: TestCenter[] = (data as CenterRow[])
      .filter(
        (row): row is CenterRow =>
          typeof row.lat === "number" &&
          typeof row.lng === "number" &&
          Boolean(row.code)
      )
      .map((row) => ({
        code: row.code,
        name: String(row.name ?? row.code),
        address: String(row.address ?? ""),
        lat: row.lat,
        lng: row.lng,
        country: row.country === "sa" ? "sa" : "eg",
        city: row.city || undefined,
        link: row.link ?? "",
      }));

    return centers.length > 0 ? centers : getLocalCenters();
  } catch {
    return getLocalCenters();
  }
}

export async function fetchAvailability(
  test: TestInfo,
  centerCodes: string[]
): Promise<Record<string, Record<string, number>>> {
  const client = getClient();
  if (client) {
    try {
      const cols = test.dates.map(monthColumn);
      const { data, error } = await client
        .from("test_centers")
        .select(`code, ${cols.join(", ")}`)
        .in("code", centerCodes);

      if (error) throw error;

      const byCenter: Record<string, Record<string, number>> = {};
      for (const row of data as unknown as Record<string, unknown>[]) {
        const code = String(row.code);
        const perDate: Record<string, number> = {};
        for (let i = 0; i < test.dates.length; i++) {
          perDate[test.dates[i]] = Number(row[cols[i]] ?? 0);
        }
        byCenter[code] = perDate;
      }

      if (Object.keys(byCenter).length > 0) return byCenter;
    } catch {
      // fall back to local deterministic schedule
    }
  }

  return buildSchedule(test.code, test.dates, centerCodes);
}

export async function fetchTestDates(testCode = "sat"): Promise<string[]> {
  const client = getClient();
  if (!client) return getTestByCode(testCode)?.dates ?? [];

  try {
    const { data, error } = await client
      .from("test_dates")
      .select("date")
      .eq("test_code", testCode)
      .order("date");

    if (error) throw error;

    const dates = (data as Array<{ date: string }>).map((r) => r.date);
    return dates.length > 0 ? dates : getTestByCode(testCode)?.dates ?? [];
  } catch {
    return getTestByCode(testCode)?.dates ?? [];
  }
}