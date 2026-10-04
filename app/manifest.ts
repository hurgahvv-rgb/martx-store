import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "NaRa",
    short_name: "NaRa",
    description: "Ručně vyráběné kožené kabelky a doplňky",
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#fbfaf7",
    theme_color: "#111827",
    orientation: "portrait",
    categories: ["shopping", "lifestyle"],
    icons: [
      {
        src: "/martx-app-icon.svg",
        sizes: "512x512",
        type: "image/svg+xml",
        purpose: "any"
      },
      {
        src: "/martx-maskable-icon.svg",
        sizes: "512x512",
        type: "image/svg+xml",
        purpose: "maskable"
      }
    ]
  };
}
