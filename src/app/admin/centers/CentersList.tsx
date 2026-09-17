"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";

import { toggleCenterDateAvailability } from "@/app/admin/actions";
import { COUNTRIES, getCountryName } from "@/lib/countries";

type CenterRow = {
  code: string;
  name: string;
  address: string;
  country: string;
  city: string | null;
  test: string;
  availability: Record<string, number>;
};

const dateFormatter = (date: string) =>
  new Intl.DateTimeFormat("en", { month: "short", day: "numeric" }).format(
    new Date(`${date}T00:00:00`)
  );

export default function CentersList({
  centers,
  dates,
  testCode,
}: {
  centers: CenterRow[];
  dates: string[];
  testCode: string;
}) {
  const router = useRouter();
  const [pending, setPending] = useState<Set<string>>(new Set());
  const [isPending, startTransition] = useTransition();
  const [filter, setFilter] = useState("");
  const [country, setCountry] = useState("all");

  const filtered = centers.filter((c) => {
    const matchesCountry = country === "all" || c.country === country;
    if (!matchesCountry) return false;
    const q = filter.trim().toLowerCase();
    if (!q) return true;
    return (
      c.name.toLowerCase().includes(q) ||
      c.code.includes(q) ||
      (c.city ?? "").toLowerCase().includes(q)
    );
  });

  const dateLabels = useMemo(() => dates.map((d) => ({ date: d, label: dateFormatter(d) })), [dates]);

  async function run(action: () => Promise<void>, key: string) {
    startTransition(async () => {
      setPending((prev) => new Set(prev).add(key));
      try {
        await action();
        router.refresh();
      } finally {
        setPending((prev) => {
          const next = new Set(prev);
          next.delete(key);
          return next;
        });
      }
    });
  }

  function toggleDate(center: CenterRow, date: string, isAvailable: boolean) {
    void run(
      () => toggleCenterDateAvailability(testCode, center.code, date, !isAvailable),
      `${center.code}:${date}`
    );
  }

  return (
    <>
      <div className="mb-4 flex flex-col gap-3 sm:flex-row">
        <input
          type="text"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          placeholder="Search name, code or city…"
          className="h-11 w-full rounded-xl border border-slate-300 bg-white px-4 text-sm outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
        />
        <select
          value={country}
          onChange={(e) => setCountry(e.target.value)}
          className="h-11 w-full rounded-xl border border-slate-300 bg-white px-4 text-sm outline-none focus:border-indigo-400 sm:w-44"
        >
          <option value="all">All countries</option>
          {COUNTRIES.map((c) => (
            <option key={c.code} value={c.code}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      <p className="mb-3 text-sm text-slate-500">
        Showing {filtered.length} of {centers.length} {testCode.toUpperCase()} centers ·
        {dateLabels.length > 0
          ? ` months: ${dateLabels.map((d) => d.label).join(", ")}`
          : " no fixed exam dates"}
      </p>

      <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
        <table className="w-full min-w-max text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-left">
              <th className="px-4 py-3 font-semibold text-slate-700">Code</th>
              <th className="px-4 py-3 font-semibold text-slate-700">Name</th>
              <th className="px-4 py-3 font-semibold text-slate-700">Test</th>
              <th className="hidden px-4 py-3 font-semibold text-slate-700 lg:table-cell">City</th>
              <th className="hidden px-4 py-3 font-semibold text-slate-700 sm:table-cell">Country</th>
              {dateLabels.map(({ date, label }) => (
                <th key={date} className="px-3 py-3 text-center font-semibold text-slate-700">
                  {label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((c) => (
              <tr key={c.code} className="border-b border-slate-100 last:border-0">
                <td className="px-4 py-3 font-mono text-slate-500">{c.code}</td>
                <td className="px-4 py-3">
                  <span className="line-clamp-2 font-medium text-slate-900">{c.name}</span>
                </td>
                <td className="px-4 py-3">
                  <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-bold uppercase tracking-wide text-slate-600">
                    {c.test}
                  </span>
                </td>
                <td className="hidden px-4 py-3 text-slate-600 lg:table-cell">{c.city ?? "—"}</td>
                <td className="hidden px-4 py-3 text-slate-600 sm:table-cell">
                  {getCountryName(c.country)}
                </td>
                {dateLabels.map(({ date }) => {
                  const isAvailable = (c.availability[date] ?? 0) > 0;
                  const keyPending = isPending || pending.has(`${c.code}:${date}`);
                  return (
                    <td key={date} className="px-3 py-3 text-center">
                      <button
                        type="button"
                        disabled={keyPending}
                        onClick={() => toggleDate(c, date, isAvailable)}
                        title={`${c.name} — ${date.replace(/-/g, "/")}: ${isAvailable ? "متاح" : "غير متاح"}`}
                        className={
                          isAvailable
                            ? "inline-flex h-8 items-center gap-1.5 rounded-full border border-emerald-300 bg-emerald-50 px-2.5 text-xs font-semibold text-emerald-700 transition hover:bg-emerald-100 disabled:opacity-40"
                            : "inline-flex h-8 items-center gap-1.5 rounded-full border border-rose-300 bg-rose-50 px-2.5 text-xs font-semibold text-rose-700 transition hover:bg-rose-100 disabled:opacity-40"
                        }
                      >
                        <span
                          className={`h-1.5 w-1.5 rounded-full ${isAvailable ? "bg-emerald-500" : "bg-rose-500"}`}
                        />
                        {isAvailable ? "متاح" : "غير متاح"}
                      </button>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>

        {filtered.length === 0 ? (
          <p className="px-4 py-8 text-center text-sm text-slate-500">
            No centers match your search.
          </p>
        ) : null}
      </div>

      <p className="mt-3 text-xs text-slate-500">
        Each month is its own column on test_centers (like the Excel sheet):
        green = متاح, red = غير متاح. Data comes straight from the sheet — no
        seat counts are invented. Adding/removing a month adds/removes the
        matching column.
      </p>
    </>
  );
}