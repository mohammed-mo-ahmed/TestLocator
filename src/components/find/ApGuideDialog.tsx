"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useLocale, useTranslations } from "next-intl";
import { useEffect, useState } from "react";

function SectionTitle({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <h2 className={`mb-3 mt-8 text-lg font-bold text-slate-900 ${className}`}>
      {children}
    </h2>
  );
}

function ScheduleTable({
  rows,
  colDate,
  colMorning,
  colAfternoon,
}: {
  rows: Array<{ key: string; day: string; morning: string; afternoon: string }>;
  colDate: string;
  colMorning: string;
  colAfternoon: string;
}) {
  return (
    <div className="my-4 overflow-x-auto rounded-xl border border-slate-200">
      <table className="w-full min-w-[560px] border-collapse text-sm">
        <thead>
          <tr className="bg-slate-50 text-slate-700">
            <th className="px-3 py-2.5 text-start font-bold">{colDate}</th>
            <th className="px-3 py-2.5 text-start font-bold">{colMorning}</th>
            <th className="px-3 py-2.5 text-start font-bold">{colAfternoon}</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.key} className="border-t border-slate-200">
              <td className="px-3 py-2.5 font-semibold text-slate-700">{row.day}</td>
              <td className="whitespace-pre-line px-3 py-2.5 align-top text-slate-600">
                {row.morning}
              </td>
              <td className="whitespace-pre-line px-3 py-2.5 align-top text-slate-600">
                {row.afternoon}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const AR_SUBJECTS: Record<string, string> = {
  "Human Geography": "الجغرافيا البشرية",
  Biology: "الأحياء",
  "Italian Language and Culture": "اللغة والثقافة الإيطالية",
  "U.S. Government and Politics": "الحكومة والسياسة الأمريكية",
  "European History": "التاريخ الأوروبي",
  Microeconomics: "الاقتصاد الجزئي",
  Cybersecurity: "الأمن السيبراني",
  "English Language and Composition": "اللغة الإنجليزية وآدابها",
  "French Language and Culture": "اللغة والثقافة الفرنسية",
  "World History: Modern": "تاريخ العالم: العصر الحديث",
  "African American Studies": "الدراسات الأفريقية الأمريكية",
  Chemistry: "الكيمياء",
  "German Language and Culture": "اللغة والثقافة الألمانية",
  "U.S. History": "تاريخ الولايات المتحدة",
  Macroeconomics: "الاقتصاد الكلي",
  Networking: "الشبكات",
  "Music Theory": "نظرية الموسيقى",
  "Japanese Language and Culture": "اللغة والثقافة اليابانية",
  Statistics: "الإحصاء",
  "English Literature and Composition": "اللغة الإنجليزية والتعبير",
  "Art History": "تاريخ الفن",
  "Spanish Language and Culture": "اللغة والثقافة الإسبانية",
  "Chinese Language and Culture": "اللغة والثقافة الصينية",
  "Environmental Science": "العلوم البيئية",
  "Comparative Government and Politics": "الحكومة والسياسة المقارنة",
  "Spanish Literature and Culture": "الأدب والثقافة الإسبانية",
  Latin: "اللاتينية",
  Psychology: "علم النفس",
};

type DayRow = { date: string; morning: string[]; afternoon: string[] };

const weekOne: DayRow[] = [
  { date: "2027-05-03", morning: ["Human Geography", "Physics C: Mechanics"], afternoon: ["Biology", "Italian Language and Culture"] },
  { date: "2027-05-04", morning: ["Business with Personal Finance", "U.S. Government and Politics"], afternoon: ["European History", "Microeconomics"] },
  { date: "2027-05-05", morning: ["Cybersecurity", "English Language and Composition"], afternoon: ["Physics 1: Algebra-Based", "Physics C: Electricity and Magnetism"] },
  { date: "2027-05-06", morning: ["French Language and Culture", "Physics 2: Algebra-Based", "World History: Modern"], afternoon: ["African American Studies", "Chemistry"] },
  { date: "2027-05-07", morning: ["German Language and Culture", "U.S. History"], afternoon: ["Macroeconomics", "Networking"] },
];

const weekTwo: DayRow[] = [
  { date: "2027-05-10", morning: ["Calculus AB", "Calculus BC"], afternoon: ["Music Theory", "Seminar"] },
  { date: "2027-05-11", morning: ["Japanese Language and Culture", "Precalculus"], afternoon: ["Statistics"] },
  { date: "2027-05-12", morning: ["English Literature and Composition"], afternoon: ["Art History", "Computer Science A"] },
  { date: "2027-05-13", morning: ["Spanish Language and Culture"], afternoon: ["Chinese Language and Culture", "Environmental Science"] },
  { date: "2027-05-14", morning: ["Comparative Government and Politics", "Computer Science Principles", "Spanish Literature and Culture"], afternoon: ["Latin", "Psychology"] },
];

const portfolioDeadlines: Array<{ subject: string; deadlineKey: string }> = [
  { subject: "AP Art and Design", deadlineKey: "portfolioDeadline1" },
  { subject: "AP Computer Science Principles", deadlineKey: "portfolioDeadline2" },
  { subject: "AP Seminar & AP Research", deadlineKey: "portfolioDeadline2" },
  { subject: "AP World Languages and Cultures", deadlineKey: "portfolioDeadline2" },
];

const fees: Array<{ locationKey: string; valueKey: string }> = [
  { locationKey: "feeUS", valueKey: "feeUSValue" },
  { locationKey: "feeIntl", valueKey: "feeIntlValue" },
];

export default function ApGuideDialog() {
  const t = useTranslations("apGuide");
  const tFeedback = useTranslations("feedback");
  const locale = useLocale();
  const [open, setOpen] = useState(false);

  const isRtl = locale === "ar";

  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const rich = (key: string) =>
    t.rich(key, {
      strong: (chunks) => <strong className="font-bold text-slate-900">{chunks}</strong>,
    });

  const subject = (name: string) => {
    const label = isRtl ? AR_SUBJECTS[name] ?? name : name;
    return name === "Networking" ? `${label}*` : label;
  };

  const formatDay = (date: string) =>
    new Intl.DateTimeFormat(locale, {
      weekday: "long",
      day: "numeric",
      month: "long",
    }).format(new Date(`${date}T00:00:00`));

  const buildRows = (days: DayRow[]) =>
    days.map((d) => ({
      key: d.date,
      day: formatDay(d.date),
      morning: d.morning.map(subject).join("\n"),
      afternoon: d.afternoon.map(subject).join("\n"),
    }));

  const colDate = t("colDate");
  const colMorning = t("colMorning");
  const colAfternoon = t("colAfternoon");

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex w-fit items-center justify-center gap-2 rounded-xl bg-rose-600 px-5 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-rose-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-300"
      >
        <span aria-hidden="true">⚠️</span>
        {t("button")}
      </button>

      <AnimatePresence>
        {open ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-[75] flex items-start justify-center overflow-y-auto bg-slate-900/50 p-4 backdrop-blur-md"
            role="dialog"
            aria-modal="true"
            aria-label={t("modalLabel")}
          >
            <motion.div
              initial={{ opacity: 0, y: -160, scale: 0.92 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -160, scale: 0.92 }}
              transition={{ type: "spring", stiffness: 260, damping: 24 }}
              className="relative mt-6 mb-6 w-full max-w-3xl overflow-hidden rounded-2xl bg-white shadow-2xl"
            >
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label={tFeedback("close")}
                className="absolute end-3 top-3 z-10 grid h-9 w-9 place-items-center rounded-full bg-slate-100 text-slate-600 transition hover:bg-slate-200 hover:text-slate-900"
              >
                ✕
              </button>

              <div
                dir={isRtl ? "rtl" : "ltr"}
                className="max-h-[82vh] overflow-y-auto px-6 py-8 text-slate-700 sm:px-8"
              >
                <h1 className="text-2xl font-bold text-slate-900">{t("title")}</h1>

                <SectionTitle className="mt-6">
                  <span aria-hidden="true">⚠️ </span>
                  {t("warningTitle")}
                </SectionTitle>
                <p className="leading-relaxed">{rich("warningBody")}</p>
                <p className="mt-3 leading-relaxed">{t("warningAsk")}</p>
                <ul className="mt-2 list-inside list-disc space-y-1 leading-relaxed">
                  <li>{t("warning1")}</li>
                  <li>{t("warning2")}</li>
                  <li>{t("warning3")}</li>
                </ul>

                <SectionTitle>
                  <span aria-hidden="true">📞 </span>
                  {t("contactTitle")}
                </SectionTitle>
                <ol className="list-inside list-decimal space-y-1 leading-relaxed">
                  <li>{t("contact1")}</li>
                  <li>{rich("contact2")}</li>
                  <li>{t("contact3")}</li>
                  <li>{t("contact4")}</li>
                </ol>
                <p className="mt-3 leading-relaxed">{rich("contactEarly")}</p>
                <p className="mt-3 leading-relaxed">{rich("contactLedger")}</p>

                <SectionTitle>
                  <span aria-hidden="true">📝 </span>
                  {t("hostingTitle")}
                </SectionTitle>
                <p className="leading-relaxed">{t("hostingIntro")}</p>
                <ul className="mt-2 list-inside list-disc space-y-1 leading-relaxed">
                  <li>{t("hosting1")}</li>
                  <li>{t("hosting2")}</li>
                  <li>{t("hosting3")}</li>
                </ul>

                <SectionTitle>
                  <span aria-hidden="true">⏰ </span>
                  {t("deadlineTitle")}
                </SectionTitle>
                <p className="leading-relaxed">{rich("deadline1")}</p>
                <p className="mt-3 leading-relaxed">{rich("deadline2")}</p>

                <hr className="my-8 border-slate-200" />

                <h1 className="text-2xl font-bold text-slate-900">{t("datesTitle")}</h1>
                <p className="mt-3 leading-relaxed">{rich("datesIntro")}</p>
                <p className="mt-2 font-bold text-slate-900">{t("datesWeeksLabel")}</p>
                <p className="font-bold text-slate-900">{t("datesWeeks")}</p>
                <p className="mt-2 leading-relaxed">{t("datesCoordinator")}</p>

                <h2 className="mt-5 mb-2 text-lg font-bold text-slate-900">
                  {t("week1Title")}
                </h2>
                <ScheduleTable
                  rows={buildRows(weekOne)}
                  colDate={colDate}
                  colMorning={colMorning}
                  colAfternoon={colAfternoon}
                />

                <h2 className="mt-6 mb-2 text-lg font-bold text-slate-900">
                  {t("week2Title")}
                </h2>
                <ScheduleTable
                  rows={buildRows(weekTwo)}
                  colDate={colDate}
                  colMorning={colMorning}
                  colAfternoon={colAfternoon}
                />

                <p className="text-sm leading-relaxed text-slate-500">
                  {rich("networkingNote")}
                </p>

                <h2 className="mt-6 mb-3 text-lg font-bold text-slate-900">
                  {t("portfolioTitle")}
                </h2>
                <div className="overflow-x-auto rounded-xl border border-slate-200">
                  <table className="w-full min-w-[460px] border-collapse text-sm">
                    <thead>
                      <tr className="bg-slate-50 text-slate-700">
                        <th className="px-3 py-2.5 text-start font-bold">
                          {t("colSubject")}
                        </th>
                        <th className="px-3 py-2.5 text-start font-bold">
                          {t("colDeadline")}
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {portfolioDeadlines.map((row) => (
                        <tr key={row.subject} className="border-t border-slate-200">
                          <td className="px-3 py-2.5 font-semibold text-slate-700">
                            {row.subject}
                          </td>
                          <td className="px-3 py-2.5 text-slate-600">{t(row.deadlineKey)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <hr className="my-8 border-slate-200" />

                <h1 className="text-2xl font-bold text-slate-900">{t("feesTitle")}</h1>
                <div className="mt-4 overflow-x-auto rounded-xl border border-slate-200">
                  <table className="w-full min-w-[400px] border-collapse text-sm">
                    <thead>
                      <tr className="bg-slate-50 text-slate-700">
                        <th className="px-3 py-2.5 text-start font-bold">
                          {t("colLocation")}
                        </th>
                        <th className="px-3 py-2.5 text-start font-bold">
                          {t("colBaseFee")}
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {fees.map((row) => (
                        <tr key={row.locationKey} className="border-t border-slate-200">
                          <td className="px-3 py-2.5 text-slate-700">{t(row.locationKey)}</td>
                          <td className="px-3 py-2.5 font-bold text-slate-900">
                            {t(row.valueKey)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <SectionTitle>{t("extraTitle")}</SectionTitle>
                <p className="leading-relaxed">{rich("lateLabel")}</p>
                <p className="mt-1 leading-relaxed">{rich("lateBody")}</p>
                <p className="mt-3 leading-relaxed">{rich("cancelLabel")}</p>
                <p className="mt-1 leading-relaxed">{rich("cancelBody")}</p>

                <SectionTitle>{t("discountTitle")}</SectionTitle>
                <p className="leading-relaxed">{rich("discountBody")}</p>

                <SectionTitle>
                  <span aria-hidden="true">⚠️ </span>
                  {t("importantTitle")}
                </SectionTitle>
                <p className="leading-relaxed">{rich("important1")}</p>
                <p className="mt-3 leading-relaxed">{rich("important2")}</p>
              </div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}
