"use client";

import { useEffect } from "react";

import { isValidLocale } from "@/i18n/config";

const RTL_LOCALES = new Set(["ar"]);

export default function LocaleAttribute({ locale }: { locale: string }) {
  useEffect(() => {
    const resolved = isValidLocale(locale) ? locale : "en";
    document.documentElement.lang = resolved;
    document.documentElement.dir = RTL_LOCALES.has(resolved) ? "rtl" : "ltr";
  }, [locale]);

  return null;
}