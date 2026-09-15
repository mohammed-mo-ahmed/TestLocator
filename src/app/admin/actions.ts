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