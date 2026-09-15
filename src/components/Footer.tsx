import { getTranslations } from "next-intl/server";

export default async function Footer() {
  const t = await getTranslations("footer");

  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-center gap-1.5 px-4 py-8 text-center text-sm text-slate-600 sm:px-6">
        <span>{t("charity")}</span>
        <a
          href="https://linktr.ee/mo.alqabbni"
          target="_blank"
          rel="noopener noreferrer"
          className="group inline-flex items-center gap-1 font-semibold text-indigo-600 hover:text-indigo-700"
        >
          {t("name")}
          <svg
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
            aria-hidden="true"
          >
            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
            <polyline points="15 3 21 3 21 9" />
            <line x1="10" y1="14" x2="21" y2="3" />
          </svg>
        </a>
      </div>
    </footer>
  );
}