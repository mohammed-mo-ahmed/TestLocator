import Link from "next/link";

import { requireAuth, signOut } from "@/app/admin/actions";
import { getReports } from "@/lib/admin-service";

export const dynamic = "force-dynamic";

export default async function AdminReportsPage() {
  await requireAuth();
  const reports = await getReports(200);

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <AdminHeader />

      <h1 className="mb-6 text-2xl font-bold text-slate-900">Problem Reports</h1>

      {reports.length === 0 ? (
        <p className="text-sm text-slate-500">No reports yet.</p>
      ) : (
        <div className="flex flex-col gap-3">
          {reports.map((r) => (
            <div key={r.id} className="rounded-2xl border border-slate-200 bg-white p-5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="font-semibold text-slate-900">{r.name}</p>
                <p className="text-xs text-slate-500">
                  {new Date(r.created_at).toLocaleString()}
                </p>
              </div>
              {r.contact ? (
                <p className="mt-1 text-xs text-slate-500">Contact: {r.contact}</p>
              ) : null}
              <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-slate-700">
                {r.message}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

async function AdminHeader() {
  return (
    <div className="mb-8 flex items-center justify-between">
      <Link href="/admin" className="h-9 rounded-lg border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-700 hover:bg-slate-50">
        ← Dashboard
      </Link>
      <div className="flex items-center gap-3">
        <Link href="/admin/centers" className="h-9 rounded-lg border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-700 hover:bg-slate-50">
          Centers
        </Link>
        <Link href="/admin/months" className="h-9 rounded-lg border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-700 hover:bg-slate-50">
          Months
        </Link>
        <form action={signOut}>
          <button type="submit" className="h-9 rounded-lg border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-700 hover:bg-slate-50">
            Sign out
          </button>
        </form>
      </div>
    </div>
  );
}