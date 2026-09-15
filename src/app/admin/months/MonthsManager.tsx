"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { addTestMonth, deleteTestMonth } from "@/app/admin/actions";

export default function MonthsManager({ dates, testCode }: { dates: string[]; testCode: string }) {
  const router = useRouter();
  const [value, setValue] = useState("");
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!value) return;

    if (dates.includes(value)) {
      setError("This month is already added.");
      return;
    }

    startTransition(async () => {
      try {
        await addTestMonth(testCode, value);
        setValue("");
        router.refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to add month.");
      }
    });
  }

  function handleDelete(date: string) {
    startTransition(async () => {
      try {
        await deleteTestMonth(testCode, date);
        router.refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to delete month.");
      }
    });
  }

  return (
    <>
      <form onSubmit={handleAdd} className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end">
        <div className="flex-1">
          <label htmlFor="month" className="mb-1.5 block text-sm font-semibold text-slate-700">
            Add a new month (date)
          </label>
          <input
            id="month"
            type="date"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            className="h-11 w-full rounded-xl border border-slate-300 bg-white px-4 text-sm outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
          />
        </div>
        <button
          type="submit"
          disabled={isPending || !value}
          className="h-11 rounded-xl bg-indigo-600 px-6 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:opacity-50"
        >
          {isPending ? "Adding…" : "Add month"}
        </button>
      </form>

      {error ? (
        <p className="mb-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error}
        </p>
      ) : null}

      {dates.length === 0 ? (
        <p className="text-sm text-slate-500">No months configured yet.</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {dates.map((date) => (
            <li
              key={date}
              className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-5 py-4"
            >
              <span className="text-sm font-medium text-slate-900">{date}</span>
              <button
                type="button"
                disabled={isPending}
                onClick={() => handleDelete(date)}
                className="h-9 rounded-lg border border-rose-300 bg-rose-50 px-4 text-sm font-semibold text-rose-700 transition hover:bg-rose-100 disabled:opacity-50"
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
      )}

      <p className="mt-4 text-xs text-slate-500">
        Adding a month adds a column to test_centers (default غير متاح for every
        center), like a new month in the Excel sheet. Deleting a month drops
        that column from all centers.
      </p>
    </>
  );
}