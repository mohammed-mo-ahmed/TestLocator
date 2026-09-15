import Link from "next/link";

export default function LocaleNotFound() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 px-4 py-24 text-center">
      <p className="tc-gradient-text text-7xl font-black tracking-tight">404</p>
      <h1 className="text-xl font-semibold text-slate-900">Page not found</h1>
      <Link
        href="/"
        className="inline-flex h-11 items-center rounded-full bg-indigo-600 px-6 text-sm font-semibold text-white transition hover:bg-indigo-700"
      >
        Go back home
      </Link>
    </div>
  );
}