import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "PrintForge — Custom 3D Printed Parts",
  description:
    "Discontinued, overpriced, or too niche to exist? We design and print it.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-ink-50 text-ink-900 antialiased">
        <header className="border-b border-ink-100 bg-white">
          <nav className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
            <Link href="/" className="text-lg font-bold text-forge-700">
              Print<span className="text-ink-900">Forge</span>
            </Link>
            <div className="flex items-center gap-4 text-sm">
              <Link href="/" className="hover:text-forge-600">Catalog</Link>
              <Link href="/request" className="btn-primary">
                Request a custom part
              </Link>
            </div>
          </nav>
        </header>
        <main className="mx-auto max-w-5xl px-4 py-8">{children}</main>
        <footer className="mt-12 border-t border-ink-100 bg-white py-6 text-center text-xs text-ink-400">
          PrintForge — FDM printed parts. No structural, load-bearing, or
          safety-critical components.
        </footer>
      </body>
    </html>
  );
}
