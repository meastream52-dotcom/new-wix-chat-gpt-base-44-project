import Link from "next/link";
import { Phone, Mail, MapPin, Clock } from "lucide-react";

const SERVICES = [
  "Pressure Sensitive Labels",
  "Food & Nutritional Labels",
  "Flexographic Printing",
  "Custom Die-Cut Labels",
  "Cold Foil Stamping",
  "Variable Data / Barcodes",
  "UV Coating & Laminates",
  "Thermal Transfer Labels",
];

const QUICK_LINKS = [
  { label: "Get a Quote", href: "/quote" },
  { label: "Our Services", href: "/services" },
  { label: "Customer Portal", href: "/portal" },
  { label: "Blog", href: "/blog" },
  { label: "Contact Us", href: "/contact" },
];

export function Footer() {
  return (
    <footer className="bg-navy-900 text-navy-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          {/* Brand */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded bg-gold-500 flex items-center justify-center">
                <span className="text-navy-900 font-black text-sm">OL</span>
              </div>
              <span className="text-white font-bold text-lg">Ocean Label</span>
            </div>
            <p className="text-sm leading-relaxed mb-4">
              Family-owned flexographic label printer serving Bay Area businesses and
              Fortune 500 companies for over 25 years. Quality you can trust, turnaround
              you can count on.
            </p>
            <div className="flex items-center gap-2 text-sm">
              <div className="w-2 h-2 rounded-full bg-green-400" />
              <span>Accepting new orders</span>
            </div>
          </div>

          {/* Services */}
          <div>
            <h3 className="text-white font-semibold text-sm uppercase tracking-wider mb-4">
              Services
            </h3>
            <ul className="space-y-2">
              {SERVICES.map((s) => (
                <li key={s}>
                  <Link href="/services" className="text-sm hover:text-white transition-colors">
                    {s}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold text-sm uppercase tracking-wider mb-4">
              Quick Links
            </h3>
            <ul className="space-y-2">
              {QUICK_LINKS.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-sm hover:text-white transition-colors">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
            <div className="mt-6">
              <h3 className="text-white font-semibold text-sm uppercase tracking-wider mb-3">
                Notable Clients
              </h3>
              <p className="text-xs leading-relaxed text-navy-300">
                Microsoft · Sony · PlayStation · Capcom · Electronic Arts · HP ·
                General Mills · Safeway · Orchard Valley Harvest
              </p>
            </div>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-white font-semibold text-sm uppercase tracking-wider mb-4">
              Contact
            </h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <MapPin size={16} className="mt-0.5 shrink-0 text-gold-500" />
                <span className="text-sm">
                  345 Wright Brothers Ave<br />
                  Livermore, CA 94551<br />
                  <span className="text-navy-400">P.O. Box 1103, Pleasanton, CA 94566</span>
                </span>
              </li>
              <li className="flex items-center gap-3">
                <Phone size={16} className="shrink-0 text-gold-500" />
                <a href="tel:9254432883" className="text-sm hover:text-white transition-colors">
                  (925) 443-2883
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Mail size={16} className="shrink-0 text-gold-500" />
                <a href="mailto:info@oceanlabel.com" className="text-sm hover:text-white transition-colors">
                  info@oceanlabel.com
                </a>
              </li>
              <li className="flex items-start gap-3">
                <Clock size={16} className="mt-0.5 shrink-0 text-gold-500" />
                <span className="text-sm">
                  Mon – Fri: 9:00 AM – 5:00 PM<br />
                  <span className="text-navy-400">Pacific Time</span>
                </span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-navy-800 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-navy-400">
            © {new Date().getFullYear()} Ocean Label. All rights reserved. Livermore, California.
          </p>
          <div className="flex gap-4 text-xs text-navy-400">
            <Link href="/contact" className="hover:text-white transition-colors">Privacy Policy</Link>
            <Link href="/contact" className="hover:text-white transition-colors">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
