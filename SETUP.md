# TestLocator — Setup Guide

## Run locally (no Supabase needed)

```bash
npm install
npm run dev
```

Open http://localhost:3000. The app works out of the box using **local seed data**
(154 test centers — 66 Egypt + 88 Saudi Arabia — with per-date seat
availability for the SAT) bundled in `src/data/`.

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
| ACT     | Yes (demo)       | Disabled      |
| IELTS   | No               | Coming soon   |
| TOEFL   | No               | Coming soon   |

The SAT currently uses the administrations from the availability sheet:
`2026-10-03`, `2026-11-07`, `2026-12-05`. ACT shows "Coming soon" (its demo dates
are disabled so it seeds nothing). To enable another test, set its `available`
flag to `true` — seeding and the UI pick it up automatically.

## Test center data

- `src/data/test-centers.ts` — the 154 centers (code, name, address, country,
  city), 66 in Egypt + 88 in Saudi Arabia.
- `src/data/test-center-coordinates.ts` — lat/lng per center, resolved from the
  Google Maps links in the user's Excel sheet (2:1 in both countries, so they
  are street-accurate).
- `src/data/test-availability.ts` — per-center, per-date seat availability from
  the sheet (0 = unavailable, 5–30 = available) for the SAT dates.

These files are **generated** by:

```bash
npx tsx scripts/extract-sheet.ts   # Excel → scripts/sheet-data.json
npx tsx scripts/resolve-links.ts   # goo.gl links → scripts/coords-cache.json
npx tsx scripts/build-data-files.ts # → src/data/*
```

To refresh after the sheet changes, re-run the three scripts above.

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

- `test_centers` — (code, name, address, lat, lng, country, city, link) plus
  **one column per admin month** (`m2026_10_03`, `m2026_11_07`, `m2026_12_05`,
  …), each `1` = متاح / `0` = غير متاح — exactly like the Excel sheet.
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

- `test_centers` — 154 rows (`code, name, address, lat, lng, country, city,
  link`, plus one column per month with متاح/غير متاح values)
- `test_dates` — the month grid per test (the three SAT months)

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
- Toggle any test center's month متاح/غير متاح (each month is its own column).
- Add a month (adds a column, default غير متاح for every center) or delete a
  month (drops the column from all centers).

## Data refresh / editing

The source data lives in the user's Excel file (`public/جدول بيانات بدون
عنوان.xlsx`). To update:

1. Replace the xlsx with the latest version.
2. Re-run the pipeline:

```bash
npx tsx scripts/extract-sheet.ts
npx tsx scripts/resolve-links.ts
npx tsx scripts/build-data-files.ts
```

3. Reseed if Supabase is configured: `npm run seed`.

The site stores the sheet's متاح / غير متاح values as-is (1 / 0), one column
per month — no seat counts are invented. The public site and admin dashboard
read the very same values the sheet has.