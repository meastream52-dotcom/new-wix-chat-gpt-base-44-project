import type { Metadata } from "next";
import "./globals.css";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ChatWidget } from "@/components/ChatWidget";

export const metadata: Metadata = {
  title: "Ocean Label — Premium Flexographic Label Printing | Livermore, CA",
  description:
    "Ocean Label is a 25+ year family-owned flexographic label printer in Livermore, CA. Pressure-sensitive labels, food labels, custom die-cut, 5-color printing. Serving Microsoft, Sony, General Mills, and hundreds of Bay Area businesses. Get an instant quote.",
  keywords:
    "custom label printing, flexographic printing, pressure sensitive labels, food labels, Livermore CA, Bay Area label printer, die-cut labels, BOPP labels",
  openGraph: {
    title: "Ocean Label — Premium Flexographic Label Printing",
    description: "25+ years of B2B label printing excellence. Instant quotes, fast turnaround, enterprise quality.",
    url: "https://oceanlabel.com",
    siteName: "Ocean Label",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="flex flex-col min-h-screen bg-white text-slate-800">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
        <ChatWidget />
      </body>
    </html>
  );
}
