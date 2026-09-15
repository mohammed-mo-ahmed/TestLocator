import { cn } from "@/lib/cx";

type ButtonVariant = "primary" | "secondary" | "ghost";

const buttonStyles: Record<ButtonVariant, string> = {
  primary:
    "bg-indigo-600 text-white shadow-sm hover:bg-indigo-700 focus-visible:ring-indigo-300",
  secondary:
    "border border-slate-300 bg-white text-slate-700 shadow-sm hover:border-indigo-300 hover:text-indigo-700 focus-visible:ring-indigo-100",
  ghost:
    "text-slate-600 hover:bg-slate-100 hover:text-slate-900 focus-visible:ring-slate-200",
};

export function buttonClass(variant: ButtonVariant = "primary", extra = "") {
  return cn(
    "inline-flex items-center justify-center gap-2 rounded-full px-5 text-sm font-semibold transition focus:outline-none focus-visible:ring-2",
    variant === "primary" ? "h-12" : variant === "ghost" ? "h-9" : "h-11",
    buttonStyles[variant],
    extra
  );
}

export function Badge({
  tone = "neutral",
  className,
  children,
}: {
  tone?: "green" | "rose" | "indigo" | "neutral" | "amber";
  className?: string;
  children: React.ReactNode;
}) {
  const tones = {
    green: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
    rose: "bg-rose-50 text-rose-700 ring-rose-600/20",
    indigo: "bg-indigo-50 text-indigo-700 ring-indigo-600/20",
    amber: "bg-amber-50 text-amber-700 ring-amber-600/20",
    neutral: "bg-slate-100 text-slate-600 ring-slate-500/15",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset",
        tones[tone],
        className
      )}
    >
      {children}
    </span>
  );
}

export function Spinner({ label }: { label?: string }) {
  return (
    <span className="inline-flex items-center gap-2.5 text-sm text-slate-500" role="status">
      <svg
        className="h-5 w-5 animate-spin text-indigo-600"
        viewBox="0 0 24 24"
        fill="none"
        aria-hidden="true"
      >
        <circle className="opacity-20" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path
          className="opacity-90"
          fill="currentColor"
          d="M4 12a8 8 0 0 1 8-8V0C5.373 0 0 5.373 0 12h4z"
        />
      </svg>
      {label ? <span>{label}</span> : null}
    </span>
  );
}