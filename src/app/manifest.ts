import type { MetadataRoute } from "next";

export const dynamic = "force-static";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "TestLocator",
    short_name: "TestLocator",
    description:
      "Find the nearest test center around you, check live seat availability and pick the closest match in a few clicks.",
    start_url: "/en",
    display: "standalone",
    background_color: "#f8fafc",
    theme_color: "#4f46e5",
    lang: "en",
    categories: ["education", "utilities", "navigation"],
    icons: [
      {
        src: "/seo/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/seo/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
