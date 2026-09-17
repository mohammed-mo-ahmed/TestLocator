"use client";

import { useTranslations } from "next-intl";

import { Badge } from "@/components/ui/primitives";
import { cn } from "@/lib/cx";
import type { TestCenterWithDistance } from "@/lib/types";

export interface DateLabel {
  date: string;
  label: string;
}

export default function TestCenterList({
  items,
  totalOnMap,
  dateLabels,
  activeCode,
  onSelect,
}: {
  items: TestCenterWithDistance[];
  totalOnMap: number;
  dateLabels: DateLabel[];
  activeCode: string | null;
  onSelect: (code: string) => void;
}) {
  const t = useTranslations("results");

  return (
    <div className="flex max-h-[560px] flex-col gap-3 overflow-y-auto pe-1">
      {items.map((center, index) => {
        const isActive = activeCode === center.code;
        const hasSeats =
          dateLabels.length === 0 ||
          Object.values(center.availability).some((seats) => seats > 0);

        return (
          <div
            key={center.code}
            className={cn(
              "tc-card-shadow flex flex-col gap-3 rounded-2xl border bg-white p-4 transition",
              isActive
                ? "border-indigo-400 ring-2 ring-indigo-100"
                : "border-slate-200 hover:border-indigo-200 hover:shadow-lg"
            )}
          >
            <button
              type="button"
              onClick={() => onSelect(center.code)}
              className="flex flex-col gap-3 text-start focus:outline-none"
            >
              <span className="flex items-start justify-between gap-3">
                <span className="flex min-w-0 items-start gap-3">
                  <span
                    className={cn(
                      "mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-full text-xs font-bold",
                      hasSeats ? "bg-indigo-600 text-white" : "bg-slate-200 text-slate-600"
                    )}
                  >
                    {index + 1}
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate font-semibold text-slate-900">
                      {center.name}
                    </span>
                    <span className="mt-0.5 block truncate text-sm text-slate-500">
                      {center.city ? `${center.city} · ${center.address}` : center.address}
                    </span>
                  </span>
                </span>
                {center.distanceKm != null ? (
                  <span className="shrink-0 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
                    {t("distanceAway", { km: center.distanceKm })}
                  </span>
                ) : null}
              </span>

              {dateLabels.length > 0 ? (
                <span className="flex flex-wrap gap-1.5">
                  {dateLabels.map(({ date, label }) => {
                    const seats = center.availability[date] ?? 0;
                    const available = seats > 0;
                    return (
                      <span
                        key={date}
                        className={cn(
                          "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs",
                          available
                            ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                            : "border-rose-200 bg-rose-50 text-rose-600"
                        )}
                      >
                        <span
                          className={cn(
                            "h-1.5 w-1.5 rounded-full",
                            available ? "bg-emerald-500" : "bg-rose-500"
                          )}
                        />
                        {label} · {t(available ? "available" : "unavailable")}
                      </span>
                    );
                  })}
                </span>
              ) : null}
            </button>

            <a
              href={center.link}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex w-fit items-center gap-1.5 text-sm font-semibold text-indigo-600 hover:text-indigo-700"
            >
              <svg
                width="15"
                height="15"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 0 1 16 0Z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
              {t("openInMaps")}
            </a>
          </div>
        );
      })}

      {totalOnMap > 0 ? (
        <Badge tone="neutral" className="mx-auto">
          {t("moreOnMap", { count: totalOnMap })}
        </Badge>
      ) : null}
    </div>
  );
}