import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ALEX Career OS",
  description: "Achievement Capital MVP",
  applicationName: "ALEX OS",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    title: "ALEX OS",
    statusBarStyle: "default",
  },
  icons: {
    icon: "/icons/alex-os-icon.svg",
    apple: "/icons/alex-os-icon.svg",
  },
};

export const viewport: Viewport = {
  themeColor: "#f8fbff",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
