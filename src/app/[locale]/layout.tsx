import type { Metadata } from "next";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";

import Footer from "@/components/Footer";
import Header from "@/components/header/Header";
import LocaleAttribute from "@/components/header/LocaleAttribute";
import { isValidLocale, locales } from "@/i18n/config";
import {
  alternatesFor,
  localizedPath,
  siteUrl,
} from "@/lib/seo";

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

const PAGES = ["/", "/find"] as const;

export async function generateMetadata({
  params,
}: LayoutProps<"/[locale]">): Promise<Metadata> {
  const { locale } = await params;
  if (!isValidLocale(locale)) notFound();

  const t = await getTranslations({ locale, namespace: "meta" });
  const base = siteUrl();

  const alternates = alternatesFor("/");

  return {
    metadataBase: new URL(base),
    title: {
      default: t("title"),
      template: "%s · TestLocator",
    },
    description: t("description"),
    alternates: {
      canonical: `${base}${localizedPath(locale, "/")}`,
      languages: alternates,
    },
    openGraph: {
      type: "website",
      locale: locale === "en" ? "en_US" : locale,
      url: `${base}${localizedPath(locale, "/")}`,
      title: t("title"),
      description: t("description"),
      siteName: "TestLocator",
      images: [
        {
          url: `${base}/seo/og.png`,
          width: 1200,
          height: 630,
          alt: "TestLocator — find your nearest test center",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: t("title"),
      description: t("description"),
      images: [`${base}/seo/og.png`],
    },
    keywords: [
      "test center",
      "test locator",
      "nearest test center",
      "SAT test center",
      "check seat availability",
    ],
    alternatesCanonicalUsedMarker: undefined,
  } as Metadata;
}

export default async function LocaleLayout({
  children,
  params,
}: LayoutProps<"/[locale]">) {
  const { locale } = await params;

  if (!isValidLocale(locale)) notFound();

  setRequestLocale(locale);

  const messages = await getMessages();

  return (
    <NextIntlClientProvider messages={messages}>
      <LocaleAttribute locale={locale} />
      <Header />
      <main className="flex flex-1 flex-col">{children}</main>
      <Footer />
    </NextIntlClientProvider>
  );
}
