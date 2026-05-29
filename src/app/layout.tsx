import type { Metadata } from "next";
import "./globals.css";
import { AscNavigation } from "@/components/asc/Navigation";

export const metadata: Metadata = {
  title: "ASC — Autonomous Software Company",
  description: "AI-powered software agency. Describe your idea, we build it.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="flex h-screen overflow-hidden bg-gray-950 text-gray-100">
        <AscNavigation />
        <main className="flex-1 overflow-y-auto">{children}</main>
      </body>
    </html>
  );
}
