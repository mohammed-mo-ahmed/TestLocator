import Link from "next/link";

import { requireAuth, signOut } from "@/app/admin/actions";
import AddCenterForm from "@/app/admin/centers/AddCenterForm";
import CentersList from "@/app/admin/centers/CentersList";
import { getAllCenters, getTestDates } from "@/lib/admin-service";

export const dynamic = "force-dynamic";

const TEST_OPTIONS = [
  { code: "sat", label: "SAT" },
  { code: "ap", label: "AP" },
];

export default async function AdminCentersPage({
  searchParams,
}: {
  searchParams: Promise<{ test?: string }>;
}) {
  await requireAuth();
  const { test } = await searchParams;
  const testCode = test === "ap" ? "ap" : "sat";
  const dates = await getTestDates(testCode);
  const centers = await getAllCenters(dates, testCode);
  const rows = centers.map((c) => ({
    code: c.code,
    name: c.name,
    address: c.address,
    city: c.city,
    country: c.country,
    test: c.test,
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

      <div className="mb-6 flex items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-slate-900">Test Centers</h1>
        <div className="inline-flex rounded-full border border-slate-200 bg-white p-1">
          {TEST_OPTIONS.map((opt) => {
            const active = testCode === opt.code;
            return (
              <Link
                key={opt.code}
                href={`/admin/centers?test=${opt.code}`}
                className={`rounded-full px-4 py-1.5 text-sm font-semibold transition ${
                  active ? "bg-indigo-600 text-white" : "text-slate-600 hover:text-indigo-600"
                }`}
              >
                {opt.label}
              </Link>
            );
          })}
        </div>
      </div>

      <AddCenterForm dates={dates} testCode={testCode} />
      <CentersList centers={rows} dates={dates} testCode={testCode} />
    </div>
  );
}