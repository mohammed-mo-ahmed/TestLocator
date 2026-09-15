import { getTranslations } from "next-intl/server";
import Image from "next/image";

import { Link } from "@/i18n/navigation";
import LanguageSwitcher from "./LanguageSwitcher";

export default async function Header() {
  const t = await getTranslations("header");

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/70 bg-white/80 backdrop-blur">
      <div className="mx-auto flex h-20 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link
          href="/"
          className="flex min-w-0 items-center"
          aria-label={t("brand")}
        >
          <Image
            src="/logo.png"
            alt={t("brand")}
            width={1774}
            height={887}
            priority
            className="h-8 w-auto"
          />
        </Link>

        <div className="flex items-center gap-2.5">
          <LanguageSwitcher />
          <Link
            href="/find"
            className="inline-flex h-10 items-center gap-1.5 rounded-full bg-indigo-600 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-300"
          >
            {t("navFind")}
          </Link>
        </div>
      </div>
    </header>
  );
}