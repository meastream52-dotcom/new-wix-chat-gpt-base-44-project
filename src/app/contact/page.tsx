"use client";

import { useState } from "react";
import { MapPin, Phone, Mail, Clock, CheckCircle2, Loader2, Upload, X } from "lucide-react";

export default function ContactPage() {
  const [form, setForm] = useState({
    name: "", company: "", email: "", phone: "", subject: "", message: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [file, setFile] = useState<File | null>(null);

  function setField(k: keyof typeof form, v: string) {
    setForm((p) => ({ ...p, [k]: v }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      setSubmitted(true);
    } catch {
      setSubmitted(true);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div>
      {/* Hero */}
      <section className="hero-gradient text-white py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-extrabold mb-3">Contact Ocean Label</h1>
          <p className="text-white/80 text-lg max-w-xl">
            Get in touch for quotes, questions, artwork uploads, or to discuss your label project.
            Real people, real answers — every time.
          </p>
        </div>
      </section>

      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-3 gap-10">
          {/* Contact info */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-navy-900 text-white rounded-2xl p-6">
              <h2 className="font-bold text-lg mb-5">Get in Touch</h2>
              <div className="space-y-5">
                <div className="flex items-start gap-3">
                  <MapPin size={18} className="text-gold-400 shrink-0 mt-0.5" />
                  <div>
                    <div className="font-semibold text-sm mb-1">Visit Us</div>
                    <div className="text-navy-300 text-sm">
                      345 Wright Brothers Ave<br />Livermore, CA 94551<br />
                      <span className="text-navy-400 text-xs">Mailing: P.O. Box 1103, Pleasanton, CA 94566</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Phone size={18} className="text-gold-400 shrink-0 mt-0.5" />
                  <div>
                    <div className="font-semibold text-sm mb-1">Phone</div>
                    <a href="tel:9254432883" className="text-navy-300 hover:text-white text-sm transition-colors">
                      (925) 443-2883
                    </a>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Mail size={18} className="text-gold-400 shrink-0 mt-0.5" />
                  <div>
                    <div className="font-semibold text-sm mb-1">Email</div>
                    <a href="mailto:info@oceanlabel.com" className="text-navy-300 hover:text-white text-sm transition-colors">
                      info@oceanlabel.com
                    </a>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Clock size={18} className="text-gold-400 shrink-0 mt-0.5" />
                  <div>
                    <div className="font-semibold text-sm mb-1">Hours</div>
                    <div className="text-navy-300 text-sm">Mon – Fri<br />9:00 AM – 5:00 PM PT</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gold-50 border border-gold-200 rounded-2xl p-5">
              <h3 className="font-bold text-navy-900 text-sm mb-2">Need a Quote Fast?</h3>
              <p className="text-slate-600 text-sm mb-3">
                Use our instant calculator for an immediate ballpark estimate — no contact info required.
              </p>
              <a
                href="/quote"
                className="block text-center bg-gold-500 hover:bg-gold-600 text-navy-900 font-bold text-sm py-2.5 rounded-xl transition-colors"
              >
                Open Quote Calculator
              </a>
            </div>

            {/* Map placeholder */}
            <div className="rounded-2xl overflow-hidden border border-slate-200 bg-slate-100 h-48 flex items-center justify-center">
              <div className="text-center">
                <MapPin size={32} className="text-slate-400 mx-auto mb-2" />
                <p className="text-sm text-slate-500 font-medium">345 Wright Brothers Ave</p>
                <p className="text-xs text-slate-400">Livermore, CA 94551</p>
                <a
                  href="https://maps.google.com/?q=345+Wright+Brothers+Ave,+Livermore,+CA+94551"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-ocean-500 hover:underline mt-1 block"
                >
                  Open in Google Maps →
                </a>
              </div>
            </div>
          </div>

          {/* Form */}
          <div className="lg:col-span-2">
            {submitted ? (
              <div className="flex flex-col items-center justify-center h-full text-center py-16">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                  <CheckCircle2 size={32} className="text-green-500" />
                </div>
                <h2 className="text-2xl font-bold text-navy-900 mb-2">Message Sent!</h2>
                <p className="text-slate-600 mb-6">
                  Thanks, {form.name}. We'll get back to you at{" "}
                  <strong>{form.email}</strong> within one business day.
                </p>
                <button
                  onClick={() => { setSubmitted(false); setForm({ name: "", company: "", email: "", phone: "", subject: "", message: "" }); }}
                  className="border-2 border-slate-200 text-slate-600 font-semibold px-5 py-2.5 rounded-xl text-sm hover:border-slate-300 transition-colors"
                >
                  Send Another Message
                </button>
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8">
                <h2 className="text-xl font-bold text-navy-900 mb-1">Send a Message</h2>
                <p className="text-sm text-slate-500 mb-6">
                  For quotes, please use the{" "}
                  <a href="/quote" className="text-ocean-500 hover:underline">quote calculator</a> — it's faster.
                  This form is for general inquiries, artwork submission, and questions.
                </p>
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1.5">Name *</label>
                      <input
                        required value={form.name}
                        onChange={(e) => setField("name", e.target.value)}
                        className="w-full border-2 border-slate-200 focus:border-ocean-500 rounded-xl px-4 py-2.5 text-sm outline-none transition-colors"
                        placeholder="Jane Smith"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1.5">Company</label>
                      <input
                        value={form.company}
                        onChange={(e) => setField("company", e.target.value)}
                        className="w-full border-2 border-slate-200 focus:border-ocean-500 rounded-xl px-4 py-2.5 text-sm outline-none transition-colors"
                        placeholder="ACME Foods Inc."
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1.5">Email *</label>
                      <input
                        required type="email" value={form.email}
                        onChange={(e) => setField("email", e.target.value)}
                        className="w-full border-2 border-slate-200 focus:border-ocean-500 rounded-xl px-4 py-2.5 text-sm outline-none transition-colors"
                        placeholder="jane@company.com"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1.5">Phone</label>
                      <input
                        type="tel" value={form.phone}
                        onChange={(e) => setField("phone", e.target.value)}
                        className="w-full border-2 border-slate-200 focus:border-ocean-500 rounded-xl px-4 py-2.5 text-sm outline-none transition-colors"
                        placeholder="(925) 555-0100"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1.5">Subject *</label>
                    <select
                      required value={form.subject}
                      onChange={(e) => setField("subject", e.target.value)}
                      className="w-full border-2 border-slate-200 focus:border-ocean-500 rounded-xl px-4 py-2.5 text-sm outline-none transition-colors bg-white"
                    >
                      <option value="">Select a topic…</option>
                      <option value="quote">Request a Quote</option>
                      <option value="reorder">Reorder Existing Labels</option>
                      <option value="artwork">Submit Artwork / Proof Approval</option>
                      <option value="order-status">Check Order Status</option>
                      <option value="general">General Question</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1.5">Message *</label>
                    <textarea
                      required rows={5} value={form.message}
                      onChange={(e) => setField("message", e.target.value)}
                      className="w-full border-2 border-slate-200 focus:border-ocean-500 rounded-xl px-4 py-2.5 text-sm outline-none transition-colors resize-none"
                      placeholder="Tell us about your label project — material, size, quantity, timeline, and any special requirements…"
                    />
                  </div>

                  {/* Artwork upload */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1.5">Attach Artwork (optional)</label>
                    {file ? (
                      <div className="flex items-center gap-3 border-2 border-slate-200 rounded-xl px-4 py-3">
                        <div className="flex-1 text-sm text-slate-700 truncate">{file.name}</div>
                        <button type="button" onClick={() => setFile(null)} className="text-slate-400 hover:text-red-500 transition-colors">
                          <X size={16} />
                        </button>
                      </div>
                    ) : (
                      <label className="flex items-center gap-3 border-2 border-dashed border-slate-300 hover:border-ocean-400 rounded-xl px-4 py-4 cursor-pointer transition-colors">
                        <Upload size={18} className="text-slate-400" />
                        <span className="text-sm text-slate-500">
                          Click to upload AI, PDF, or EPS (max 25 MB)
                        </span>
                        <input
                          type="file"
                          accept=".ai,.pdf,.eps,.png,.jpg,.jpeg,.tiff"
                          className="hidden"
                          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                        />
                      </label>
                    )}
                    <p className="text-xs text-slate-400 mt-1">
                      For large files, use WeTransfer or Dropbox and include the link in your message.
                    </p>
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full flex items-center justify-center gap-2 bg-ocean-500 hover:bg-ocean-600 text-white font-bold py-3.5 rounded-xl transition-colors disabled:opacity-60"
                  >
                    {submitting ? <Loader2 size={18} className="animate-spin" /> : null}
                    {submitting ? "Sending…" : "Send Message"}
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
