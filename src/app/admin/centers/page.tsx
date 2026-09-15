import Link from "next/link";

import { requireAuth, signOut } from "@/app/admin/actions";
import CentersList from "@/app/admin/centers/CentersList";
import { getAllCenters, getTestDates } from "@/lib/admin-service";

export const dynamic = "force-dynamic";

export default async function AdminCentersPage() {
  await requireAuth();
  const dates = await getTestDates("sat");
  const centers = await getAllCenters(dates);
  const rows = centers.map((c) => ({
    code: c.code,
    name: c.name,
    address: c.address,
    city: c.city,
    country: c.country,
    availability: c.availability,
  }));

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <div className="mb-8 flex items-center justify-between">
        <Link href="/admin" className="h-9 rounded-lg border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-700 hover:bg-slate-50">
          ← Dashboard
        </Link>
        <div className="flex items-center gap-3">
          <Link href="/admin/months" className="h-9 rounded-lg border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-700 hover:bg-slate-50">
            Months
          </Link>
          <Link href="/admin/reports" className="h-9 rounded-lg border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-700 hover:bg-slate-50">
            Reports
          </Link>
          <form action={signOut}>
            <button type="submit" className="h-9 rounded-lg border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-700 hover:bg-slate-50">
              Sign out
            </button>
          </form>
        </div>
      </div>

      <h1 className="mb-6 text-2xl font-bold text-slate-900">Test Centers</h1>
      <CentersList centers={rows} dates={dates} testCode="sat" />
    </div>
  );
}