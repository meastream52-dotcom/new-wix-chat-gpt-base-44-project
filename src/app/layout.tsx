import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Platform — AI Software Builder",
  description: "An AI-powered platform for building software.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-[#0f1117] text-[#e6edf3]">{children}</body>
    </html>
  );
}
