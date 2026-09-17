import { createClient, type SupabaseClient } from "@supabase/supabase-js";

import { isSupabaseConfigured } from "./supabase";

let adminRef: SupabaseClient | null = null;

export function getAdminClient(): SupabaseClient | null {
  if (!isSupabaseConfigured()) return null;
  if (adminRef) return adminRef;

  const url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) return null;

  adminRef = createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return adminRef;
}

export interface RatingVote {
  id: number;
  answer: "yes" | "no";
  created_at: string;
}

export interface ProblemReport {
  id: number;
  name: string;
  contact: string;
  message: string;
  created_at: string;
}

export interface TestCenterRow {
  code: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  country: string;
  city: string | null;
  link: string | null;
  test: string;
  availability: Record<string, number>;
}

export interface TestDateRow {
  test_code: string;
  date: string;
}

function monthColumn(date: string): string {
  return `m${date.replace(/-/g, "_")}`;
}

export async function getVoteStats(): Promise<{ yes: number; no: number; total: number }> {
  const admin = getAdminClient();
  if (!admin) return { yes: 0, no: 0, total: 0 };

  const [yesRes, noRes] = await Promise.all([
    admin.from("rating_votes").select("id", { count: "exact", head: true }).eq("answer", "yes"),
    admin.from("rating_votes").select("id", { count: "exact", head: true }).eq("answer", "no"),
  ]);

  const yes = yesRes.count ?? 0;
  const no = noRes.count ?? 0;
  return { yes, no, total: yes + no };
}

export async function getReports(limit = 50): Promise<ProblemReport[]> {
  const admin = getAdminClient();
  if (!admin) return [];

  const { data } = await admin
    .from("problem_reports")
    .select("id, name, contact, message, created_at")
    .order("created_at", { ascending: false })
    .limit(limit);

  return (data as ProblemReport[]) ?? [];
}

export async function getAllCenters(
  dates: string[] = [],
  testCode = "sat"
): Promise<TestCenterRow[]> {
  const admin = getAdminClient();
  if (!admin) return [];

  const monthCols = dates.map(monthColumn);
  const selectCols = monthCols.length > 0
    ? `code, name, address, lat, lng, country, city, link, test, ${monthCols.join(", ")}`
    : "code, name, address, lat, lng, country, city, link, test";

  const { data, error } = await admin
    .from("test_centers")
    .select(selectCols)
    .eq("test", testCode)
    .order("code");

  if (error || !data) return [];

  return ((data as unknown as Record<string, unknown>[]) ?? []).map((row) => {
    const availability: Record<string, number> = {};
    for (const date of dates) {
      availability[date] = Number(row[monthColumn(date)] ?? 0);
    }
    return {
      code: String(row.code),
      name: String(row.name),
      address: String(row.address),
      lat: Number(row.lat),
      lng: Number(row.lng),
      country: String(row.country),
      city: (row.city as string) ?? null,
      link: (row.link as string) ?? null,
      test: String(row.test ?? testCode),
      availability,
    };
  });
}

export async function getTestDates(testCode = "sat"): Promise<string[]> {
  const admin = getAdminClient();
  if (!admin) return [];

  const { data } = await admin
    .from("test_dates")
    .select("date")
    .eq("test_code", testCode)
    .order("date");

  return ((data as Array<{ date: string }>) ?? []).map((r) => r.date);
}