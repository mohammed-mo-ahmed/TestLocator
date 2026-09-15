"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";

import { buttonClass } from "@/components/ui/primitives";
import { getBrowserClient } from "@/lib/supabase-browser";

const fieldClass =
  "h-11 w-full rounded-xl border border-slate-300 bg-white px-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100";
const labelClass = "mb-1.5 block text-sm font-semibold text-slate-700";

export default function FeedbackDialog() {
  const t = useTranslations("feedback");
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!name.trim() || !message.trim()) {
      setError(true);
      return;
    }
    setError(false);

    const sb = getBrowserClient();
    if (!sb) {
      console.error("[FeedbackDialog] Supabase not configured on the client");
      setSubmitted(true);
      return;
    }
    sb.from("problem_reports")
      .insert({
        name: name.trim(),
        contact: contact.trim(),
        message: message.trim(),
      })
      .then(
        () => setSubmitted(true),
        (err) => {
          console.error("[FeedbackDialog] insert failed", err);
          setError(true);
        }
      );
  }

  function close() {
    setOpen(false);
    setSubmitted(false);
    setName("");
    setContact("");
    setMessage("");
    setError(false);
  }

  return (
    <>
      <section className="mx-auto flex max-w-6xl flex-col items-center px-4 pb-20 pt-2 text-center sm:px-6">
        <button
          type="button"
          onClick={() => setOpen(true)}
          className={buttonClass("secondary")}
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12c0 1.821.487 3.53 1.338 5L2 22l5-1.338A9.954 9.954 0 0 0 12 22Z" />
            <path d="M9 9h6" />
            <path d="M9 13h6" />
          </svg>
          {t("button")}
        </button>
      </section>

      <AnimatePresence>
        {open ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[60] flex items-center justify-center p-4"
            role="presentation"
          >
            <div
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
              onClick={close}
            />
            <div className="relative">
              <button
                type="button"
                aria-label={t("close")}
                onClick={close}
                className="absolute -right-3 -top-3 z-10 grid h-9 w-9 place-items-center rounded-full border border-slate-200 bg-white text-slate-400 shadow-md transition hover:bg-slate-50 hover:text-slate-700"
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  aria-hidden="true"
                >
                  <path d="M18 6 6 18" />
                  <path d="m6 6 12 12" />
                </svg>
              </button>

              <motion.div
                initial={{ opacity: 0, scale: 0.96, y: 12 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.96, y: 12 }}
                transition={{ duration: 0.22, ease: "easeOut" }}
                role="dialog"
                aria-modal="true"
                className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl"
              >

              {submitted ? (
                <div className="flex flex-col items-center gap-3 py-8 text-center">
                  <span className="grid h-14 w-14 place-items-center rounded-full bg-emerald-100 text-emerald-600">
                    <svg
                      width="28"
                      height="28"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.4"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <path d="M20 6 9 17l-5-5" />
                    </svg>
                  </span>
                  <h2 className="text-lg font-bold text-slate-900">{t("successTitle")}</h2>
                  <p className="text-sm leading-relaxed text-slate-500">{t("successDesc")}</p>
                  <button type="button" onClick={close} className={buttonClass("secondary")}>
                    {t("close")}
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} noValidate>
                  <h2 className="text-lg font-bold text-slate-900">{t("formTitle")}</h2>
                  <p className="mt-1 text-sm leading-relaxed text-slate-500">{t("subtitle")}</p>

                  <div className="mt-5 flex flex-col gap-4">
                    <div>
                      <label htmlFor="feedback-name" className={labelClass}>
                        {t("name")}
                      </label>
                      <input
                        id="feedback-name"
                        type="text"
                        value={name}
                        onChange={(event) => setName(event.target.value)}
                        placeholder={t("namePlaceholder")}
                        className={fieldClass}
                      />
                    </div>

                    <div>
                      <label htmlFor="feedback-contact" className={labelClass}>
                        {t("contact")}
                      </label>
                      <input
                        id="feedback-contact"
                        type="text"
                        value={contact}
                        onChange={(event) => setContact(event.target.value)}
                        placeholder={t("contactPlaceholder")}
                        className={fieldClass}
                      />
                    </div>

                    <div>
                      <label htmlFor="feedback-message" className={labelClass}>
                        {t("message")}
                      </label>
                      <textarea
                        id="feedback-message"
                        value={message}
                        onChange={(event) => setMessage(event.target.value)}
                        placeholder={t("messagePlaceholder")}
                        rows={5}
                        className="w-full resize-none rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                      />
                    </div>

                    {error ? (
                      <p className="text-sm font-medium text-rose-600">{t("required")}</p>
                    ) : null}
                  </div>

                  <div className="mt-6 flex items-center justify-end gap-3">
                    <button type="button" onClick={close} className={buttonClass("ghost")}>
                      {t("close")}
                    </button>
                    <button type="submit" className={buttonClass("primary")}>
                      {t("submit")}
                    </button>
                  </div>
                </form>
              )}
            </motion.div>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}