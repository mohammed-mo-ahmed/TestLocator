import Link from "next/link";

import { requireAuth, signOut } from "@/app/admin/actions";
import { getVoteStats, getReports, getAllCenters, getTestDates } from "@/lib/admin-service";

export const dynamic = "force-dynamic";

export default async function AdminOverview() {
  await requireAuth();
  const [stats, reports, centers, dates] = await Promise.all([
    getVoteStats(),
    getReports(5),
    getAllCenters(),
    getTestDates("sat"),
  ]);

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
        <div className="flex items-center gap-3">
          <Link
            href="/admin/centers"
            className="h-9 rounded-lg border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            Centers
          </Link>
          <Link
            href="/admin/months"
            className="h-9 rounded-lg border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            Months
          </Link>
          <Link
            href="/admin/reports"
            className="h-9 rounded-lg border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            Reports
          </Link>
          <form action={signOut}>
            <button
              type="submit"
              className="h-9 rounded-lg border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              Sign out
            </button>
          </form>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-4">
        <Card label="Yes votes" value={stats.yes} tone="green" />
        <Card label="No votes" value={stats.no} tone="red" />
        <Card label="Total votes" value={stats.total} tone="blue" />
        <Card label="Centers" value={centers.length} tone="purple" />
      </div>

      <div className="mt-8 grid gap-6 sm:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <h2 className="mb-3 text-sm font-bold text-slate-900">SAT Months</h2>
          {dates.length === 0 ? (
            <p className="text-sm text-slate-500">No months configured.</p>
          ) : (
            <ul className="flex flex-col gap-1">
              {dates.map((d) => (
                <li key={d} className="rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-700">
                  {d}
                </li>
              ))}
            </ul>
          )}
          <Link href="/admin/months" className="mt-3 inline-block text-sm font-semibold text-indigo-600 hover:text-indigo-700">
            Manage months →
          </Link>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <h2 className="mb-3 text-sm font-bold text-slate-900">Recent Reports</h2>
          {reports.length === 0 ? (
            <p className="text-sm text-slate-500">No reports yet.</p>
          ) : (
            <ul className="flex flex-col gap-2">
              {reports.map((r) => (
                <li key={r.id} className="rounded-lg bg-slate-50 px-3 py-2">
                  <p className="text-sm font-medium text-slate-900">{r.name}</p>
                  <p className="mt-0.5 line-clamp-2 text-xs text-slate-500">{r.message}</p>
                </li>
              ))}
            </ul>
          )}
          <Link href="/admin/reports" className="mt-3 inline-block text-sm font-semibold text-indigo-600 hover:text-indigo-700">
            View all reports →
          </Link>
        </div>
      </div>
    </div>
  );
}

function Card({ label, value, tone }: { label: string; value: string | number; tone: string }) {
  const colors: Record<string, string> = {
    green: "bg-emerald-50 text-emerald-700",
    red: "bg-rose-50 text-rose-700",
    blue: "bg-blue-50 text-blue-700",
    purple: "bg-violet-50 text-violet-700",
  };
  return (
    <div className={`rounded-2xl p-5 ${colors[tone] ?? "bg-slate-50 text-slate-700"}`}>
      <p className="text-sm font-medium opacity-75">{label}</p>
      <p className="mt-1 text-3xl font-bold">{value}</p>
    </div>
  );
}
