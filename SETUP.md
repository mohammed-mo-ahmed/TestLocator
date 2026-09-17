# TestLocator — Setup Guide

## Run locally (no Supabase needed)

```bash
npm install
npm run dev
```

Open http://localhost:3000. The app works out of the box using **local seed data**
(231 test centers — 66 Egypt + 88 Saudi Arabia for SAT, plus 41 Saudi + 36 Egypt
AP centers — with per-date seat availability for the SAT) bundled in `src/data/`.

## Stack

- Next.js 16 (App Router, Turbopack), TypeScript, Tailwind CSS v4
- next-intl (i18n) — 10 locales: `en, es, fr, de, zh, ja, ko, ar, pt, hi`
- React Leaflet + OpenStreetMap tiles (CartoDB Positron), Nominatim geocoding
- Framer Motion animations
- Supabase (Postgres) for live data (optional)

## Verification

```bash
npm run typecheck
npm run lint
npm run build
```

## Choosing a test

Tests are defined in `src/data/test-dates.ts`. A test is **live** when it has
dates:

| Test    | Dates configured | Status        |
| ------- | ---------------- | ------------- |
| SAT     | Yes              | Live          |
| AP      | No (no fixed administrations) | Live |
| ACT     | Yes (demo)       | Disabled      |
| IELTS   | No               | Coming soon   |
| TOEFL   | No               | Coming soon   |

The SAT currently uses the administrations from the availability sheet:
`2026-10-03`, `2026-11-07`, `2026-12-05`. ACT shows "Coming soon" (its demo dates
are disabled so it seeds nothing). To enable another test, set its `available`
flag to `true` — seeding and the UI pick it up automatically.

AP behaves exactly like SAT (wizard, map, ranked list, admin center management)
**except** it has no fixed exam dates: no date chips, no availability columns
and no admin Months page.

## Test center data

- `src/data/test-centers.ts` — the 154 SAT centers (code, name, address, country,
  city), 66 in Egypt + 88 in Saudi Arabia.
- `src/data/ap-centers.ts` — the 77 AP centers (codes `900001`–`900077`), 41
  Saudi + 36 Egypt, generated from the AP sheets; includes the same coordinates
  embedded in the sheet (`AP_CENTER_COORDINATES`).
- `src/data/all-centers.ts` — aggregates both data services read from
  (`ALL_CENTERS`, `ALL_CENTER_COORDINATES`). Each center carries a `test` field
  (`"sat"` or `"ap"`); `data-service.ts` filters on it.
- `src/data/test-center-coordinates.ts` — lat/lng per center, resolved from the
  Google Maps links in the user's Excel sheets (2:1 in both countries, so they
  are street-accurate).
- `src/data/test-availability.ts` — per-center, per-date seat availability from
  the SAT sheet (0 = unavailable, 5–30 = available) for the SAT dates.

These files are **generated** by:

```bash
npx tsx scripts/extract-sheet.ts      # SAT Excel → scripts/sheet-data.json
npx tsx scripts/resolve-links.ts      # goo.gl links → scripts/coords-cache.json
npx tsx scripts/build-data-files.ts   # → src/data/test-centers.ts
npx tsx scripts/build-ap-data.ts      # AP Excel → src/data/ap-centers.ts
```

`build-ap-data.ts` reads `public/جدول بيانات بدون عنوان (1).xlsx` (sheet
`الورقة4`), asks the user to confirm a "pick center" override each run, and
assigns stable integer codes (`900001`+) so AP codes never collide with the
5–6 digit SAT codes. To refresh after either sheet changes, re-run the matching
scripts above.

## Supabase (live data)

The app only talks to Supabase when these env vars are present:

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

Copy `.env.local.example` → `.env.local` and fill in values from your Supabase
project (Project settings → API → Project URL and anon/public key).

### 1. Create a Supabase project

1. Go to https://supabase.com → **New project**.
2. Copy the **Project URL** and **anon public key** into `.env.local`.

### 2. Create the tables (SQL editor)

Run `supabase/admin-schema.sql` in Supabase → SQL Editor. It creates **all**
tables, functions and policies in one shot (safe on a fresh project and
re-runnable):

- `test_centers` — (code, name, address, lat, lng, country, city, link,
  `test` — `'sat'` or `'ap'`, default `'sat'`) plus
  **one column per admin month** (`m2026_10_03`, `m2026_11_07`, `m2026_12_05`,
  …), each `1` = متاح / `0` = غير متاح — exactly like the Excel sheet. AP
  centers have `test = 'ap'` and no month columns (no fixed administrations).
- `test_dates` — the month grid per test (the same 3 SAT months by default).
- `rating_votes` — Yes/No feedback answers.
- `problem_reports` — messages from the "Report a problem" form.
- `add_test_month` / `delete_test_month` — Postgres functions that add or drop
  the matching `test_centers` column (used by the admin Months page).

Availability is **per center per month** in its own column: a center can be متاح
in October and غير متاح in November. No seat counts are invented — only the
متاح / غير متاح values from the sheet are stored.

### 3. Row Level Security

Included in the same file. Public clients can **read** centers and dates, and
**insert** votes/reports; writes (toggle a center's month, add/delete months,
seeding) happen with the `service_role` key, which bypasses RLS.

### 4. Seed the data

```bash
# Add to .env.local (NOT public — server only):
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

npm run seed
```

This creates the month columns and upserts:

- `test_centers` — 231 rows (`code, name, address, lat, lng, country, city,
  link, test`, plus one month column per SAT administration with متاح/غير متاح
  values; AP rows omit month values)
- `test_dates` — the month grid per test (the three SAT months for SAT, none for
  AP)

The per-month values come straight from the sheet (`متاح` → 1, `غير متاح` → 0).

> Keep the `service_role` key out of the browser bundle. The app only ever uses
> the public anon key, which is read-only thanks to the policies above.

### 5. Admin dashboard + feedback tables

Already created by `supabase/admin-schema.sql` in step 2. The admin dashboard
lives at **`/admin`** and lets an authenticated admin:

### 6. Admin login

The admin area is secured with **Supabase Auth** (email/password):

1. In Supabase → Authentication → Users → **Add user** for your admin email.
2. Set `NEXT_PUBLIC_SUPABASE_URL` + `NEXT_PUBLIC_SUPABASE_ANON_KEY` (browser
   login) and `SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY` (server actions) in
   `.env.local`.
3. Open **`/admin`** → sign in.

The dashboard lets you:

- See Yes / No vote counts for the rating question.
- Read problem reports.
- Switch between **SAT** and **AP** test centers (`/admin/centers?test=sat|ap`).
- Toggle any SAT center's month متاح/غير متاح (each month is its own column).
- Add a SAT or AP center; AP centers have no month availability.
- Add a month (adds a column, default غير متاح for every center) or delete a
  month (drops the column from all centers).

## Data refresh / editing

### SAT centers

The SAT source data lives in `public/جدول بيانات بدون عنوان.xlsx`. To update:

1. Replace the xlsx with the latest version.
2. Re-run the pipeline:

```bash
npx tsx scripts/extract-sheet.ts
npx tsx scripts/resolve-links.ts
npx tsx scripts/build-data-files.ts
```

3. Reseed if Supabase is configured: `npm run seed`.

### AP centers

AP source data was spread over two sheets (`public/جدول بيانات بدون عنوان.xlsx`
— Egypt, and `جدول بيانات بدون عنوان (1).xlsx` — Saudi Arabia), read by
`scripts/build-ap-data.ts`. The builder is **incremental**: if a source sheet is
gone it reuses the centers already generated (so deleting the Saudi sheet does
not drop the 41 Saudi centers), and each run confirms/preserves the
"pick center" overrides for rows whose sheet values were stale — remove an
entry from `OVERRIDES` once the sheet itself is fixed.

```bash
npx tsx scripts/build-ap-data.ts   # → src/data/ap-centers.ts
```

The script assigns codes `900001`+ keeping existing codes stable even if the
sheet grows or a source file is removed.

> Note: the Egypt sheet currently lives at the same path the SAT pipeline
> (`extract-sheet.ts`) previously read from. The SAT data is already generated
> and seeded, so this only matters if you re-run the SAT sheet pipeline without
> restoring the real SAT sheet at that path first.

### Seeding after edits

```bash
npm run seed
```

The seeder reads `ALL_CENTERS` (SAT + AP) and writes each center's `test`
column plus only its own test's month columns — AP rows have none.

### Notes

- Both Excel files are **not** committed to git. Keep a copy outside the repo.
- `src/data/test-centers.ts` and `src/data/ap-centers.ts` are generated — do
  not hand-edit; re-run the scripts above.
- The per-month values come straight from the sheet (`متاح` → 1, `غير متاح`
  → 0).