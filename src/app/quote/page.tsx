import type { Metadata } from "next";
import { QuoteCalculator } from "@/components/QuoteCalculator";

export const metadata: Metadata = {
  title: "Instant Label Quote Calculator | Ocean Label",
  description:
    "Get an instant label printing price estimate. Select material, size, quantity, colors, and finish — receive a ballpark quote in seconds. Submit for a formal quote.",
};

export default function QuotePage() {
  return (
    <div>
      {/* Hero */}
      <section className="hero-gradient text-white py-12">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-3xl sm:text-4xl font-extrabold mb-3">
            Instant Quote Calculator
          </h1>
          <p className="text-white/80 text-lg">
            Configure your label specs below and get a ballpark price estimate immediately.
            Submit the form for a formal quote — we respond same business day.
          </p>
        </div>
      </section>

      {/* Calculator */}
      <section className="py-12 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <QuoteCalculator />
      </section>

      {/* FAQ */}
      <section className="bg-slate-50 py-16 border-t border-slate-200">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-extrabold text-navy-900 mb-8">Quote FAQ</h2>
          <div className="space-y-6">
            {[
              {
                q: "How accurate is the instant estimate?",
                a: "The calculator gives a ±10–15% ballpark based on material, size, quantity, and finishing. Your final formal quote — which we provide within one business day — may vary based on artwork complexity, custom die requirements, and current material pricing.",
              },
              {
                q: "What's the minimum order quantity?",
                a: "Our standard minimum is 500 labels. For blank (unprinted) labels, minimums can be as low as 250 rolls. Contact us if you need fewer than 500 — we'll advise on the most cost-effective option.",
              },
              {
                q: "How long does printing take?",
                a: "Standard turnaround is 7–10 business days from artwork approval. Rush service (3–5 days) is available for an additional charge on select materials. Contact us for availability.",
              },
              {
                q: "Do you charge plate or setup fees on reorders?",
                a: "No. Once your dies and plates are in our system, repeat orders carry zero setup or plate fees. We store your job specs indefinitely.",
              },
              {
                q: "Can I get a press check or physical sample?",
                a: "Yes. Press-check samples are available for orders over $500. Contact us when requesting your quote to include sample proofing in the timeline.",
              },
            ].map(({ q, a }) => (
              <div key={q} className="border-b border-slate-200 pb-6">
                <h3 className="font-bold text-navy-900 mb-2">{q}</h3>
                <p className="text-slate-600 text-sm leading-relaxed">{a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
