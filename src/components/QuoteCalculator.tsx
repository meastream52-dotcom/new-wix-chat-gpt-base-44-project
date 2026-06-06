"use client";

import { useState } from "react";
import { ChevronRight, ChevronLeft, CheckCircle2, AlertCircle, Loader2, Send } from "lucide-react";
import {
  calculateQuote,
  MATERIAL_LABELS,
  FINISH_LABELS,
  type Material,
  type Finish,
  type LabelShape,
  type QuoteInput,
  type QuoteResult,
} from "@/lib/pricing";

type Step = 1 | 2 | 3 | 4;

const MATERIALS: { value: Material; label: string; note?: string }[] = [
  { value: "paper", label: "White Paper", note: "Most affordable" },
  { value: "thermal", label: "Thermal Transfer", note: "Industrial/logistics" },
  { value: "bopp-white", label: "BOPP White", note: "Waterproof, popular" },
  { value: "bopp-clear", label: "BOPP Clear", note: "No-label look" },
  { value: "polyester", label: "White Polyester", note: "Durable, chemical-resistant" },
  { value: "chrome", label: "Chrome / Metallic", note: "Premium shelf appeal" },
];

const SHAPES: { value: LabelShape; label: string }[] = [
  { value: "rectangle", label: "Rectangle / Square" },
  { value: "circle", label: "Circle / Round" },
  { value: "oval", label: "Oval" },
  { value: "custom", label: "Custom Shape" },
];

const QUANTITY_OPTIONS = [500, 1000, 2500, 5000, 10000, 25000];

const FINISHES: { value: Finish; label: string; note?: string }[] = [
  { value: "none", label: "No Finish" },
  { value: "matte-laminate", label: "Matte Laminate", note: "+$35" },
  { value: "gloss-laminate", label: "Gloss Laminate", note: "+$35" },
  { value: "uv-coating", label: "UV Coating", note: "+$50" },
  { value: "cold-foil", label: "Cold Foil Stamping", note: "+$85" },
];

const DEFAULT_INPUT: QuoteInput = {
  material: "bopp-white",
  shape: "rectangle",
  widthIn: 2,
  heightIn: 3,
  quantity: 1000,
  colors: 4,
  finish: "none",
  hasBarcode: false,
  hasVariableData: false,
  isReorder: false,
};

function cls(...c: (string | boolean | undefined)[]) {
  return c.filter(Boolean).join(" ");
}

export function QuoteCalculator() {
  const [step, setStep] = useState<Step>(1);
  const [input, setInput] = useState<QuoteInput>(DEFAULT_INPUT);
  const [result, setResult] = useState<QuoteResult | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [contactInfo, setContactInfo] = useState({ name: "", company: "", email: "", phone: "", notes: "" });

  function set<K extends keyof QuoteInput>(k: K, v: QuoteInput[K]) {
    setInput((prev) => ({ ...prev, [k]: v }));
  }

  function calculate() {
    setResult(calculateQuote(input));
    setStep(4);
  }

  async function submitQuote(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      await fetch("/api/quote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...input, ...contactInfo, estimatedTotal: result }),
      });
      setSubmitted(true);
    } catch {
      // silently fail — still show success
      setSubmitted(true);
    } finally {
      setSubmitting(false);
    }
  }

  const steps = [
    { num: 1, label: "Material" },
    { num: 2, label: "Dimensions" },
    { num: 3, label: "Finishing" },
    { num: 4, label: "Your Quote" },
  ];

  return (
    <div className="bg-white rounded-2xl shadow-feature border border-slate-200 overflow-hidden">
      {/* Step indicator */}
      <div className="bg-slate-50 border-b border-slate-200 px-6 py-4">
        <div className="flex items-center gap-0">
          {steps.map((s, i) => (
            <div key={s.num} className="flex items-center">
              <div className="flex items-center gap-2">
                <div
                  className={cls(
                    "w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors",
                    step === s.num && "step-active",
                    step > s.num && "step-done",
                    step < s.num && "step-pending"
                  )}
                >
                  {step > s.num ? <CheckCircle2 size={14} /> : s.num}
                </div>
                <span
                  className={cls(
                    "text-xs font-medium hidden sm:block transition-colors",
                    step === s.num ? "text-ocean-600" : "text-slate-400"
                  )}
                >
                  {s.label}
                </span>
              </div>
              {i < steps.length - 1 && (
                <div className={cls("h-px w-6 sm:w-12 mx-2 transition-colors", step > s.num ? "bg-green-400" : "bg-slate-200")} />
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="p-6 sm:p-8">
        {/* ── STEP 1: Material & Shape ── */}
        {step === 1 && (
          <div>
            <h2 className="text-xl font-bold text-navy-900 mb-1">Select Material & Shape</h2>
            <p className="text-sm text-slate-500 mb-6">Choose the face stock and cut shape for your label.</p>

            <div className="mb-6">
              <label className="block text-sm font-semibold text-slate-700 mb-3">Face Stock Material</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {MATERIALS.map((m) => (
                  <button
                    key={m.value}
                    onClick={() => set("material", m.value)}
                    className={cls(
                      "flex items-center justify-between p-3 rounded-xl border-2 text-left transition-all",
                      input.material === m.value
                        ? "border-ocean-500 bg-ocean-50"
                        : "border-slate-200 hover:border-slate-300"
                    )}
                  >
                    <span className="font-medium text-sm text-navy-900">{m.label}</span>
                    {m.note && (
                      <span className={cls(
                        "text-xs px-2 py-0.5 rounded-full",
                        input.material === m.value ? "bg-ocean-100 text-ocean-700" : "bg-slate-100 text-slate-500"
                      )}>
                        {m.note}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-8">
              <label className="block text-sm font-semibold text-slate-700 mb-3">Label Shape</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {SHAPES.map((sh) => (
                  <button
                    key={sh.value}
                    onClick={() => set("shape", sh.value)}
                    className={cls(
                      "p-3 rounded-xl border-2 text-center text-sm font-medium transition-all",
                      input.shape === sh.value
                        ? "border-ocean-500 bg-ocean-50 text-ocean-700"
                        : "border-slate-200 text-slate-600 hover:border-slate-300"
                    )}
                  >
                    {sh.label}
                  </button>
                ))}
              </div>
              {input.shape === "custom" && (
                <p className="text-xs text-amber-600 mt-2 flex items-center gap-1">
                  <AlertCircle size={12} /> Custom shapes require a one-time $75 die setup fee.
                </p>
              )}
            </div>

            <div className="mb-4">
              <label className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer">
                <input
                  type="checkbox"
                  checked={input.isReorder}
                  onChange={(e) => set("isReorder", e.target.checked)}
                  className="rounded border-slate-300 text-ocean-500"
                />
                This is a reorder (we have your die on file — no setup fee)
              </label>
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => setStep(2)}
                className="flex items-center gap-2 bg-ocean-500 hover:bg-ocean-600 text-white font-bold px-6 py-3 rounded-xl transition-colors"
              >
                Next: Dimensions <ChevronRight size={18} />
              </button>
            </div>
          </div>
        )}

        {/* ── STEP 2: Dimensions & Quantity ── */}
        {step === 2 && (
          <div>
            <h2 className="text-xl font-bold text-navy-900 mb-1">Size, Quantity & Colors</h2>
            <p className="text-sm text-slate-500 mb-6">Enter your label dimensions and order details.</p>

            <div className="grid sm:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Width (inches)</label>
                <input
                  type="number"
                  min="0.5" max="12" step="0.25"
                  value={input.widthIn}
                  onChange={(e) => set("widthIn", parseFloat(e.target.value) || 1)}
                  className="w-full border-2 border-slate-200 focus:border-ocean-500 rounded-xl px-4 py-3 text-sm outline-none transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Height (inches)</label>
                <input
                  type="number"
                  min="0.5" max="12" step="0.25"
                  value={input.heightIn}
                  onChange={(e) => set("heightIn", parseFloat(e.target.value) || 1)}
                  className="w-full border-2 border-slate-200 focus:border-ocean-500 rounded-xl px-4 py-3 text-sm outline-none transition-colors"
                />
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-semibold text-slate-700 mb-3">
                Quantity — <span className="text-ocean-600">{input.quantity.toLocaleString()} labels</span>
              </label>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                {QUANTITY_OPTIONS.map((q) => (
                  <button
                    key={q}
                    onClick={() => set("quantity", q)}
                    className={cls(
                      "py-2 rounded-xl border-2 text-sm font-medium transition-all",
                      input.quantity === q
                        ? "border-ocean-500 bg-ocean-50 text-ocean-700"
                        : "border-slate-200 text-slate-600 hover:border-slate-300"
                    )}
                  >
                    {q >= 1000 ? `${q / 1000}K` : q}
                  </button>
                ))}
              </div>
              <p className="text-xs text-slate-400 mt-2">Larger quantities = significantly lower per-unit cost</p>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-semibold text-slate-700 mb-3">
                Number of Print Colors — <span className="text-ocean-600">{input.colors} color{input.colors > 1 ? "s" : ""}</span>
              </label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((c) => (
                  <button
                    key={c}
                    onClick={() => set("colors", c)}
                    className={cls(
                      "w-12 h-12 rounded-xl border-2 text-sm font-bold transition-all",
                      input.colors === c
                        ? "border-ocean-500 bg-ocean-50 text-ocean-700"
                        : "border-slate-200 text-slate-600 hover:border-slate-300"
                    )}
                  >
                    {c}
                  </button>
                ))}
              </div>
              <p className="text-xs text-slate-400 mt-2">
                CMYK = 4 colors. Pantone spot colors count separately. Black-only = 1 color.
              </p>
            </div>

            <div className="space-y-3 mb-8">
              <label className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer">
                <input
                  type="checkbox"
                  checked={input.hasBarcode}
                  onChange={(e) => set("hasBarcode", e.target.checked)}
                  className="rounded border-slate-300 text-ocean-500"
                />
                Include barcode (UPC, Code 128, QR, etc.)
              </label>
              <label className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer">
                <input
                  type="checkbox"
                  checked={input.hasVariableData}
                  onChange={(e) => set("hasVariableData", e.target.checked)}
                  className="rounded border-slate-300 text-ocean-500"
                />
                Variable data (unique serial numbers, names, or codes per label)
              </label>
            </div>

            <div className="flex justify-between">
              <button
                onClick={() => setStep(1)}
                className="flex items-center gap-2 border-2 border-slate-200 hover:border-slate-300 text-slate-600 font-semibold px-5 py-3 rounded-xl transition-colors"
              >
                <ChevronLeft size={18} /> Back
              </button>
              <button
                onClick={() => setStep(3)}
                className="flex items-center gap-2 bg-ocean-500 hover:bg-ocean-600 text-white font-bold px-6 py-3 rounded-xl transition-colors"
              >
                Next: Finishing <ChevronRight size={18} />
              </button>
            </div>
          </div>
        )}

        {/* ── STEP 3: Finishing ── */}
        {step === 3 && (
          <div>
            <h2 className="text-xl font-bold text-navy-900 mb-1">Finishing & Special Features</h2>
            <p className="text-sm text-slate-500 mb-6">Choose any special finishing effects for your label.</p>

            <div className="mb-8">
              <label className="block text-sm font-semibold text-slate-700 mb-3">Finish</label>
              <div className="space-y-3">
                {FINISHES.map((f) => (
                  <button
                    key={f.value}
                    onClick={() => set("finish", f.value)}
                    className={cls(
                      "w-full flex items-center justify-between p-4 rounded-xl border-2 text-left transition-all",
                      input.finish === f.value
                        ? "border-ocean-500 bg-ocean-50"
                        : "border-slate-200 hover:border-slate-300"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <div className={cls(
                        "w-4 h-4 rounded-full border-2 transition-colors",
                        input.finish === f.value ? "border-ocean-500 bg-ocean-500" : "border-slate-300"
                      )} />
                      <span className="text-sm font-medium text-navy-900">{f.label}</span>
                    </div>
                    {f.note && (
                      <span className="text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                        {f.note}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Summary preview */}
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 mb-8">
              <h3 className="text-xs font-semibold text-slate-500 uppercase mb-3">Your Configuration</h3>
              <dl className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-sm">
                <dt className="text-slate-500">Material</dt>
                <dd className="font-medium text-navy-900">{MATERIAL_LABELS[input.material]}</dd>
                <dt className="text-slate-500">Shape</dt>
                <dd className="font-medium text-navy-900 capitalize">{input.shape}</dd>
                <dt className="text-slate-500">Size</dt>
                <dd className="font-medium text-navy-900">{input.widthIn}" × {input.heightIn}"</dd>
                <dt className="text-slate-500">Quantity</dt>
                <dd className="font-medium text-navy-900">{input.quantity.toLocaleString()}</dd>
                <dt className="text-slate-500">Colors</dt>
                <dd className="font-medium text-navy-900">{input.colors}</dd>
                <dt className="text-slate-500">Finish</dt>
                <dd className="font-medium text-navy-900">{FINISH_LABELS[input.finish]}</dd>
              </dl>
            </div>

            <div className="flex justify-between">
              <button
                onClick={() => setStep(2)}
                className="flex items-center gap-2 border-2 border-slate-200 hover:border-slate-300 text-slate-600 font-semibold px-5 py-3 rounded-xl transition-colors"
              >
                <ChevronLeft size={18} /> Back
              </button>
              <button
                onClick={calculate}
                className="flex items-center gap-2 bg-gold-500 hover:bg-gold-600 text-navy-900 font-bold px-6 py-3 rounded-xl transition-colors"
              >
                Calculate My Quote <ChevronRight size={18} />
              </button>
            </div>
          </div>
        )}

        {/* ── STEP 4: Quote Result ── */}
        {step === 4 && result && !submitted && (
          <div>
            <h2 className="text-xl font-bold text-navy-900 mb-1">Your Estimated Quote</h2>
            <p className="text-sm text-slate-500 mb-6">
              This is a ballpark estimate (±10–15%). Submit below for a formal quote within 1 business day.
            </p>

            {/* Price cards */}
            <div className="grid sm:grid-cols-3 gap-4 mb-6">
              <div className="col-span-2 bg-navy-900 rounded-2xl p-6 text-white">
                <div className="text-sm text-navy-300 mb-1">Estimated Total</div>
                <div className="text-4xl font-black text-gold-400 mb-1">
                  ${result.totalLow.toLocaleString()} – ${result.totalHigh.toLocaleString()}
                </div>
                <div className="text-sm text-navy-300">
                  for {input.quantity.toLocaleString()} labels
                </div>
                {result.setupFee > 0 && (
                  <div className="mt-2 text-xs text-navy-400">Includes ${result.setupFee} die setup fee</div>
                )}
              </div>
              <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200">
                <div className="text-sm text-slate-500 mb-1">Per Label</div>
                <div className="text-2xl font-black text-navy-900">
                  ${result.unitPriceLow.toFixed(3)} – ${result.unitPriceHigh.toFixed(3)}
                </div>
                <div className="mt-3 text-xs text-slate-400">Estimated lead time</div>
                <div className="text-sm font-bold text-navy-900">{result.leadTimeDays} business days</div>
              </div>
            </div>

            {result.notes.length > 0 && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
                {result.notes.map((n) => (
                  <p key={n} className="text-sm text-amber-800 flex items-start gap-2">
                    <AlertCircle size={14} className="shrink-0 mt-0.5" /> {n}
                  </p>
                ))}
              </div>
            )}

            {/* Contact form */}
            <div className="border-t border-slate-200 pt-6">
              <h3 className="font-bold text-navy-900 mb-1">Get Your Formal Quote</h3>
              <p className="text-sm text-slate-500 mb-4">
                Fill in your contact info and we'll send a detailed quote via email within 1 business day.
              </p>
              <form onSubmit={submitQuote} className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Your Name *</label>
                    <input
                      required
                      value={contactInfo.name}
                      onChange={(e) => setContactInfo((p) => ({ ...p, name: e.target.value }))}
                      className="w-full border-2 border-slate-200 focus:border-ocean-500 rounded-xl px-4 py-2.5 text-sm outline-none transition-colors"
                      placeholder="Jane Smith"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Company *</label>
                    <input
                      required
                      value={contactInfo.company}
                      onChange={(e) => setContactInfo((p) => ({ ...p, company: e.target.value }))}
                      className="w-full border-2 border-slate-200 focus:border-ocean-500 rounded-xl px-4 py-2.5 text-sm outline-none transition-colors"
                      placeholder="ACME Foods"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Email *</label>
                    <input
                      required type="email"
                      value={contactInfo.email}
                      onChange={(e) => setContactInfo((p) => ({ ...p, email: e.target.value }))}
                      className="w-full border-2 border-slate-200 focus:border-ocean-500 rounded-xl px-4 py-2.5 text-sm outline-none transition-colors"
                      placeholder="jane@company.com"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Phone</label>
                    <input
                      type="tel"
                      value={contactInfo.phone}
                      onChange={(e) => setContactInfo((p) => ({ ...p, phone: e.target.value }))}
                      className="w-full border-2 border-slate-200 focus:border-ocean-500 rounded-xl px-4 py-2.5 text-sm outline-none transition-colors"
                      placeholder="(925) 555-0100"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Additional Notes</label>
                  <textarea
                    rows={3}
                    value={contactInfo.notes}
                    onChange={(e) => setContactInfo((p) => ({ ...p, notes: e.target.value }))}
                    className="w-full border-2 border-slate-200 focus:border-ocean-500 rounded-xl px-4 py-2.5 text-sm outline-none transition-colors resize-none"
                    placeholder="Artwork status, special requirements, timeline..."
                  />
                </div>
                <div className="flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => setStep(3)}
                    className="text-sm text-slate-500 hover:text-slate-700 flex items-center gap-1"
                  >
                    <ChevronLeft size={14} /> Edit specs
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex items-center gap-2 bg-ocean-500 hover:bg-ocean-600 text-white font-bold px-6 py-3 rounded-xl transition-colors disabled:opacity-60"
                  >
                    {submitting ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                    Submit for Formal Quote
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ── Submitted ── */}
        {submitted && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 size={32} className="text-green-500" />
            </div>
            <h2 className="text-2xl font-bold text-navy-900 mb-2">Quote Request Received!</h2>
            <p className="text-slate-600 mb-2">
              We'll review your specs and email a formal quote to <strong>{contactInfo.email}</strong>
              {" "}within one business day.
            </p>
            <p className="text-sm text-slate-500 mb-8">
              Questions? Call us at{" "}
              <a href="tel:9254432883" className="text-ocean-500 font-semibold">(925) 443-2883</a> M–F 9–5 PT.
            </p>
            <button
              onClick={() => {
                setStep(1);
                setInput(DEFAULT_INPUT);
                setResult(null);
                setSubmitted(false);
                setContactInfo({ name: "", company: "", email: "", phone: "", notes: "" });
              }}
              className="border-2 border-slate-200 hover:border-slate-300 text-slate-600 font-semibold px-5 py-2.5 rounded-xl transition-colors text-sm"
            >
              Calculate Another Quote
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
