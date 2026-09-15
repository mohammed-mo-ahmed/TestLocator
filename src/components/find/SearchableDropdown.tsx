"use client";

import { useRef, useState } from "react";

import { cn } from "@/lib/cx";

export interface SearchableOption {
  value: string;
  label: string;
  secondary?: string;
  icon?: string;
}

export default function SearchableDropdown({
  options,
  value,
  onSelect,
  placeholder,
  searchPlaceholder,
  emptyText,
  disabled = false,
}: {
  options: SearchableOption[];
  value: string | null;
  onSelect: (value: string) => void;
  placeholder: string;
  searchPlaceholder: string;
  emptyText: string;
  disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const rootRef = useRef<HTMLDivElement>(null);

  const selected = options.find((option) => option.value === value) ?? null;

  const normalized = query.trim().toLowerCase();
  const filtered = normalized
    ? options.filter(
        (option) =>
          option.label.toLowerCase().includes(normalized) ||
          (option.secondary ?? "").toLowerCase().includes(normalized)
      )
    : options;

  function toggle(next: boolean) {
    if (disabled) return;
    setOpen(next);
    if (next) setQuery("");
  }

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => toggle(!open)}
        className={cn(
          "flex h-12 w-full items-center justify-between gap-3 rounded-xl border bg-white px-4 text-sm font-medium transition focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-300",
          disabled
            ? "cursor-not-allowed border-slate-200 bg-slate-50 text-slate-400"
            : open
              ? "border-indigo-400 ring-2 ring-indigo-100"
              : "border-slate-300 hover:border-indigo-300"
        )}
      >
        <span className="flex min-w-0 items-center gap-2.5">
          {selected?.icon ? (
            <span aria-hidden="true" className="text-xl">
              {selected.icon}
            </span>
          ) : null}
          <span className={cn("truncate", selected ? "text-slate-900" : "text-slate-400")}>
            {selected ? selected.label : placeholder}
          </span>
        </span>
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={cn("shrink-0 text-slate-400 transition-transform", open && "rotate-180")}
          aria-hidden="true"
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>

      {open ? (
        <div className="absolute inset-x-0 top-full z-20 mt-1.5 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl">
          <div className="border-b border-slate-100 p-2">
            <div className="relative">
              <svg
                width="15"
                height="15"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 rtl:left-auto rtl:right-3"
                aria-hidden="true"
              >
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.3-4.3" />
              </svg>
              <input
                type="text"
                value={query}
                autoFocus
                onChange={(event) => setQuery(event.target.value)}
                placeholder={searchPlaceholder}
                className="h-9 w-full rounded-lg border border-slate-200 bg-slate-50 pe-3 pl-9 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-300 focus:bg-white rtl:pl-3 rtl:pr-9"
              />
            </div>
          </div>

          <ul role="listbox" className="max-h-60 overflow-y-auto p-1">
            {filtered.length === 0 ? (
              <li className="px-3 py-4 text-center text-sm text-slate-400">{emptyText}</li>
            ) : (
              filtered.map((option) => {
                const active = option.value === value;
                return (
                  <li key={option.value} role="option" aria-selected={active}>
                    <button
                      type="button"
                      onClick={() => {
                        onSelect(option.value);
                        setOpen(false);
                      }}
                      className={cn(
                        "flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-start transition hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-300",
                        active && "bg-indigo-50"
                      )}
                    >
                      {option.icon ? (
                        <span aria-hidden="true" className="text-lg">
                          {option.icon}
                        </span>
                      ) : null}
                      <span className="min-w-0">
                        <span className="block truncate text-sm font-medium text-slate-900">
                          {option.label}
                        </span>
                        {option.secondary ? (
                          <span className="block truncate text-xs text-slate-500">
                            {option.secondary}
                          </span>
                        ) : null}
                      </span>
                    </button>
                  </li>
                );
              })
            )}
          </ul>
        </div>
      ) : null}
    </div>
  );
}