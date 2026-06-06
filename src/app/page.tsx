import Link from "next/link";
import {
  CheckCircle2, ArrowRight, Star, Shield, Zap, Users, Package, Printer, Barcode, Layers,
  FlaskConical, Award, Phone, Clock, MapPin,
} from "lucide-react";

const CLIENTS = [
  "Microsoft", "Sony", "PlayStation", "Capcom", "Electronic Arts",
  "Hewlett Packard", "General Mills", "Safeway", "Orchard Valley Harvest",
  "Arvato", "Alom", "Elaine's Toffee", "Juice Organics", "Pacific Color Graphics",
];

const SERVICES = [
  {
    icon: Printer,
    title: "Flexographic Printing",
    desc: "Up to 5-color precision printing on rolls. Consistent color, sharp detail, competitive pricing at volume.",
  },
  {
    icon: Package,
    title: "Pressure Sensitive Labels",
    desc: "Die-cut labels that adhere to virtually any surface. BOPP, polyester, paper, and chrome stocks available.",
  },
  {
    icon: FlaskConical,
    title: "Food & Nutritional Labels",
    desc: "FDA-compliant nutrition facts panels, ingredient lists, and brand labels for food and beverage companies.",
  },
  {
    icon: Barcode,
    title: "Variable Data & Barcodes",
    desc: "1D/2D barcodes, QR codes, sequential numbering, and full variable data printing in a single pass.",
  },
  {
    icon: Layers,
    title: "Special Finishes",
    desc: "Cold foil stamping, UV coating (matte/gloss), laminating, and thermal transfer for premium shelf appeal.",
  },
  {
    icon: Award,
    title: "Custom Die-Cut",
    desc: "Any shape — round, oval, rectangle, or fully custom. Two-sided printing, sheeting, and fanfolding available.",
  },
];

const STATS = [
  { value: "25+", label: "Years in Business" },
  { value: "500+", label: "B2B Clients Served" },
  { value: "5", label: "Color Printing" },
  { value: "Same Day", label: "Quote Turnaround" },
];

const STEPS = [
  { num: "01", title: "Upload Your Art", desc: "Send us your print-ready files (AI, PDF, EPS) or let us know if you need a design referral." },
  { num: "02", title: "Get Your Quote", desc: "Use our instant calculator or request a formal quote. We respond same business day." },
  { num: "03", title: "Approve Your Proof", desc: "Review a digital proof and approve. Physical press-check samples available on request." },
  { num: "04", title: "Print & Ship", desc: "We print on our flexographic presses and ship via FedEx/UPS direct to your door." },
];

const TRUST_POINTS = [
  "No hidden plate or setup fees on repeat orders",
  "Pantone color matching available",
  "FedEx & UPS shipping tracked from our dock",
  "Food-grade inks available for direct-contact labels",
  "Quality inspected before every shipment",
  "Family-run shop — talk to a real person every time",
];

export default function HomePage() {
  return (
    <div className="flex flex-col">
      {/* ── Hero ── */}
      <section className="hero-gradient text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-5" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32 relative">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-1.5 mb-6">
              <Star size={14} className="text-gold-400 fill-gold-400" />
              <span className="text-sm text-white/90">Serving the Bay Area since 1999</span>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight mb-6">
              Premium Label Printing<br />
              <span className="text-gold-400">Built for Business</span>
            </h1>
            <p className="text-lg sm:text-xl text-white/80 mb-8 max-w-2xl leading-relaxed">
              Ocean Label is a family-owned flexographic label printer in Livermore, CA.
              We print pressure-sensitive labels for brands from Silicon Valley startups
              to Fortune 500 companies — with the quality and service they demand.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="/quote"
                className="bg-gold-500 hover:bg-gold-600 text-navy-900 font-bold px-8 py-4 rounded-xl text-lg transition-colors inline-flex items-center gap-2 justify-center"
              >
                Get Instant Quote <ArrowRight size={20} />
              </Link>
              <a
                href="tel:9254432883"
                className="border-2 border-white/40 hover:border-white text-white font-semibold px-8 py-4 rounded-xl text-lg transition-colors inline-flex items-center gap-2 justify-center"
              >
                <Phone size={20} /> (925) 443-2883
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats bar ── */}
      <section className="bg-navy-950 text-white py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {STATS.map(({ value, label }) => (
              <div key={label} className="text-center">
                <div className="text-2xl sm:text-3xl font-extrabold text-gold-400">{value}</div>
                <div className="text-xs sm:text-sm text-navy-300 mt-1">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Client Logos ── */}
      <section className="bg-slate-50 py-12 border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-sm font-semibold text-slate-500 uppercase tracking-widest mb-8">
            Trusted by Industry Leaders
          </p>
          <div className="flex flex-wrap justify-center gap-x-8 gap-y-4">
            {CLIENTS.map((client) => (
              <span
                key={client}
                className="text-slate-400 font-semibold text-sm sm:text-base hover:text-slate-600 transition-colors"
              >
                {client}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── Services Grid ── */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-navy-900 mb-4">
            What We Print
          </h2>
          <p className="text-lg text-slate-500 max-w-2xl mx-auto">
            Full-service flexographic printing — from single-color thermal labels to
            5-color cold-foil premium rolls.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {SERVICES.map(({ icon: Icon, title, desc }) => (
            <div
              key={title}
              className="bg-white border border-slate-200 rounded-2xl p-6 hover:shadow-elevated hover:border-ocean-500/30 transition-all group"
            >
              <div className="w-12 h-12 bg-ocean-500/10 rounded-xl flex items-center justify-center mb-4 group-hover:bg-ocean-500/20 transition-colors">
                <Icon size={22} className="text-ocean-500" />
              </div>
              <h3 className="font-bold text-navy-900 mb-2">{title}</h3>
              <p className="text-sm text-slate-500 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
        <div className="text-center mt-8">
          <Link
            href="/services"
            className="inline-flex items-center gap-2 text-ocean-500 font-semibold hover:text-ocean-700 transition-colors"
          >
            View all capabilities <ArrowRight size={16} />
          </Link>
        </div>
      </section>

      {/* ── How It Works ── */}
      <section className="bg-slate-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-navy-900 mb-4">
              From Artwork to Your Door
            </h2>
            <p className="text-lg text-slate-500 max-w-xl mx-auto">
              Our streamlined process keeps your project on schedule with full visibility at every step.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {STEPS.map(({ num, title, desc }) => (
              <div key={num} className="relative">
                <div className="bg-white rounded-2xl p-6 border border-slate-200 h-full">
                  <div className="text-4xl font-black text-slate-100 mb-3">{num}</div>
                  <h3 className="font-bold text-navy-900 mb-2">{title}</h3>
                  <p className="text-sm text-slate-500 leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Why Ocean Label ── */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-navy-900 mb-6">
                Why Brands Choose<br />Ocean Label
              </h2>
              <p className="text-lg text-slate-500 mb-8 leading-relaxed">
                We're not a faceless e-commerce sticker shop. We're a family-run shop
                where Dennis Brennan and the team personally handle your account.
                Enterprise quality without enterprise friction.
              </p>
              <ul className="space-y-3">
                {TRUST_POINTS.map((point) => (
                  <li key={point} className="flex items-start gap-3">
                    <CheckCircle2 size={18} className="text-green-500 shrink-0 mt-0.5" />
                    <span className="text-slate-700 text-sm">{point}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-8 flex gap-4">
                <Link
                  href="/quote"
                  className="bg-ocean-500 hover:bg-ocean-600 text-white font-bold px-6 py-3 rounded-xl transition-colors"
                >
                  Get a Quote
                </Link>
                <Link
                  href="/contact"
                  className="border-2 border-slate-300 hover:border-ocean-500 text-slate-700 font-semibold px-6 py-3 rounded-xl transition-colors"
                >
                  Contact Us
                </Link>
              </div>
            </div>

            {/* Contact card */}
            <div className="bg-navy-900 rounded-2xl p-8 text-white">
              <h3 className="text-xl font-bold mb-6">Reach Us Directly</h3>
              <div className="space-y-5">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-gold-500/20 rounded-xl flex items-center justify-center shrink-0">
                    <MapPin size={18} className="text-gold-400" />
                  </div>
                  <div>
                    <div className="font-semibold text-sm mb-1">Visit Us</div>
                    <div className="text-navy-300 text-sm">345 Wright Brothers Ave<br />Livermore, CA 94551</div>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-gold-500/20 rounded-xl flex items-center justify-center shrink-0">
                    <Phone size={18} className="text-gold-400" />
                  </div>
                  <div>
                    <div className="font-semibold text-sm mb-1">Call Us</div>
                    <a href="tel:9254432883" className="text-navy-300 text-sm hover:text-white transition-colors">
                      (925) 443-2883
                    </a>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-gold-500/20 rounded-xl flex items-center justify-center shrink-0">
                    <Clock size={18} className="text-gold-400" />
                  </div>
                  <div>
                    <div className="font-semibold text-sm mb-1">Business Hours</div>
                    <div className="text-navy-300 text-sm">Monday – Friday, 9:00 AM – 5:00 PM PT</div>
                  </div>
                </div>
              </div>
              <div className="mt-8 pt-6 border-t border-navy-800">
                <p className="text-sm text-navy-300 mb-4">
                  Need a quote outside business hours? Our AI assistant and online
                  calculator are available 24/7.
                </p>
                <Link
                  href="/quote"
                  className="block text-center bg-gold-500 hover:bg-gold-600 text-navy-900 font-bold py-3 rounded-xl transition-colors"
                >
                  Try the Quote Calculator
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Blog Preview ── */}
      <section className="bg-slate-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-10">
            <div>
              <h2 className="text-3xl font-extrabold text-navy-900 mb-2">Label Printing Insights</h2>
              <p className="text-slate-500">Tips, trends, and industry knowledge from our team.</p>
            </div>
            <Link href="/blog" className="hidden sm:flex items-center gap-1 text-ocean-500 font-semibold hover:text-ocean-700 text-sm">
              All posts <ArrowRight size={14} />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              {
                cat: "Materials",
                title: "BOPP vs. Paper Labels: Which Is Right for Your Product?",
                date: "Jun 2, 2026",
                read: "4 min read",
              },
              {
                cat: "Compliance",
                title: "FDA Nutrition Facts Label Requirements in 2026: What's Changed",
                date: "May 28, 2026",
                read: "6 min read",
              },
              {
                cat: "Design",
                title: "Cold Foil Stamping: When to Use It and How Much It Costs",
                date: "May 15, 2026",
                read: "5 min read",
              },
            ].map((post) => (
              <Link
                key={post.title}
                href="/blog"
                className="bg-white rounded-2xl border border-slate-200 p-6 hover:shadow-elevated hover:border-ocean-500/30 transition-all group"
              >
                <span className="text-xs font-semibold text-ocean-500 uppercase tracking-wider">{post.cat}</span>
                <h3 className="font-bold text-navy-900 mt-2 mb-3 leading-snug group-hover:text-ocean-600 transition-colors">
                  {post.title}
                </h3>
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <span>{post.date}</span>
                  <span>·</span>
                  <span>{post.read}</span>
                </div>
              </Link>
            ))}
          </div>
          <div className="text-center mt-6 sm:hidden">
            <Link href="/blog" className="text-ocean-500 font-semibold text-sm">
              View all posts →
            </Link>
          </div>
        </div>
      </section>

      {/* ── Final CTA ── */}
      <section className="hero-gradient text-white py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-extrabold mb-4">
            Ready to see your label come to life?
          </h2>
          <p className="text-lg text-white/80 mb-8">
            Get an instant price estimate in under 2 minutes — no account required.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/quote"
              className="bg-gold-500 hover:bg-gold-600 text-navy-900 font-bold px-8 py-4 rounded-xl text-lg transition-colors inline-flex items-center gap-2 justify-center"
            >
              Start Your Quote <ArrowRight size={20} />
            </Link>
            <Link
              href="/contact"
              className="border-2 border-white/40 hover:border-white text-white font-semibold px-8 py-4 rounded-xl text-lg transition-colors"
            >
              Talk to a Human
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
