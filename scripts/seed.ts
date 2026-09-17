import "dotenv/config";
import dotenv from "dotenv";

dotenv.config({ path: ".env" });
dotenv.config({ path: ".env.local" });

import { createClient } from "@supabase/supabase-js";

import { buildSchedule } from "../src/data/availability";
import { ALL_CENTER_COORDINATES, ALL_CENTERS } from "../src/data/all-centers";
import { TESTS } from "../src/data/test-dates";

function monthColumn(date: string): string {
  return `m${date.replace(/-/g, "_")}`;
}

async function main() {
  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    throw new Error(
      "SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY env vars are required (see .env.local.example and SETUP.md)."
    );
  }

  const admin = createClient(url, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const activeTests = TESTS.filter((t) => t.available && t.dates.length > 0);
  const inactiveTests = TESTS.filter((t) => !t.available);

  // 1. Create (or re-create) one column per month, mirroring the Excel sheet.
  for (const test of activeTests) {
    for (const date of test.dates) {
      const { error: colError } = await admin.rpc("add_test_month", {
        p_test: test.code,
        p_date: date,
      });
      if (colError) throw colError;
    }
  }

  // 2. Remove columns + test_dates rows for tests that are no longer shown.
  for (const test of inactiveTests) {
    const { data: staleDates } = await admin
      .from("test_dates")
      .select("date")
      .eq("test_code", test.code);

    for (const row of (staleDates as Array<{ date: string }>) ?? []) {
      const { error: colError } = await admin.rpc("delete_test_month", {
        p_test: test.code,
        p_date: row.date,
      });
      if (colError) throw colError;
    }
  }

  // 3. Upsert the centers including their per-month columns. Each center only
  // gets its own test's month values; tests without dates (e.g. AP) get 0 for
  // every existing month column so the NOT NULL columns always receive a value.
  const datesByTest: Record<string, string[]> = {};
  for (const test of activeTests) datesByTest[test.code] = test.dates;

  // Every month column that currently exists on test_centers (created above).
  const allMonthColumns = new Set<string>();
  for (const test of activeTests) {
    for (const date of test.dates) allMonthColumns.add(monthColumn(date));
  }

  const centers = ALL_CENTERS.flatMap((center) => {
    const coords = ALL_CENTER_COORDINATES[center.code];
    if (!coords) {
      console.log(`Skipping center without coordinates: ${center.code} ${center.name}`);
      return [];
    }
    const testCode = center.test ?? "sat";
    const dates = datesByTest[testCode] ?? [];
    const schedule = buildSchedule(testCode, dates, [center.code])[center.code];
    const row: Record<string, unknown> = {
      code: center.code,
      name: center.name,
      address: center.address,
      lat: coords.lat,
      lng: coords.lng,
      country: center.country,
      city: center.city || null,
      link: center.link,
      test: testCode,
    };
    for (const date of dates) {
      row[monthColumn(date)] = schedule?.[date] ?? 1;
    }
    for (const col of allMonthColumns) {
      if (row[col] === undefined) row[col] = 0;
    }
    return [row];
  });

  const { error: centerError } = await admin
    .from("test_centers")
    .upsert(centers, { onConflict: "code" });

  if (centerError) throw centerError;

  // 4. Sync the month grid table (test_dates) used by admin + results chips.
  const testRows = activeTests.flatMap((test) =>
    test.dates.map((date) => ({ test_code: test.code, date }))
  );

  if (testRows.length > 0) {
    const { error: datesError } = await admin
      .from("test_dates")
      .upsert(testRows, { onConflict: "test_code,date" });
    if (datesError) throw datesError;
  }

  const monthCount = activeTests.reduce((sum, t) => sum + t.dates.length, 0);
  console.log(
    `Seeded ${centers.length} test centers across ${monthCount} month column(s) for: ${[...new Set(ALL_CENTERS.map((c) => c.test ?? "sat"))].join(", ")}`
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});