"use client";

import { AnimatePresence, motion } from "framer-motion";
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
  days,
}: {
  days: Array<{
    day: string;
    morning: React.ReactNode;
    afternoon: React.ReactNode;
  }>;
}) {
  return (
    <div className="my-4 overflow-x-auto rounded-xl border border-slate-200">
      <table className="w-full min-w-[560px] border-collapse text-sm">
        <thead>
          <tr className="bg-slate-50 text-slate-700">
            <th className="px-3 py-2.5 text-start font-bold">التاريخ</th>
            <th className="px-3 py-2.5 text-start font-bold">الفترة الصباحية</th>
            <th className="px-3 py-2.5 text-start font-bold">الفترة المسائية</th>
          </tr>
        </thead>
        <tbody>
          {days.map((row) => (
            <tr key={row.day} className="border-t border-slate-200">
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

const weekOne = [
  {
    day: "الإثنين 3 مايو",
    morning: <>الجغرافيا البشرية{`\n`}Physics C: Mechanics</>,
    afternoon: <>الأحياء{`\n`}اللغة والثقافة الإيطالية</>,
  },
  {
    day: "الثلاثاء 4 مايو",
    morning: <>Business with Personal Finance{`\n`}الحكومة والسياسة الأمريكية</>,
    afternoon: <>التاريخ الأوروبي{`\n`}الاقتصاد الجزئي</>,
  },
  {
    day: "الأربعاء 5 مايو",
    morning: <>الأمن السيبراني{`\n`}اللغة الإنجليزية وآدابها</>,
    afternoon: <>Physics 1: Algebra-Based{`\n`}Physics C: Electricity and Magnetism</>,
  },
  {
    day: "الخميس 6 مايو",
    morning: (
      <>
        اللغة والثقافة الفرنسية{`\n`}Physics 2: Algebra-Based{`\n`}تاريخ العالم: العصر الحديث
      </>
    ),
    afternoon: <>الدراسات الأفريقية الأمريكية{`\n`}الكيمياء</>,
  },
  {
    day: "الجمعة 7 مايو",
    morning: <>اللغة والثقافة الألمانية{`\n`}تاريخ الولايات المتحدة</>,
    afternoon: <>الاقتصاد الكلي{`\n`}الشبكات*</>,
  },
];

const weekTwo = [
  {
    day: "الإثنين 10 مايو",
    morning: <>Calculus AB{`\n`}Calculus BC</>,
    afternoon: <>نظرية الموسيقى{`\n`}Seminar</>,
  },
  {
    day: "الثلاثاء 11 مايو",
    morning: <>اللغة والثقافة اليابانية{`\n`}Precalculus</>,
    afternoon: <>الإحصاء</>,
  },
  {
    day: "الأربعاء 12 مايو",
    morning: <>اللغة الإنجليزية والتعبير</>,
    afternoon: <>تاريخ الفن{`\n`}Computer Science A</>,
  },
  {
    day: "الخميس 13 مايو",
    morning: <>اللغة والثقافة الإسبانية</>,
    afternoon: <>اللغة والثقافة الصينية{`\n`}العلوم البيئية</>,
  },
  {
    day: "الجمعة 14 مايو",
    morning: (
      <>
        الحكومة والسياسة المقارنة{`\n`}Computer Science Principles{`\n`}الأدب والثقافة
        الإسبانية
      </>
    ),
    afternoon: <>اللاتينية{`\n`}علم النفس</>,
  },
];

const portfolioDeadlines = [
  { subject: "AP Art and Design", deadline: "7 مايو 2027 — 11:59 مساءً بتوقيت ET" },
  { subject: "AP Computer Science Principles", deadline: "30 أبريل 2027 — 11:59 مساءً بتوقيت ET" },
  { subject: "AP Seminar وAP Research", deadline: "30 أبريل 2027 — 11:59 مساءً بتوقيت ET" },
  { subject: "AP World Languages and Cultures", deadline: "30 أبريل 2027 — 11:59 مساءً بتوقيت ET" },
];

const fees = [
  { location: "الولايات المتحدة، أقاليمها، كندا ومدارس DoWEA", fee: "99 دولارًا" },
  { location: "خارج الولايات المتحدة", fee: "129 دولارًا" },
];

export default function ApGuideDialog() {
  const [open, setOpen] = useState(false);

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

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex w-fit items-center justify-center gap-2 rounded-xl bg-rose-600 px-5 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-rose-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-300"
      >
        <span aria-hidden="true">⚠️</span>
        مهم: تأكد قبل التوجه إلى المركز
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
            aria-label="دليل مراكز اختبارات AP"
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
                aria-label="إغلاق"
                className="absolute end-3 top-3 z-10 grid h-9 w-9 place-items-center rounded-full bg-slate-100 text-slate-600 transition hover:bg-slate-200 hover:text-slate-900"
              >
                ✕
              </button>

              <div
                dir="rtl"
                className="max-h-[82vh] overflow-y-auto px-6 py-8 text-slate-700 sm:px-8"
              >
                <h1 className="text-2xl font-bold text-slate-900">مراكز اختبارات AP</h1>

                <SectionTitle className="mt-6">
                  <span aria-hidden="true">⚠️ </span>مهم: تأكد قبل التوجه إلى المركز
                </SectionTitle>
                <p className="leading-relaxed">
                  يشمل هذا الدليل مراكز ومدارس سبق لها تقديم اختبارات AP في السنوات الماضية.{" "}
                  <strong className="text-slate-900">
                    وجود مدرسة في الدليل لا يعني بالضرورة أنها ستقدم الاختبارات هذا العام.
                  </strong>
                </p>
                <p className="mt-3 leading-relaxed">تواصل مع المدرسة مباشرة للتأكد من:</p>
                <ul className="mt-2 list-inside list-disc space-y-1 leading-relaxed">
                  <li>أنها ستقدم اختبارات AP هذا العام.</li>
                  <li>أنها تقبل طلابًا من مدارس أخرى.</li>
                  <li>أنها تقدم مادة AP التي تريد اختبارها.</li>
                </ul>

                <SectionTitle>
                  <span aria-hidden="true">📞 </span>كيف تتواصل مع المدرسة؟
                </SectionTitle>
                <ol className="list-inside list-decimal space-y-1 leading-relaxed">
                  <li>ابحث عن رقم هاتف المدرسة.</li>
                  <li>اطلب التحدث مع <strong className="text-slate-900">منسق AP</strong>.</li>
                  <li>اسأل عما إذا كانت المدرسة تقبل طلابًا من خارجها لأداء اختبارات AP هذا العام.</li>
                  <li>اسأل عن المواد المتاحة، ومواعيد التسجيل، والرسوم.</li>
                </ol>
                <p className="mt-3 leading-relaxed">
                  <strong className="text-slate-900">
                    ابدأ بالتواصل مع المدارس في أقرب وقت ممكن.
                  </strong>{" "}
                  فقد تضع كل مدرسة مواعيد نهائية وسياسات خاصة بها لقبول الطلاب من خارج المدرسة،
                  كما قد تكون لديها سعة محدودة.
                </p>
                <p className="mt-3 leading-relaxed">
                  يتم تحديث <strong className="text-slate-900">دليل دورات AP (AP Course Ledger)</strong>{" "}
                  في شهر <strong className="text-slate-900">نوفمبر</strong> من كل عام، لذلك إذا لم
                  تجد مركزًا مناسبًا، يمكنك التحقق منه مرة أخرى في نوفمبر.
                </p>

                <SectionTitle>
                  <span aria-hidden="true">📝 </span>إذا وافقت المدرسة على استضافتك
                </SectionTitle>
                <p className="leading-relaxed">سيكون منسق AP مسؤولًا عن:</p>
                <ul className="mt-2 list-inside list-disc space-y-1 leading-relaxed">
                  <li>طلب مواد الاختبار الخاصة بك.</li>
                  <li>إبلاغك بموعد ومكان الاختبار.</li>
                  <li>تحصيل رسوم الاختبار.</li>
                </ul>

                <SectionTitle>
                  <span aria-hidden="true">⏰ </span>موعد مهم
                </SectionTitle>
                <p className="leading-relaxed">
                  الموعد النهائي المعتاد للمدارس لطلب اختبارات AP هو{" "}
                  <strong className="text-slate-900">منتصف نوفمبر</strong>.
                </p>
                <p className="mt-3 leading-relaxed">
                  إذا لم تجد مركزًا قبل ذلك، <strong className="text-slate-900">استمر في البحث</strong>.
                  قد تتمكن مدرسة من إضافتك إلى طلبها بعد الموعد النهائي وطلب إعفاء من رسوم الطلب
                  المتأخر، لكن ذلك يعتمد على سياسة المدرسة وتقديرها.
                </p>

                <hr className="my-8 border-slate-200" />

                <h1 className="text-2xl font-bold text-slate-900">مواعيد اختبارات AP لعام 2027</h1>
                <p className="mt-3 leading-relaxed">تُعقد اختبارات AP في <strong className="text-slate-900">شهر مايو</strong>.</p>
                <p className="mt-2 font-bold text-slate-900">أسبوعا الاختبارات:</p>
                <p className="text-slate-900">
                  <strong>3–7 مايو</strong> و<strong>10–14 مايو 2027</strong>
                </p>
                <p className="mt-2 leading-relaxed">
                  سيحدد منسق AP في المدرسة موعد اختبارك ومكانه بشكل نهائي.
                </p>

                <h2 className="mt-5 mb-2 text-lg font-bold text-slate-900">
                  الأسبوع الأول — 3 إلى 7 مايو
                </h2>
                <ScheduleTable days={weekOne} />

                <h2 className="mt-6 mb-2 text-lg font-bold text-slate-900">
                  الأسبوع الثاني — 10 إلى 14 مايو
                </h2>
                <ScheduleTable days={weekTwo} />

                <p className="text-sm leading-relaxed text-slate-500">
                  * اختبار <strong>Networking</strong> مخصص لمدارس البرنامج التجريبي لعام 2026–2027 فقط.
                </p>

                <h2 className="mt-6 mb-3 text-lg font-bold text-slate-900">
                  مواعيد تسليم الأعمال عبر AP Digital Portfolio
                </h2>
                <div className="overflow-x-auto rounded-xl border border-slate-200">
                  <table className="w-full min-w-[460px] border-collapse text-sm">
                    <thead>
                      <tr className="bg-slate-50 text-slate-700">
                        <th className="px-3 py-2.5 text-start font-bold">المادة</th>
                        <th className="px-3 py-2.5 text-start font-bold">الموعد النهائي</th>
                      </tr>
                    </thead>
                    <tbody>
                      {portfolioDeadlines.map((row) => (
                        <tr key={row.subject} className="border-t border-slate-200">
                          <td className="px-3 py-2.5 font-semibold text-slate-700">{row.subject}</td>
                          <td className="px-3 py-2.5 text-slate-600">{row.deadline}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <hr className="my-8 border-slate-200" />

                <h1 className="text-2xl font-bold text-slate-900">رسوم اختبارات AP لعام 2027</h1>
                <div className="mt-4 overflow-x-auto rounded-xl border border-slate-200">
                  <table className="w-full min-w-[400px] border-collapse text-sm">
                    <thead>
                      <tr className="bg-slate-50 text-slate-700">
                        <th className="px-3 py-2.5 text-start font-bold">مكان الاختبار</th>
                        <th className="px-3 py-2.5 text-start font-bold">الرسوم الأساسية</th>
                      </tr>
                    </thead>
                    <tbody>
                      {fees.map((row) => (
                        <tr key={row.location} className="border-t border-slate-200">
                          <td className="px-3 py-2.5 text-slate-700">{row.location}</td>
                          <td className="px-3 py-2.5 font-bold text-slate-900">{row.fee}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <SectionTitle>رسوم إضافية</SectionTitle>
                <p className="leading-relaxed">
                  <strong className="text-slate-900">التسجيل المتأخر:</strong> +40 دولارًا لكل اختبار
                </p>
                <p className="mt-1 leading-relaxed">
                  ينطبق على الاختبارات التي يتم طلبها بين <strong>14 نوفمبر و12 مارس</strong> للمقررات
                  السنوية أو مقررات الفصل الدراسي الأول.
                </p>
                <p className="mt-3 leading-relaxed">
                  <strong className="text-slate-900">الاختبار غير المستخدم / الملغى:</strong> 40 دولارًا لكل اختبار
                </p>
                <p className="mt-1 leading-relaxed">
                  ينطبق عند إلغاء اختبار تم طلبه بعد <strong>الموعد النهائي للطلب في 13 نوفمبر</strong>.
                </p>

                <SectionTitle>تخفيض الرسوم</SectionTitle>
                <p className="leading-relaxed">
                  قد يحصل الطلاب الذين لديهم حاجة مالية كبيرة على{" "}
                  <strong className="text-slate-900">
                    تخفيض قدره 37 دولارًا من College Board لكل اختبار
                  </strong>
                  . وقد يتوفر دعم إضافي حسب المنطقة والمدرسة.
                </p>

                <SectionTitle>
                  <span aria-hidden="true">⚠️ </span>مهم
                </SectionTitle>
                <p className="leading-relaxed">
                  قد تفرض المدرسة رسومًا إضافية مقابل <strong className="text-slate-900">المراقبة والإدارة</strong>.
                </p>
                <p className="mt-3 leading-relaxed">
                  وبالنسبة للطلاب الذين يؤدون الاختبار خارج الولايات المتحدة، فإن رسوم College Board
                  الأساسية هي <strong className="text-slate-900">129 دولارًا</strong>، لكن المبلغ
                  النهائي قد يكون أعلى حسب مركز الاختبار.
                </p>
              </div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}