"use client";

import { motion } from "framer-motion";
import { useTranslations } from "next-intl";

const steps = [
  {
    key: "1",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="m9 11 3 3L22 4" />
        <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
      </svg>
    ),
    titleKey: "landing.step1Title",
    descKey: "landing.step1Desc",
  },
  {
    key: "2",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 0 1 16 0Z" />
        <circle cx="12" cy="10" r="3" />
      </svg>
    ),
    titleKey: "landing.step2Title",
    descKey: "landing.step2Desc",
  },
  {
    key: "3",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 21a9 9 0 1 0-9-9" />
        <path d="M3 12a9 9 0 0 1 9-9" />
        <path d="M3 12h1" />
        <path d="M12 3v1" />
        <path d="m6.5 20.5 3-3" />
      </svg>
    ),
    titleKey: "landing.step3Title",
    descKey: "landing.step3Desc",
  },
];

export default function HowItWorks() {
  const t = useTranslations();

  return (
    <section id="how" className="mx-auto w-full max-w-6xl scroll-mt-20 px-4 pb-20 sm:px-6">
      <div className="flex flex-col items-center text-center">
        <h2 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
          {t("landing.stepsTitle")}
        </h2>
      </div>

      <div className="mt-10 grid gap-5 sm:grid-cols-3">
        {steps.map((step, index) => (
          <motion.div
            key={step.key}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.45, delay: index * 0.12, ease: "easeOut" }}
            className="tc-card-shadow flex flex-col gap-4 rounded-2xl border border-slate-200/80 bg-white p-6"
          >
            <span className="grid h-12 w-12 place-items-center rounded-xl bg-indigo-50 text-indigo-600">
              {step.icon}
            </span>
            <div>
              <h3 className="font-semibold text-slate-900">{t(step.titleKey)}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-slate-600">
                {t(step.descKey)}
              </p>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}