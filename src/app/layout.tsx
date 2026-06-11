import type { Metadata } from "next";
import Link from "next/link";
import { ClerkProvider } from "@clerk/nextjs";
import { clerkEnabled } from "@/lib/auth";
import { NavBar } from "@/components/NavBar";
import "./globals.css";

export const metadata: Metadata = {
  title: "EchoBlog — write, read, earn",
  description:
    "A blogging platform that shares subscription revenue with its writers and readers.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const body = (
    <html lang="en">
      <body>
        <NavBar />
        <main className="mx-auto min-h-[80vh] w-full max-w-5xl px-4 py-8">{children}</main>
        <footer className="border-t border-gray-200 py-8 text-center text-sm text-gray-500">
          <div className="flex justify-center gap-6">
            <Link href="/earnings-policy" className="hover:text-ink">Earnings policy</Link>
            <Link href="/terms" className="hover:text-ink">Terms</Link>
            <Link href="/privacy" className="hover:text-ink">Privacy</Link>
          </div>
          <p className="mt-3">EchoBlog — 50% platform · 40% writers · 10% community</p>
        </footer>
      </body>
    </html>
  );
  return clerkEnabled ? <ClerkProvider>{body}</ClerkProvider> : body;
}
