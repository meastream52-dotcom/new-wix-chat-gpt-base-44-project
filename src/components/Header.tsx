"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X, ChevronDown } from "lucide-react";

const NAV_LINKS = [
  { label: "Services", href: "/services" },
  { label: "Quote", href: "/quote" },
  { label: "Blog", href: "/blog" },
  { label: "Portal", href: "/portal" },
  { label: "Contact", href: "/contact" },
];

export function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-navy-900 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <div className="w-8 h-8 rounded bg-gold-500 flex items-center justify-center">
              <span className="text-navy-900 font-black text-sm">OL</span>
            </div>
            <div className="leading-tight">
              <div className="text-white font-bold text-lg leading-none">Ocean Label</div>
              <div className="text-navy-200 text-[10px] uppercase tracking-widest leading-none">
                Livermore, CA
              </div>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-6">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-navy-200 hover:text-white text-sm font-medium transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* CTA */}
          <div className="hidden md:flex items-center gap-3">
            <a
              href="tel:9254432883"
              className="text-navy-300 text-sm hover:text-white transition-colors"
            >
              (925) 443-2883
            </a>
            <Link
              href="/quote"
              className="bg-gold-500 hover:bg-gold-600 text-navy-900 font-bold text-sm px-4 py-2 rounded-lg transition-colors"
            >
              Get a Quote
            </Link>
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden text-white p-1"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Nav */}
      {mobileOpen && (
        <div className="md:hidden bg-navy-950 border-t border-navy-800">
          <div className="px-4 py-3 space-y-1">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="block py-2 text-navy-200 hover:text-white text-sm font-medium"
                onClick={() => setMobileOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <div className="pt-3 border-t border-navy-800">
              <Link
                href="/quote"
                className="block bg-gold-500 text-navy-900 font-bold text-sm px-4 py-2 rounded-lg text-center"
                onClick={() => setMobileOpen(false)}
              >
                Get a Quote
              </Link>
              <a
                href="tel:9254432883"
                className="block text-center text-navy-300 text-sm mt-2 py-1"
              >
                (925) 443-2883
              </a>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
