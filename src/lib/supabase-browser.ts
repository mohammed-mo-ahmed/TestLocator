import { createClient, type SupabaseClient } from "@supabase/supabase-js";

import { getSupabaseEnv } from "./supabase";

let browserRef: SupabaseClient | null = null;

export function getBrowserClient(): SupabaseClient | null {
  if (typeof window === "undefined") return null;
  const env = getSupabaseEnv();
  if (!env) return null;
  if (!browserRef) {
    browserRef = createClient(env.url, env.anonKey, {
      auth: { persistSession: false },
    });
  }
  return browserRef;
}