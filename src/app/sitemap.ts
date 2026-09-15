import type { MetadataRoute } from "next";

import { localizedPath, siteUrl } from "@/lib/seo";
import { locales } from "@/i18n/config";

export const dynamic = "force-static";

const PAGES = [
  { path: "/", priority: 1.0, changeFrequency: "weekly" },
  { path: "/find", priority: 0.9, changeFrequency: "weekly" },
] as const satisfies ReadonlyArray<{
  path: string;
  priority: number;
  changeFrequency: "weekly";
}>;

export default function sitemap(): MetadataRoute.Sitemap {
  const base = siteUrl();

  return PAGES.flatMap((page) =>
    locales.map((locale) => ({
      url: `${base}${localizedPath(locale, page.path)}`,
      lastModified: new Date(),
      changeFrequency: page.changeFrequency,
      priority: page.priority,
    })),
  );
}
