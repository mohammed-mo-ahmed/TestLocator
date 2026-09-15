"use client";

import { useTranslations } from "next-intl";
import { FormEvent, useState } from "react";

import { buttonClass, Spinner } from "@/components/ui/primitives";
import { reverseGeocode, geocodePlace, GeocodingError } from "@/lib/geocoding";
import { cn } from "@/lib/cx";
import type { UserLocation } from "@/lib/types";

type GpsState = "idle" | "locating" | "success" | "error";
type SearchState = "idle" | "searching" | "error" | "empty";

export default function LocationStep({
  onBack,
  onLocated,
}: {
  onBack: () => void;
  onLocated: (location: UserLocation) => void;
}) {
  const t = useTranslations("location");
  const tCommon = useTranslations("common");

  const [gps, setGps] = useState<GpsState>("idle");
  const [search, setSearch] = useState<SearchState>("idle");
  const [query, setQuery] = useState<string>("");
  const [searchError, setSearchError] = useState<string | null>(null);

  function useMyLocation() {
    if (!navigator.geolocation) {
      setGps("error");
      setSearchError(t("gpsError"));
      return;
    }

    setGps("locating");
    setSearchError(null);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        const reverseLabel = await reverseGeocode(latitude, longitude);
        setGps("success");
        onLocated({
          lat: latitude,
          lng: longitude,
          label: reverseLabel ?? "GPS",
        });
      },
      (error) => {
        setGps("error");
        setSearchError(
          error.code === error.PERMISSION_DENIED ? t("gpsDenied") : t("gpsError")
        );
      },
      { enableHighAccuracy: true, timeout: 12000, maximumAge: 30000 }
    );
  }

  async function handleSearch(event: FormEvent) {
    event.preventDefault();
    if (!query.trim()) return;

    setSearch("searching");
    setSearchError(null);

    try {
      const result = await geocodePlace(query);
      if (!result) {
        setSearch("empty");
        setSearchError(t("noResults"));
        setSearch("idle");
        return;
      }
      setSearch("idle");
      onLocated({ lat: result.lat, lng: result.lng, label: result.label });
    } catch (error) {
      setSearch("error");
      if (error instanceof GeocodingError && error.status === 429) {
        setSearchError(t("searchError"));
      } else {
        setSearchError(t("searchError"));
      }
    }
  }

  return (
    <div className="mx-auto max-w-3xl">
      <div className="text-center">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
          {t("title")}
        </h1>
        <p className="mt-3 text-slate-600">{t("subtitle")}</p>
      </div>

      <div className="mt-10 grid gap-5 sm:grid-cols-2">
        <button
          type="button"
          onClick={useMyLocation}
          disabled={gps === "locating"}
          className="tc-card-shadow flex flex-col items-start gap-4 rounded-2xl border border-slate-200 bg-white p-6 text-start transition hover:-translate-y-0.5 hover:border-indigo-300 hover:shadow-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-300 disabled:cursor-wait"
        >
          <span className="grid h-12 w-12 place-items-center rounded-xl bg-emerald-50 text-emerald-600">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 0 1 16 0Z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
          </span>
          <span className="block">
            <span className="block text-lg font-semibold text-slate-900">{t("useLocation")}</span>
            <span className="mt-1 block text-sm text-slate-600">{t("useLocationDesc")}</span>
          </span>
          {gps === "locating" ? (
            <span className="text-sm">
              <Spinner label={t("locating")} />
            </span>
          ) : null}
        </button>

        <form
          onSubmit={handleSearch}
          className="tc-card-shadow flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-6"
        >
          <span className="flex items-start justify-between">
            <span className="grid h-12 w-12 place-items-center rounded-xl bg-indigo-50 text-indigo-600">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.3-4.3" />
              </svg>
            </span>
          </span>

          <span className="block">
            <span className="block text-lg font-semibold text-slate-900">{t("enterLocation")}</span>
            <span className="mt-1 block text-sm text-slate-600">{t("enterLocationDesc")}</span>
          </span>

          <label className="block">
            <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">
              {t("inputLabel")}
            </span>
            <input
              type="text"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={t("inputPlaceholder")}
              className="h-11 w-full rounded-xl border border-slate-300 bg-white px-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
            />
          </label>

          <button
            type="submit"
            disabled={search === "searching" || !query.trim()}
            className={cn(
              buttonClass("primary", "w-full disabled:cursor-not-allowed disabled:opacity-60")
            )}
          >
            {search === "searching" ? t("searching") : t("search")}
          </button>
        </form>
      </div>

      {searchError ? (
        <div className="mt-6 flex flex-col items-center gap-3 rounded-2xl border border-rose-200 bg-rose-50 px-5 py-4 text-sm text-rose-700">
          <p className="text-center">{searchError}</p>
          {gps === "error" ? (
            <button type="button" onClick={useMyLocation} className={buttonClass("secondary")}>
              {tCommon("retry")}
            </button>
          ) : null}
        </div>
      ) : null}

      <div className="mt-8 flex justify-center">
        <button type="button" onClick={onBack} className={buttonClass("ghost")}>
          {tCommon("back")}
        </button>
      </div>
    </div>
  );
}