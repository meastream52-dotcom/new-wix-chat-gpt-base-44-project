import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/components/builder/Providers";

export const metadata: Metadata = {
  title: "BuilderAI — Build Software with AI",
  description: "Type what you want. AI builds the complete app — frontend, backend, database, auth, payments, deployment.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-[#0f1117] text-[#e6edf3] antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
