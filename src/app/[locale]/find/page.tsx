import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import { alternatesFor, localizedPath, siteUrl } from "@/lib/seo";

import TestFinder from "@/components/find/TestFinder";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta" });
  const base = siteUrl();

  return {
    title: t("find.title", { fallback: "Find a test center" }),
    description: t("find.description", { fallback: t("description") }),
    alternates: {
      canonical: `${base}${localizedPath(locale, "/find")}`,
      languages: alternatesFor("/find"),
    },
    openGraph: {
      type: "website",
      url: `${base}${localizedPath(locale, "/find")}`,
      title: t("find.title", { fallback: "Find a test center" }),
      description: t("find.description", { fallback: t("description") }),
      siteName: "TestLocator",
    },
  };
}

export default function FindPage() {
  return <TestFinder />;
}
