"use client";

import { motion } from "framer-motion";
import { useTranslations } from "next-intl";

import { Badge } from "@/components/ui/primitives";
import { TESTS } from "@/data/test-dates";
import { cn } from "@/lib/cx";
import type { TestInfo } from "@/lib/types";

export default function TestSelector({
  onSelect,
}: {
  onSelect: (test: TestInfo) => void;
}) {
  const t = useTranslations("tests");

  return (
    <div className="mx-auto max-w-3xl">
      <div className="text-center">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
          {t("title")}
        </h1>
        <p className="mt-3 text-slate-600">{t("subtitle")}</p>
      </div>

      <div className="mt-10 grid gap-5 sm:grid-cols-2">
        {TESTS.map((test, index) => {
          const disabled = !test.available;

          return (
            <motion.button
              key={test.code}
              type="button"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.1, ease: "easeOut" }}
              onClick={() => {
                if (!disabled) onSelect(test);
              }}
              disabled={disabled}
              aria-disabled={disabled}
              className={cn(
                "group relative flex flex-col gap-4 rounded-2xl border p-6 text-start transition",
                disabled
                  ? "cursor-not-allowed border-slate-200 bg-slate-50/80 opacity-70"
                  : "tc-card-shadow cursor-pointer border-slate-200 bg-white hover:-translate-y-0.5 hover:border-indigo-300 hover:shadow-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-300 active:translate-y-0"
              )}
            >
              <span className="flex items-start justify-between gap-3">
                <span
                  className={cn(
                    "grid h-14 w-14 place-items-center rounded-xl text-lg transition",
                    disabled ? "bg-slate-100 text-slate-500" : "bg-indigo-600 text-white group-hover:scale-105"
                  )}
                >
                  {test.code.toUpperCase()}
                </span>
                <Badge tone={disabled ? "neutral" : "green"}>{disabled ? t("comingSoon") : t("available")}</Badge>
              </span>

              <span className="block">
                <span className="block text-xl font-bold text-slate-900">{t(`${test.code}.name`)}</span>
                <span className="mt-1 block text-sm text-slate-600">{t(`${test.code}.desc`)}</span>
              </span>

              <span
                className={cn(
                  "inline-flex items-center gap-1.5 text-sm font-semibold",
                  disabled ? "text-slate-400" : "text-indigo-600"
                )}
              >
                {disabled ? null : (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="transition-transform group-hover:translate-x-0.5 rtl:rotate-180">
                    <path d="M5 12h14" />
                    <path d="m12 5 7 7-7 7" />
                  </svg>
                )}
              </span>
            </motion.button>
          );
        })}
      </div>

      <p className="mt-8 text-center text-sm text-slate-500">{t("selectHint")}</p>
    </div>
  );
}