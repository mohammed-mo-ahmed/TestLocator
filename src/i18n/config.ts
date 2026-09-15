export const locales = [
  "en",
  "es",
  "fr",
  "de",
  "zh",
  "ja",
  "ko",
  "ar",
  "pt",
  "hi",
] as const;

export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "en";

export function isValidLocale(value: string): value is Locale {
  return (locales as readonly string[]).includes(value);
}

export const localeNames: Record<Locale, string> = {
  en: "English",
  es: "Español",
  fr: "Français",
  de: "Deutsch",
  zh: "中文",
  ja: "日本語",
  ko: "한국어",
  ar: "العربية",
  pt: "Português",
  hi: "हिन्दी",
};