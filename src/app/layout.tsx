import type { Metadata } from "next";
import { IBM_Plex_Sans_Arabic } from "next/font/google";

import { siteUrl } from "@/lib/seo";

import "./globals.css";

const plex = IBM_Plex_Sans_Arabic({
  variable: "--font-plex-sans-arabic",
  subsets: ["arabic"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl()),
  applicationName: "TestLocator",
  title: {
    default: "TestLocator",
    template: "%s Â· TestLocator",
  },
  description:
    "Find the nearest test center around you, check live seat availability and pick the closest match in a few clicks.",
  keywords: [
    "test center",
    "test locator",
    "SAT test center near me",
    "nearest test center",
    "computer-based test",
    "seat availability",
    "test venue finder",
  ],
  category: "education",
  creator: "TestLocator",
  publisher: "TestLocator",
  referrer: "origin-when-cross-origin",
  verification: {
    google: "VV1pEJTrOgv8Ar8KucAruCLJ7Hj5zC-mIw2_pv0",
  },
  formatDetection: { email: false, address: false, telephone: false },
  openGraph: {
    type: "website",
    siteName: "TestLocator",
    locale: "en_US",
    images: [
      {
        url: "/seo/og.png",
        width: 1200,
        height: 630,
        alt: "TestLocator â€” find the nearest test center",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "TestLocator",
    description:
      "Find the nearest test center around you, check live seat availability and pick the closest match in a few clicks.",
    images: ["/seo/og.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  icons: {
    icon: [{ url: "/icon.png", sizes: "any", type: "image/png" }],
    apple: [{ url: "/seo/icon-512.png", sizes: "180x180", type: "image/png" }],
  },
  manifest: "/manifest.webmanifest",
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

export const dynamic = "force-static";
