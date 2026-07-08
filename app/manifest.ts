import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "ALEX Career OS",
    short_name: "ALEX OS",
    description: "Achievement Capital cards for building career assets.",
    start_url: "/achievement-capital",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#f8fbff",
    theme_color: "#f8fbff",
    icons: [
      {
        src: "/icons/alex-os-icon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any",
      },
      {
        src: "/icons/alex-os-icon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "maskable",
      },
    ],
    categories: ["productivity", "business", "education"],
  };
}
