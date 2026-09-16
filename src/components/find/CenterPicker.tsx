"use client";

import { useLocale, useTranslations } from "next-intl";
import { useEffect, useMemo, useState } from "react";

import SearchableDropdown, {
  type SearchableOption,
} from "@/components/find/SearchableDropdown";
import { buttonClass, Spinner } from "@/components/ui/primitives";
import { fetchCenters } from "@/lib/data-service";
import { cn } from "@/lib/cx";
import type { TestCenter, TestCenterCountry } from "@/lib/types";

const FLAG_EMOJI: Record<string, string> = {};

function getFlagEmoji(countryCode: string): string {
  const code = countryCode.toUpperCase();
  if (FLAG_EMOJI[code]) return FLAG_EMOJI[code];
  try {
    const emoji = String.fromCodePoint(
      ...[...code].map((c) => 0x1f1e6 - 65 + c.charCodeAt(0))
    );
    FLAG_EMOJI[code] = emoji;
    return emoji;
  } catch {
    return "";
  }
}

function getCountryName(locale: string, country: TestCenterCountry): string {
  try {
    const names = new Intl.DisplayNames([locale], { type: "region" });
    return names.of(country.toUpperCase()) ?? country.toUpperCase();
  } catch {
    return country.toUpperCase();
  }
}

export default function CenterPicker({
  onConfirm,
  onBack,
}: {
  onConfirm: (center: TestCenter) => void;
  onBack: () => void;
}) {
  const t = useTranslations("center");
  const tCommon = useTranslations("common");
  const locale = useLocale();

  const [centers, setCenters] = useState<TestCenter[]>([]);
  const [loading, setLoading] = useState(true);
  const [countryCode, setCountryCode] = useState<TestCenterCountry | null>(null);
  const [centerCode, setCenterCode] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const all = await fetchCenters();
      if (!cancelled) {
        setCenters(all);
        setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const countryOptions = useMemo(() => {
    const present = new Set(centers.map((center) => center.country));
    return Array.from(present)
      .sort()
      .map(
        (code): SearchableOption => ({
          value: code,
          label: getCountryName(locale, code),
          icon: getFlagEmoji(code),
        })
      );
  }, [centers, locale]);

  const centerOptions = useMemo((): SearchableOption[] => {
    if (!countryCode) return [];
    return centers
      .filter((center) => center.country === countryCode)
      .map(
        (center): SearchableOption => ({
          value: center.code,
          label: center.name,
          secondary: center.city
            ? `${center.city} · ${center.address}`
            : center.address,
        })
      );
  }, [centers, countryCode]);

  const selectedCenter =
    centerCode
      ? centers.find((c) => c.code === centerCode) ?? null
      : null;

  return (
    <div className="mx-auto max-w-3xl">
      <div className="text-center">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
          {t("title")}
        </h1>
        <p className="mt-3 text-slate-600">{t("subtitle")}</p>
      </div>

      {loading ? (
        <div className="tc-card-shadow mx-auto mt-10 grid h-64 w-full max-w-xl place-items-center rounded-2xl border border-slate-200 bg-white">
          <Spinner label={tCommon("loading")} />
        </div>
      ) : (
        <div className="mx-auto mt-10 w-full max-w-xl space-y-8">
          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              {t("countryLabel")}
            </label>
            <SearchableDropdown
              options={countryOptions}
              value={countryCode}
              onSelect={(code) => {
                setCountryCode(code as TestCenterCountry);
                setCenterCode(null);
              }}
              placeholder={t("countryPlaceholder")}
              searchPlaceholder={t("searchPlaceholder")}
              emptyText={t("noneFound")}
              disabled={false}
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              {t("centerLabel")}
            </label>
            <SearchableDropdown
              options={centerOptions}
              value={centerCode}
              onSelect={setCenterCode}
              placeholder={
                countryCode ? t("centerPlaceholder") : t("selectCountryFirst")
              }
              searchPlaceholder={t("searchPlaceholder")}
              emptyText={t("noneFound")}
              disabled={!countryCode}
            />
          </div>

          <div className="flex items-center justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={onBack}
              className={buttonClass("ghost")}
            >
              {tCommon("back")}
            </button>
            <button
              type="button"
              disabled={!selectedCenter}
              onClick={() => {
                if (selectedCenter) onConfirm(selectedCenter);
              }}
              className={cn(
                buttonClass("primary"),
                "disabled:cursor-not-allowed disabled:opacity-50"
              )}
            >
              {t("confirm")}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}