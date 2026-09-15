import type { Metadata } from "next";

export const metadata: Metadata = {
  title: { default: "Admin", template: "%s · TestLocator Admin" },
  description: "TestLocator administration panel",
  robots: {
    index: false,
    follow: false,
    noarchive: true,
    noimageindex: true,
  },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {children}
    </div>
  );
}
