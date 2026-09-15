"use client";

import { useLocale } from "next-intl";
import { ChangeEvent } from "react";

import { localeNames, locales, type Locale } from "@/i18n/config";
import { usePathname, useRouter } from "@/i18n/navigation";

export default function LanguageSwitcher() {
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();

  function handleChange(event: ChangeEvent<HTMLSelectElement>) {
    const next = event.target.value as Locale;
    router.replace(pathname, { locale: next });
  }

  return (
    <label className="relative">
      <span className="sr-only">Language</span>
      <select
        value={locale}
        onChange={handleChange}
        className="locale-switcher h-10 cursor-pointer rounded-full border border-slate-200 bg-white pl-4 text-sm font-medium text-slate-700 shadow-sm outline-none transition hover:border-indigo-300 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
        aria-label="Select language"
      >
        {locales.map((code) => (
          <option key={code} value={code}>
            {localeNames[code]}
          </option>
        ))}
      </select>
    </label>
  );
}