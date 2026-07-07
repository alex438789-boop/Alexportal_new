import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ALEX Career OS — Achievement Capital",
  description: "Fillable career capital cards for ALEX Career OS.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-TW">
      <body>{children}</body>
    </html>
  );
}
