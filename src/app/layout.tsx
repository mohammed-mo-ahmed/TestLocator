import type { Metadata } from "next";
import { IBM_Plex_Sans_Arabic } from "next/font/google";

import "./globals.css";

const plex = IBM_Plex_Sans_Arabic({
  variable: "--font-plex-sans-arabic",
  subsets: ["arabic"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "TestLocator",
    template: "%s · TestLocator",
  },
  description:
    "Find the nearest test center around you, check seat availability and pick the closest match in a few clicks.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${plex.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-slate-50 text-slate-900">
        {children}
      </body>
    </html>
  );
}