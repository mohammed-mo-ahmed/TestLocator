"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { addTestCenter, resolveGpsLink } from "@/app/admin/actions";
import { COUNTRIES } from "@/lib/countries";

function parseGpsLinkLocal(link: string): { lat: number; lng: number } | null {
  try {
    const url = new URL(link);

    const qMatch = url.search.match(/[?&]q=([-\d.]+),([-\d.]+)/);
    if (qMatch) return { lat: parseFloat(qMatch[1]), lng: parseFloat(qMatch[2]) };

    const atMatch = url.pathname.match(/@([-\d.]+),([-\d.]+)/);
    if (atMatch) return { lat: parseFloat(atMatch[1]), lng: parseFloat(atMatch[2]) };

    const pathQ = url.pathname.match(/\/([-\d.]+),([-\d.]+)/);
    if (pathQ) return { lat: parseFloat(pathQ[1]), lng: parseFloat(pathQ[2]) };

    const hashMatch = url.hash.match(/([-\d.]+),([-\d.]+)/);
    if (hashMatch) return { lat: parseFloat(hashMatch[1]), lng: parseFloat(hashMatch[2]) };

    return null;
  } catch {
    const plainMatch = link.match(/([-\d.]+),([-\d.]+)/);
    if (plainMatch) return { lat: parseFloat(plainMatch[1]), lng: parseFloat(plainMatch[2]) };
    return null;
  }
}

export default function AddCenterForm({
  dates,
  testCode,
}: {
  dates: string[];
  testCode: string;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);
  const [error, setError] = useState("");

  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [code, setCode] = useState("");
  const [country, setCountry] = useState("eg");
  const [gpsLink, setGpsLink] = useState("");
  const [lat, setLat] = useState("");
  const [lng, setLng] = useState("");
  const [availability, setAvailability] = useState<Record<string, number>>(() =>
    Object.fromEntries(dates.map((d) => [d, 1]))
  );

  const [loadingCoords, setLoadingCoords] = useState(false);

  async function handleExtractCoords() {
    const localCoords = parseGpsLinkLocal(gpsLink);
    if (localCoords) {
      setLat(String(localCoords.lat));
      setLng(String(localCoords.lng));
      setError("");
      return;
    }

    setLoadingCoords(true);
    setError("");
    try {
      const coords = await resolveGpsLink(gpsLink);
      if (coords) {
        setLat(String(coords.lat));
        setLng(String(coords.lng));
      } else {
        setError("Could not extract coordinates. Try a Google Maps link.");
      }
    } catch {
      setError("Failed to resolve link. Try a full Google Maps URL.");
    } finally {
      setLoadingCoords(false);
    }
  }

  function toggleMonth(date: string) {
    setAvailability((prev) => ({ ...prev, [date]: prev[date] ? 0 : 1 }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    const codeNum = parseInt(code, 10);
    if (isNaN(codeNum)) {
      setError("Code must be a valid number.");
      return;
    }
    const latNum = parseFloat(lat);
    const lngNum = parseFloat(lng);
    if (isNaN(latNum) || isNaN(lngNum)) {
      setError("Please extract valid coordinates from the GPS link.");
      return;
    }
    if (!name.trim()) {
      setError("Name is required.");
      return;
    }

    startTransition(async () => {
      try {
        await addTestCenter({
          code: codeNum,
          name: name.trim(),
          address: address.trim(),
          country,
          lat: latNum,
          lng: lngNum,
          link: gpsLink.trim(),
          test: testCode,
          availability,
        });
        setOpen(false);
        setName("");
        setAddress("");
        setCode("");
        setCountry("eg");
        setGpsLink("");
        setLat("");
        setLng("");
        setAvailability(Object.fromEntries(dates.map((d) => [d, 1])));
        router.refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to add center.");
      }
    });
  }

  const dateFormatter = (d: string) =>
    new Intl.DateTimeFormat("en", { month: "short", day: "numeric" }).format(
      new Date(`${d}T00:00:00`)
    );

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="mb-6 h-11 rounded-xl bg-indigo-600 px-6 text-sm font-semibold text-white transition hover:bg-indigo-700"
      >
        + Add {testCode.toUpperCase()} Center
      </button>
    );
  }

  return (
    <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-6">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-bold text-slate-900">Add {testCode.toUpperCase()} Test Center</h2>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="text-sm text-slate-500 hover:text-slate-700"
        >
          Cancel
        </button>
      </div>

      {error ? (
        <div className="mb-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error}
        </div>
      ) : null}

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-slate-700">Country</label>
            <select
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              className="h-11 w-full rounded-xl border border-slate-300 bg-white px-4 text-sm outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
            >
              {COUNTRIES.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-semibold text-slate-700">Code</label>
            <input
              type="number"
              required
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="e.g. 65707"
              className="h-11 w-full rounded-xl border border-slate-300 bg-white px-4 text-sm outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
            />
          </div>
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-semibold text-slate-700">Name</label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Center name"
            className="h-11 w-full rounded-xl border border-slate-300 bg-white px-4 text-sm outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-semibold text-slate-700">Address</label>
          <input
            type="text"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="Full address"
            className="h-11 w-full rounded-xl border border-slate-300 bg-white px-4 text-sm outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-semibold text-slate-700">
            Google Maps Link
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={gpsLink}
              onChange={(e) => setGpsLink(e.target.value)}
              placeholder="https://www.google.com/maps?q=..."
              className="h-11 flex-1 rounded-xl border border-slate-300 bg-white px-4 text-sm outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
            />
            <button
              type="button"
              onClick={handleExtractCoords}
              disabled={loadingCoords}
              className="h-11 shrink-0 rounded-xl border border-slate-300 bg-slate-50 px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 disabled:opacity-50"
            >
              {loadingCoords ? "Loading…" : "Extract"}
            </button>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-slate-700">Latitude</label>
            <input
              type="text"
              readOnly
              value={lat}
              placeholder="Auto-filled from link"
              className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-500"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-slate-700">Longitude</label>
            <input
              type="text"
              readOnly
              value={lng}
              placeholder="Auto-filled from link"
              className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-500"
            />
          </div>
        </div>

        {dates.length > 0 ? (
          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Availability by Month
            </label>
            <div className="flex flex-wrap gap-2">
              {dates.map((d) => {
                const isAvailable = availability[d] === 1;
                return (
                  <button
                    key={d}
                    type="button"
                    onClick={() => toggleMonth(d)}
                    className={
                      isAvailable
                        ? "inline-flex h-9 items-center gap-1.5 rounded-full border border-emerald-300 bg-emerald-50 px-3 text-xs font-semibold text-emerald-700 transition hover:bg-emerald-100"
                        : "inline-flex h-9 items-center gap-1.5 rounded-full border border-rose-300 bg-rose-50 px-3 text-xs font-semibold text-rose-700 transition hover:bg-rose-100"
                    }
                  >
                    <span
                      className={`h-1.5 w-1.5 rounded-full ${isAvailable ? "bg-emerald-500" : "bg-rose-500"}`}
                    />
                    {dateFormatter(d)}
                  </button>
                );
              })}
            </div>
            <p className="mt-1.5 text-xs text-slate-500">
              All months default to available. Click to toggle.
            </p>
          </div>
        ) : null}

        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="h-11 rounded-xl border border-slate-300 bg-white px-6 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isPending}
            className="h-11 rounded-xl bg-indigo-600 px-6 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:opacity-50"
          >
            {isPending ? "Adding…" : "Add Center"}
          </button>
        </div>
      </form>
    </div>
  );
}
