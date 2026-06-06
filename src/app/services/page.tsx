import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, CheckCircle2 } from "lucide-react";

export const metadata: Metadata = {
  title: "Label Printing Services | Ocean Label",
  description:
    "Full-service flexographic label printing: pressure-sensitive, food labels, die-cut, barcode, cold foil, thermal transfer. 5-color printing on any material.",
};

const SERVICES = [
  {
    id: "pressure-sensitive",
    title: "Pressure Sensitive Labels",
    subtitle: "Our Core Product",
    desc: "Pressure-sensitive labels are the workhorses of product packaging. They adhere on contact to glass, plastic, metal, cardboard, and most other substrates without water or heat activation. We print on rolls for high-speed automated application or in sheets for hand-application.",
    specs: [
      "Roll and sheet formats available",
      "White, clear, or metallic face stocks",
      "Permanent, removable, or repositionable adhesives",
      "Liner options: layflat, silicone-coated, PET",
      "Any quantity from 500 to 1 million+",
    ],
    materials: ["White Paper", "BOPP White/Clear", "White Polyester", "Chrome Metallic", "Thermal Transfer"],
  },
  {
    id: "flexographic",
    title: "Flexographic Printing",
    subtitle: "Up to 5 Colors",
    desc: "Our flexographic presses deliver consistent, high-quality printing across long runs. We support spot Pantone colors for precise brand matching, process CMYK for photo-realistic imagery, and UV-curable inks for maximum durability.",
    specs: [
      "1–5 color printing per job",
      "Pantone (PMS) spot color matching",
      "UV-curable and water-based inks",
      "Tight registration tolerances",
      "Consistent color across the entire run",
    ],
    materials: ["All label stocks", "Film materials", "Foil stocks"],
  },
  {
    id: "food-labels",
    title: "Food & Nutritional Labels",
    subtitle: "FDA-Compliant",
    desc: "We produce FDA-compliant nutritional facts panels, ingredient lists, allergen statements, and brand labels for food, beverage, supplement, and nutraceutical companies. Our food-grade inks and materials meet applicable FDA and USDA guidelines.",
    specs: [
      "FDA Nutrition Facts panel layouts",
      "Ingredient & allergen compliance",
      "Food-safe, non-migratory inks",
      "Best-by date and lot code printing",
      "Tamper-evident options available",
    ],
    materials: ["Food-grade BOPP", "Matte paper", "Kraft paper"],
  },
  {
    id: "die-cut",
    title: "Custom Die-Cut Labels",
    subtitle: "Any Shape",
    desc: "Move beyond rectangles. We produce labels in virtually any shape — round, oval, arch, scallop, or fully custom die-cut contours. New dies are cut with precision for clean edges; repeat orders use your stored die at no added cost.",
    specs: [
      "Standard shapes: circle, oval, rectangle, square",
      "Custom die shapes available",
      "$75 one-time die setup (waived on repeats)",
      "Tight tolerances on high-speed cut-and-stack",
      "Sheeted or fanfolded for pin-fed systems",
    ],
    materials: ["All label stocks"],
  },
  {
    id: "variable-data",
    title: "Variable Data & Barcodes",
    subtitle: "Unique Per Label",
    desc: "We combine flexographic printing with digital variable data to produce labels where each unit can carry unique information — sequential barcodes, unique QR codes, personalized names, lot codes, or expiry dates — all in a single production pass.",
    specs: [
      "1D barcodes: UPC, Code 128, EAN, ITF",
      "2D barcodes: QR Code, Data Matrix, PDF417",
      "Sequential numbering",
      "Variable text and graphics",
      "GS1 standards supported",
    ],
    materials: ["Paper", "BOPP White", "Thermal Transfer"],
  },
  {
    id: "finishes",
    title: "Special Finishes & Effects",
    subtitle: "Premium Shelf Appeal",
    desc: "Elevate your label with premium finishing that stands out on the shelf. Our in-house capabilities include cold foil stamping for metallic accents, UV coating for gloss or matte effects, and lamination for added durability and scuff resistance.",
    specs: [
      "Cold foil stamping (gold, silver, holographic)",
      "Gloss UV coating",
      "Matte UV coating",
      "Gloss lamination",
      "Matte lamination",
      "Soft-touch matte lamination",
    ],
    materials: ["All label stocks (application-dependent)"],
  },
  {
    id: "thermal",
    title: "Thermal Transfer Labels",
    subtitle: "Industrial & Logistics",
    desc: "Thermal transfer labels use a heated printhead and ribbon to produce highly durable, smear-resistant text and barcodes. Essential for warehouse operations, shipping labels, inventory tags, and any environment with heat, moisture, or abrasion exposure.",
    specs: [
      "Excellent chemical and abrasion resistance",
      "Wide operating temperature range",
      "Compatible with Zebra, Datamax, SATO printers",
      "Coreless and standard core options",
      "Fanfolded for desktop printers",
    ],
    materials: ["Thermal Transfer Coated Paper", "Polyester TT"],
  },
  {
    id: "blank",
    title: "Blank & Stock Labels",
    subtitle: "Fast & Affordable",
    desc: "Need unprinted labels for in-house printing or testing? We supply blank rolls in any standard size, any material, and any core size — typically with faster turnaround and lower minimums than custom printed labels.",
    specs: [
      "Any size and shape available",
      "White, clear, chrome, or kraft",
      "All core sizes: 1\", 1.5\", 3\"",
      "Perforated, sheeted, or continuous roll",
      "Low minimums starting at 250 labels",
    ],
    materials: ["All stocks"],
  },
];

export default function ServicesPage() {
  return (
    <div>
      {/* Hero */}
      <section className="hero-gradient text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <h1 className="text-4xl sm:text-5xl font-extrabold mb-4">
              Full-Service Label Printing
            </h1>
            <p className="text-lg text-white/80 mb-6">
              From simple single-color paper labels to 5-color cold-foil premium rolls —
              Ocean Label handles the entire label spectrum for B2B companies.
            </p>
            <Link
              href="/quote"
              className="inline-flex items-center gap-2 bg-gold-500 hover:bg-gold-600 text-navy-900 font-bold px-6 py-3 rounded-xl transition-colors"
            >
              Get a Quote <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>

      {/* Specs banner */}
      <section className="bg-slate-50 border-b border-slate-200 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
            {[
              { value: "500+", label: "Min. Order (most items)" },
              { value: "5", label: "Max Colors" },
              { value: "7–14", label: "Typical Turnaround (days)" },
              { value: "Any", label: "Label Shape" },
            ].map(({ value, label }) => (
              <div key={label}>
                <div className="text-2xl font-extrabold text-navy-900">{value}</div>
                <div className="text-sm text-slate-500 mt-1">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services detail */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="space-y-16">
          {SERVICES.map((svc, i) => (
            <div
              key={svc.id}
              id={svc.id}
              className={`grid lg:grid-cols-2 gap-10 items-start ${
                i % 2 === 1 ? "lg:flex-row-reverse" : ""
              }`}
            >
              <div>
                <span className="text-xs font-semibold text-ocean-500 uppercase tracking-wider">
                  {svc.subtitle}
                </span>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-navy-900 mt-1 mb-4">
                  {svc.title}
                </h2>
                <p className="text-slate-600 leading-relaxed mb-6">{svc.desc}</p>
                <Link
                  href="/quote"
                  className="inline-flex items-center gap-1 text-ocean-500 font-semibold hover:text-ocean-700 text-sm"
                >
                  Get a quote for this service <ArrowRight size={14} />
                </Link>
              </div>
              <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200">
                <h3 className="font-bold text-navy-900 text-sm uppercase tracking-wider mb-4">
                  Specifications
                </h3>
                <ul className="space-y-2 mb-6">
                  {svc.specs.map((spec) => (
                    <li key={spec} className="flex items-start gap-2">
                      <CheckCircle2 size={15} className="text-green-500 shrink-0 mt-0.5" />
                      <span className="text-sm text-slate-700">{spec}</span>
                    </li>
                  ))}
                </ul>
                <div className="border-t border-slate-200 pt-4">
                  <div className="text-xs font-semibold text-slate-500 uppercase mb-2">Available Materials</div>
                  <div className="flex flex-wrap gap-2">
                    {svc.materials.map((m) => (
                      <span key={m} className="text-xs bg-navy-900/5 text-navy-900 px-2 py-1 rounded-full font-medium">
                        {m}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-navy-900 py-16 text-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-extrabold mb-4">Need a custom solution?</h2>
          <p className="text-navy-300 mb-8">
            Our team handles specialty requests, tight tolerances, and unusual substrates.
            Describe your project and we'll advise on the best approach.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/quote"
              className="bg-gold-500 hover:bg-gold-600 text-navy-900 font-bold px-6 py-3 rounded-xl transition-colors"
            >
              Get a Quote
            </Link>
            <Link
              href="/contact"
              className="border-2 border-white/30 hover:border-white text-white font-semibold px-6 py-3 rounded-xl transition-colors"
            >
              Talk to Our Team
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
