"use client";

import { useState } from "react";
import Link from "next/link";
import { Lock, Package, RefreshCcw, FileText, Phone, CheckCircle2, Loader2 } from "lucide-react";

export default function PortalPage() {
  const [email, setEmail] = useState("");
  const [waitlisted, setWaitlisted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  async function join(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    await new Promise((r) => setTimeout(r, 800));
    setWaitlisted(true);
    setSubmitting(false);
  }

  const PORTAL_FEATURES = [
    {
      icon: Package,
      title: "Order History & Reorders",
      desc: "View all past orders, download invoices, and place reorders in one click — with your specs already saved.",
    },
    {
      icon: RefreshCcw,
      title: "One-Click Reorders",
      desc: "Every job is stored in our system indefinitely. Repeat orders use your saved artwork, die, and specs — no re-setup fees.",
    },
    {
      icon: FileText,
      title: "Digital Proof Approval",
      desc: "Review and approve digital proofs online without printing or scanning — track proof status in real time.",
    },
    {
      icon: Lock,
      title: "Secure Artwork Storage",
      desc: "Your print-ready files are stored securely in our vault, encrypted and backed up, available whenever you need a reprint.",
    },
  ];

  return (
    <div>
      {/* Hero */}
      <section className="hero-gradient text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 bg-gold-500/20 border border-gold-400/30 rounded-full px-4 py-1.5 mb-5">
              <span className="text-gold-300 text-sm font-medium">Coming Soon</span>
            </div>
            <h1 className="text-4xl sm:text-5xl font-extrabold mb-4">
              Customer Portal
            </h1>
            <p className="text-white/80 text-lg leading-relaxed">
              We're building a self-service portal for Ocean Label customers — reorder labels,
              track jobs, approve proofs, and access your artwork vault, 24/7.
            </p>
          </div>
        </div>
      </section>

      {/* Feature preview */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-2xl font-extrabold text-navy-900 mb-8 text-center">What's Coming</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-14">
          {PORTAL_FEATURES.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="bg-white border border-slate-200 rounded-2xl p-6">
              <div className="w-10 h-10 bg-ocean-500/10 rounded-xl flex items-center justify-center mb-4">
                <Icon size={20} className="text-ocean-500" />
              </div>
              <h3 className="font-bold text-navy-900 mb-2 text-sm">{title}</h3>
              <p className="text-xs text-slate-500 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>

        {/* Waitlist */}
        <div className="max-w-lg mx-auto">
          <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-elevated text-center">
            <div className="w-14 h-14 bg-gold-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Lock size={24} className="text-gold-600" />
            </div>
            <h2 className="text-xl font-bold text-navy-900 mb-2">Join the Waitlist</h2>
            <p className="text-slate-500 text-sm mb-6">
              Be the first to get access when the portal launches. Existing customers
              get priority access.
            </p>

            {waitlisted ? (
              <div className="py-4">
                <CheckCircle2 size={40} className="text-green-500 mx-auto mb-3" />
                <h3 className="font-bold text-navy-900 mb-1">You're on the list!</h3>
                <p className="text-sm text-slate-500">
                  We'll email{" "}
                  <strong className="text-navy-900">{email}</strong> when the portal launches.
                </p>
              </div>
            ) : (
              <form onSubmit={join} className="space-y-3">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@company.com"
                  className="w-full border-2 border-slate-200 focus:border-ocean-500 rounded-xl px-4 py-3 text-sm outline-none transition-colors"
                />
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full flex items-center justify-center gap-2 bg-navy-900 hover:bg-navy-800 text-white font-bold py-3 rounded-xl transition-colors disabled:opacity-60"
                >
                  {submitting ? <Loader2 size={16} className="animate-spin" /> : null}
                  {submitting ? "Joining…" : "Join Waitlist"}
                </button>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* Existing customer options */}
      <section className="bg-slate-50 border-t border-slate-200 py-14">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-xl font-bold text-navy-900 mb-3">Need to Reorder Today?</h2>
          <p className="text-slate-500 mb-8">
            While the portal is in development, our team handles reorders quickly by phone or email.
            Reference your previous order number and we'll pull your specs.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="tel:9254432883"
              className="flex items-center gap-2 justify-center bg-navy-900 text-white font-bold px-6 py-3 rounded-xl hover:bg-navy-800 transition-colors"
            >
              <Phone size={18} /> Call (925) 443-2883
            </a>
            <Link
              href="/contact"
              className="flex items-center gap-2 justify-center border-2 border-slate-300 hover:border-slate-400 text-slate-700 font-semibold px-6 py-3 rounded-xl transition-colors"
            >
              <FileText size={18} /> Submit a Reorder Request
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
