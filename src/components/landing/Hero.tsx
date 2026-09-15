"use client";

import { motion } from "framer-motion";
import { useTranslations } from "next-intl";

import { buttonClass } from "@/components/ui/primitives";
import { Link } from "@/i18n/navigation";

export default function Hero() {
  const t = useTranslations("landing");

  return (
    <section className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 -z-10" aria-hidden="true">
        <div className="absolute -top-32 left-1/2 h-[520px] w-[780px] -translate-x-1/2 rounded-full bg-gradient-to-br from-indigo-300/40 via-violet-300/30 to-sky-300/30 blur-3xl" />
        <div className="absolute bottom-0 right-[-10%] h-[300px] w-[420px] rounded-full bg-gradient-to-tr from-violet-200/40 to-transparent blur-3xl" />
      </div>

      <div className="mx-auto flex max-w-6xl flex-col items-center px-4 pb-16 pt-16 text-center sm:px-6 sm:pt-24 sm:pb-24">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <h1 className="mx-auto mt-6 max-w-3xl text-4xl font-bold leading-tight tracking-tight text-slate-900 sm:text-6xl">
            {t("title")}
          </h1>

          <p className="mx-auto mt-5 max-w-2xl text-lg leading-relaxed text-slate-600">
            {t("subtitle")}
          </p>

          <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/find"
              className="group inline-flex h-12 items-center gap-2 rounded-full bg-indigo-600 px-7 text-base font-semibold text-white shadow-lg shadow-indigo-600/20 transition hover:bg-indigo-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-300 tc-pulse"
            >
              {t("cta")}
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="transition-transform group-hover:translate-x-0.5 rtl:rotate-180"
                aria-hidden="true"
              >
                <path d="M5 12h14" />
                <path d="m12 5 7 7-7 7" />
              </svg>
            </Link>
            <a href="#how" className={buttonClass("secondary")}>
              {t("secondaryCta")}
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
}