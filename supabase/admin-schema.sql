-- ---------------------------------------------------------------------------
-- TestLocator — full schema (run in Supabase SQL Editor)
--
-- Availability lives as one column per admin month on `test_centers`
-- (mirroring the Excel sheet), e.g. `m2026_10_03` = 1 (متاح) / 0 (غير متاح).
-- Admin adds a month → column is added; deletes a month → column is dropped.
-- Safe to re-run (idempotent). After running, use `npm run seed`.
-- ---------------------------------------------------------------------------

-- Base: test centers + the dynamic month grid. Months are columns (not a
-- table of rows) so the DB mirrors the user's sheet exactly.
create table if not exists public.test_centers (
  code    integer primary key,
  name    text not null,
  address text not null default '',
  lat     double precision not null,
  lng     double precision not null,
  country text not null default 'eg',
  city    text,
  link    text
);

alter table public.test_centers
  add column if not exists link text;

-- Exam each center belongs to (default 'sat'). Tests are scoped so SAT and AP
-- centers never mix in results. AP centers have no month columns at all.
alter table public.test_centers
  add column if not exists test text not null default 'sat';

-- Feedback: rating votes from the "useful" question (Yes / No)
create table if not exists public.rating_votes (
  id         bigint generated always as identity primary key,
  answer     text not null check (answer in ('yes', 'no')),
  created_at timestamptz not null default now()
);

-- Feedback: messages from the landing "Report a problem" form
create table if not exists public.problem_reports (
  id         bigint generated always as identity primary key,
  name       text not null default '',
  contact    text not null default '',
  message    text not null,
  created_at timestamptz not null default now()
);

-- Which months exist, per test (drives the admin Months page + the public
-- results date chips). The matching columns live on test_centers.
create table if not exists public.test_dates (
  test_code text not null,
  date      date not null,
  primary key (test_code, date)
);

-- ---------------------------------------------------------------------------
-- Dynamic month columns
-- ---------------------------------------------------------------------------

-- Add a month: records it in test_dates and creates the matching column on
-- test_centers (default 0 = غير متاح across all centers).
create or replace function public.add_test_month(p_test text, p_date date)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.test_dates (test_code, date)
  values (p_test, p_date)
  on conflict (test_code, date) do nothing;

  execute format(
    'alter table public.test_centers add column if not exists %I integer not null default 0',
    'm' || to_char(p_date, 'YYYY_MM_DD')
  );
end;
$$;

-- Remove a month: deletes it from test_dates and drops the matching column.
create or replace function public.delete_test_month(p_test text, p_date date)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  delete from public.test_dates where test_code = p_test and date = p_date;

  execute format(
    'alter table public.test_centers drop column if exists %I',
    'm' || to_char(p_date, 'YYYY_MM_DD')
  );
end;
$$;

grant execute on function public.add_test_month(text, date) to service_role;
grant execute on function public.delete_test_month(text, date) to service_role;

-- ---------------------------------------------------------------------------
-- Row Level Security
-- Public clients: read centers + month list, insert feedback rows.
-- Writes (toggle a center's month, add/delete months, seed) run with the
-- service_role key, which bypasses RLS — no other policies are needed.
-- ---------------------------------------------------------------------------

alter table public.test_centers enable row level security;
alter table public.rating_votes enable row level security;
alter table public.problem_reports enable row level security;
alter table public.test_dates enable row level security;

drop policy if exists "public read test_centers" on public.test_centers;
create policy "public read test_centers"
  on public.test_centers for select using (true);

drop policy if exists "public insert rating_votes" on public.rating_votes;
create policy "public insert rating_votes"
  on public.rating_votes for insert with check (true);

drop policy if exists "public insert problem_reports" on public.problem_reports;
create policy "public insert problem_reports"
  on public.problem_reports for insert with check (true);

drop policy if exists "public read test_dates" on public.test_dates;
create policy "public read test_dates"
  on public.test_dates for select using (true);

-- Legacy cleanup (older layout had an availability table + a single
-- test_centers.available column). Dropped once the columns above are live.
drop table if exists public.availability;
alter table public.test_centers drop column if exists available;