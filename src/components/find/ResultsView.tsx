"use client";

import dynamic from "next/dynamic";
import { useLocale, useTranslations } from "next-intl";
import { useCallback, useEffect, useMemo, useState } from "react";

import TestCenterList from "@/components/find/TestCenterList";
import ApGuideDialog from "@/components/find/ApGuideDialog";
import { Spinner } from "@/components/ui/primitives";
import { fetchAvailability, fetchCenters, fetchTestDates } from "@/lib/data-service";
import { formatKm, haversineKm } from "@/lib/haversine";
import { cn } from "@/lib/cx";
import type {
  TestCenter,
  TestCenterWithDistance,
  TestInfo,
  UserLocation,
} from "@/lib/types";

const TestCenterMap = dynamic(
  () => import("@/components/find/TestCenterMap"),
  { ssr: false, loading: () => <MapFallback /> }
);

const NEAREST_SHOWN = 20;

function MapFallback() {
  const t = useTranslations("results");
  return (
    <div className="grid h-[420px] w-full place-items-center rounded-2xl border border-slate-200 bg-slate-100">
      <Spinner label={t("loadData")} />
    </div>
  );
}

export default function ResultsView({
  test,
  location = null,
  focusCenter = null,
  onBack,
  onRestart,
}: {
  test: TestInfo;
  location?: UserLocation | null;
  focusCenter?: TestCenter | null;
  onBack: () => void;
  onRestart: () => void;
}) {
  const t = useTranslations("results");
  const locale = useLocale();

  const [items, setItems] = useState<TestCenterWithDistance[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCode, setActiveCode] = useState<string | null>(null);
  const [testDates, setTestDates] = useState<string[]>(test.dates);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      setLoading(true);
      const dates = await fetchTestDates(test.code);
      const centers = await fetchCenters(test.code);
      const availability = await fetchAvailability(
        test,
        centers.map((center) => center.code)
      );

      const enriched = centers
        .map((center) => ({
          ...center,
          distanceKm: location
            ? formatKm(haversineKm(location, center))
            : undefined,
          availability: availability[center.code] ?? {},
        }))
        .sort((a, b) => {
          if (focusCenter) {
            if (a.code === focusCenter.code) return -1;
            if (b.code === focusCenter.code) return 1;
          }
          if (location) {
            return (a.distanceKm ?? 0) - (b.distanceKm ?? 0);
          }
          return 0;
        });

      if (!cancelled) {
        setTestDates(dates);
        setItems(enriched);
        setLoading(false);
        setActiveCode(focusCenter?.code ?? enriched[0]?.code ?? null);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [test, location, focusCenter]);

  const dateLabels = useMemo(() => {
    const formatter = new Intl.DateTimeFormat(locale, {
      month: "short",
      day: "numeric",
    });
    return testDates.map((date) => ({
      date,
      label: formatter.format(new Date(`${date}T00:00:00`)),
    }));
  }, [testDates, locale]);

  const handleSelect = useCallback((code: string) => {
    setActiveCode(code);
  }, []);

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            {t("title")}
          </h1>
          <p className="mt-2 flex items-center gap-1.5 text-sm text-slate-500">
            {t("subtitle", { test: test.code.toUpperCase() })}
            {location ? (
              <>
                <span className="mx-1 text-slate-300">·</span>
                <span className="inline-flex min-w-0 items-center gap-1 truncate font-medium text-slate-600">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
                    <path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 0 1 16 0Z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                  {location.label}
                </span>
              </>
            ) : focusCenter ? (
              <>
                <span className="mx-1 text-slate-300">·</span>
                <span className="truncate font-medium text-slate-600">{focusCenter.name}</span>
              </>
            ) : null}
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-2.5">
          <button
            type="button"
            onClick={onBack}
            className="h-11 rounded-full border border-slate-300 bg-white px-5 text-sm font-semibold text-slate-700 transition hover:border-indigo-300 hover:text-indigo-700"
          >
            {t("backToCenter")}
          </button>
          <button
            type="button"
            onClick={onRestart}
            className="h-11 rounded-full bg-indigo-600 px-5 text-sm font-semibold text-white transition hover:bg-indigo-700"
          >
            {t("changeSelection")}
          </button>
        </div>
      </div>

      {loading ? (
        <div className="grid h-[420px] w-full place-items-center rounded-2xl border border-slate-200 bg-slate-100">
          <Spinner label={t("loadData")} />
        </div>
      ) : items.length === 0 ? (
        <div className="grid h-[320px] w-full place-items-center rounded-2xl border border-slate-200 bg-white">
          <p className="text-slate-500">{t("empty")}</p>
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          {test.code === "ap" ? <ApGuideDialog /> : null}

          <div className="grid gap-6 lg:grid-cols-[1.25fr_1fr]">
          <div className="map-shell h-[420px] shrink-0 overflow-hidden rounded-2xl border border-slate-200 lg:h-[560px] lg:sticky lg:top-20" dir="ltr">
            <TestCenterMap
              centers={items}
              dateLabels={dateLabels}
              userLocation={location}
              focusCenter={focusCenter}
              activeCode={activeCode}
              onSelect={handleSelect}
            />
          </div>

          <div className={cn("min-w-0 flex-col gap-4", loading ? "hidden" : "flex")}>
            <div className="flex items-baseline justify-between gap-4">
              <h2 className="text-lg font-semibold text-slate-900">
                {focusCenter ? t("centersTitle") : t("nearestTitle")}
              </h2>
              <span className="text-sm text-slate-500">
                {t("showing", { count: Math.min(items.length, NEAREST_SHOWN) })}
              </span>
            </div>

            <TestCenterList
              items={items.slice(0, NEAREST_SHOWN)}
              totalOnMap={Math.max(0, items.length - NEAREST_SHOWN)}
              dateLabels={dateLabels}
              activeCode={activeCode}
              onSelect={handleSelect}
            />
          </div>
          </div>
        </div>
      )}
    </div>
  );
}