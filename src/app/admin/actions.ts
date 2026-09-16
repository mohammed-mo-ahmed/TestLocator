"use server";

import { createClient } from "@/lib/supabase-server";
import { getAdminClient } from "@/lib/admin-service";
import { redirect } from "next/navigation";

export async function signOut() {
  const client = await createClient();
  if (client) await client.auth.signOut();
  redirect("/admin/login");
}

export async function requireAuth() {
  const client = await createClient();
  if (!client) redirect("/admin/login");
  const { data: { user } } = await client.auth.getUser();
  if (!user) redirect("/admin/login");
  return user;
}

export async function toggleCenterDateAvailability(
  testCode: string,
  centerCode: string,
  date: string,
  available: boolean
) {
  await requireAuth();
  const admin = getAdminClient();
  if (!admin) throw new Error("Admin client not configured");

  const col = `m${date.replace(/-/g, "_")}`;
  const { error } = await admin
    .from("test_centers")
    .update({ [col]: available ? 1 : 0 })
    .eq("code", centerCode);
  if (error) throw error;
}

export async function addTestMonth(testCode: string, date: string) {
  await requireAuth();
  const admin = getAdminClient();
  if (!admin) throw new Error("Admin client not configured");
  const { error } = await admin.rpc("add_test_month", {
    p_test: testCode,
    p_date: date,
  });
  if (error) throw error;
}

export async function deleteTestMonth(testCode: string, date: string) {
  await requireAuth();
  const admin = getAdminClient();
  if (!admin) throw new Error("Admin client not configured");
  const { error } = await admin.rpc("delete_test_month", {
    p_test: testCode,
    p_date: date,
  });
  if (error) throw error;
}

function monthColumn(date: string): string {
  return `m${date.replace(/-/g, "_")}`;
}

export async function resolveGpsLink(url: string): Promise<{ lat: number; lng: number } | null> {
  await requireAuth();

  try {
    const res = await fetch(url, {
      redirect: "follow",
      headers: { "User-Agent": "Mozilla/5.0" },
    });
    const html = await res.text();

    const patterns = [
      /!3d([-\d.]+)!4d([-\d.]+)/,
      /@([-\d.]+),([-\d.]+)/,
      /["']([-\d.]+),([-\d.]+)["']/,
      /coordinates.*?([-\d.]+)\s*,\s*([-\d.]+)/i,
      /lat[":\s]+([-\d.]+).*?lng[":\s]+([-\d.]+)/i,
      /latitude[":\s]+([-\d.]+).*?longitude[":\s]+([-\d.]+)/i,
    ];

    for (const pattern of patterns) {
      const match = html.match(pattern);
      if (match) {
        const lat = parseFloat(match[1]);
        const lng = parseFloat(match[2]);
        if (!isNaN(lat) && !isNaN(lng) && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
          return { lat, lng };
        }
      }
    }

    return null;
  } catch {
    return null;
  }
}

export async function addTestCenter(data: {
  code: number;
  name: string;
  address: string;
  country: string;
  lat: number;
  lng: number;
  link: string;
  availability: Record<string, number>;
}) {
  await requireAuth();
  const admin = getAdminClient();
  if (!admin) throw new Error("Admin client not configured");

  const row: Record<string, unknown> = {
    code: data.code,
    name: data.name,
    address: data.address,
    country: data.country,
    lat: data.lat,
    lng: data.lng,
    link: data.link || null,
  };

  for (const [date, value] of Object.entries(data.availability)) {
    row[monthColumn(date)] = value;
  }

  const { error } = await admin.from("test_centers").insert(row);
  if (error) throw error;
}