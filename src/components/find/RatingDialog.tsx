"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";

import { getBrowserClient } from "@/lib/supabase-browser";

const RATING_DELAY_MS = 15000;
const RATED_KEY = "testlocator-rated";

export default function RatingDialog() {
  const t = useTranslations("feedback");
  const [open, setOpen] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const alreadyRated = () => {
      try {
        return window.localStorage.getItem(RATED_KEY) === "1";
      } catch {
        return false;
      }
    };
    if (alreadyRated()) return;

    const timer = window.setTimeout(() => setOpen(true), RATING_DELAY_MS);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  if (!open || submitted) return null;

  function vote(answer: "yes" | "no") {
    const sb = getBrowserClient();
    if (sb) {
      sb.from("rating_votes").insert({ answer }).then(
        () => {},
        () => {}
      );
    }
    try {
      window.localStorage.setItem(RATED_KEY, "1");
    } catch {
      // ignore storage errors
    }
    setSubmitted(true);
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        className="fixed inset-0 z-[70] flex items-start justify-center overflow-y-auto bg-slate-900/50 p-4 backdrop-blur-md"
        role="dialog"
        aria-modal="true"
      >
        <motion.div
          initial={{ opacity: 0, y: -160, scale: 0.92 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -160, scale: 0.92 }}
          transition={{ type: "spring", stiffness: 260, damping: 24 }}
          className="mt-8 w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl"
        >
          <h2 className="text-lg font-bold leading-relaxed text-slate-900">
            {t("title")}
          </h2>

          <div className="mt-6 grid grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => vote("yes")}
              className="group flex flex-col items-center gap-3 rounded-2xl border-2 border-emerald-500 bg-white px-4 py-7 transition hover:bg-emerald-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300"
            >
              <svg
                width="56"
                height="56"
                viewBox="0 0 64 64"
                fill="none"
                aria-hidden="true"
              >
                <circle cx="32" cy="32" r="29" fill="#ecfdf5" />
                <circle
                  cx="32"
                  cy="32"
                  r="29"
                  stroke="#10b981"
                  strokeWidth="3"
                />
                <circle cx="23" cy="27" r="3.5" fill="#0f172a" />
                <circle cx="41" cy="27" r="3.5" fill="#0f172a" />
                <path
                  d="M22 38c3.2 3.4 7.2 5 10 5s6.8-1.6 10-5"
                  stroke="#0f172a"
                  strokeWidth="3"
                  strokeLinecap="round"
                />
              </svg>
              <span className="text-base font-bold text-emerald-600 group-hover:text-emerald-700">
                {t("yes")}
              </span>
            </button>

            <button
              type="button"
              onClick={() => vote("no")}
              className="group flex flex-col items-center gap-3 rounded-2xl border-2 border-rose-500 bg-white px-4 py-7 transition hover:bg-rose-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-300"
            >
              <svg
                width="56"
                height="56"
                viewBox="0 0 64 64"
                fill="none"
                aria-hidden="true"
              >
                <circle cx="32" cy="32" r="29" fill="#fff1f2" />
                <circle
                  cx="32"
                  cy="32"
                  r="29"
                  stroke="#f43f5e"
                  strokeWidth="3"
                />
                <circle cx="23" cy="27" r="3.5" fill="#0f172a" />
                <circle cx="41" cy="27" r="3.5" fill="#0f172a" />
                <path
                  d="M22 46c3.2-3.4 7.2-5 10-5s6.8 1.6 10 5"
                  stroke="#0f172a"
                  strokeWidth="3"
                  strokeLinecap="round"
                />
              </svg>
              <span className="text-base font-bold text-rose-600 group-hover:text-rose-700">
                {t("no")}
              </span>
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}