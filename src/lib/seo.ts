import { defaultLocale, locales } from "@/i18n/config";

const DEPLOYED = process.env.VERCEL_PROJECT_PRODUCTION_URL ?? process.env.VERCEL_URL ?? "";

export function siteUrl(): string {
  const fromEnv = process.env.NEXT_PUBLIC_SITE_URL;
  if (fromEnv && fromEnv.trim() !== "") return stripTrailingSlash(fromEnv);
  if (DEPLOYED.trim() !== "") {
    const host = stripTrailingSlash(DEPLOYED);
    return host.startsWith("http") ? host : `https://${host}`;
  }
  return "http://localhost:3000";
}

export function absoluteUrl(pathname: string): string {
  return `${siteUrl()}${stripTrailingSlash(pathname)}`;
}

function stripTrailingSlash(value: string): string {
  return value.endsWith("/") ? value.slice(0, -1) : value;
}

export function localePathPrefix(locale: (typeof locales)[number]): string {
  return locale === defaultLocale ? "" : `/${locale}`;
}

export function localizedPath(locale: (typeof locales)[number], pathname: string): string {
  const clean = pathname === "/" || pathname === "" ? "" : stripTrailingSlash(pathname);
  return `${localePathPrefix(locale)}${clean}` || "/";
}

export function alternatesFor(pathname: string): Record<string, string> {
  const languages: Record<string, string> = {};
  for (const locale of locales) {
    languages[locale] = absoluteUrl(localizedPath(locale, pathname));
  }
  languages["x-default"] = absoluteUrl(localizedPath(defaultLocale, pathname));
  return languages;
}
