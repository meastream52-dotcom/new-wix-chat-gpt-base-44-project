import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Clock, Tag } from "lucide-react";

export const metadata: Metadata = {
  title: "Label Printing Blog | Ocean Label",
  description:
    "Expert insights on label materials, compliance, design, and printing best practices from the Ocean Label team.",
};

const POSTS = [
  {
    slug: "bopp-vs-paper-labels",
    category: "Materials",
    title: "BOPP vs. Paper Labels: Which Is Right for Your Product?",
    excerpt:
      "BOPP (biaxially-oriented polypropylene) and paper are the two most common label face stocks. Here's a practical guide to choosing between them based on your application, environment, and budget.",
    date: "June 2, 2026",
    readTime: "4 min read",
    featured: true,
  },
  {
    slug: "fda-nutrition-facts-2026",
    category: "Compliance",
    title: "FDA Nutrition Facts Label Requirements in 2026: What's Changed",
    excerpt:
      "The FDA's updated Nutrition Facts label regulations have been in effect for a few years, but many brands are still not fully compliant. We cover the key changes and what your labels need to include today.",
    date: "May 28, 2026",
    readTime: "6 min read",
    featured: true,
  },
  {
    slug: "cold-foil-stamping-guide",
    category: "Finishes",
    title: "Cold Foil Stamping: When to Use It and How Much It Costs",
    excerpt:
      "Cold foil adds brilliant metallic accents to labels without heat — making it compatible with more substrates than hot foil. Learn when it makes sense and what to budget for it.",
    date: "May 15, 2026",
    readTime: "5 min read",
    featured: true,
  },
  {
    slug: "variable-data-printing",
    category: "Technology",
    title: "Variable Data Printing 101: Unique Barcodes, Serial Numbers, and QR Codes",
    excerpt:
      "If every label needs a unique identifier — barcode, lot code, QR code, or name — variable data printing is your solution. We explain how it works and what files you need to supply.",
    date: "May 8, 2026",
    readTime: "5 min read",
    featured: false,
  },
  {
    slug: "label-design-tips-for-print",
    category: "Design",
    title: "7 Label Design Mistakes That Cost You Money at the Printer",
    excerpt:
      "Poor print-ready artwork is the single biggest source of delays and extra charges at label printers. Avoid these seven common design mistakes before sending your files.",
    date: "April 29, 2026",
    readTime: "7 min read",
    featured: false,
  },
  {
    slug: "pantone-color-matching",
    category: "Color",
    title: "Pantone Color Matching in Flexographic Printing: A Buyer's Guide",
    excerpt:
      "Brand color consistency is critical for shelf recognition. We explain how Pantone spot colors work on flexo presses, when to use them vs. CMYK, and how to specify them in your artwork.",
    date: "April 18, 2026",
    readTime: "6 min read",
    featured: false,
  },
  {
    slug: "minimum-order-quantities",
    category: "Pricing",
    title: "Why Label Printing Minimum Orders Exist (And How to Work With Them)",
    excerpt:
      "Setup costs are fixed regardless of quantity. Understanding how minimums work helps you order smarter — and sometimes it's cheaper to order more than you think you need.",
    date: "April 5, 2026",
    readTime: "4 min read",
    featured: false,
  },
  {
    slug: "polyester-labels-guide",
    category: "Materials",
    title: "When to Use Polyester Labels Instead of Paper or BOPP",
    excerpt:
      "White polyester face stock is the go-to choice for labels exposed to harsh chemicals, extreme temperatures, or mechanical abrasion. Here's when it's worth the premium.",
    date: "March 22, 2026",
    readTime: "4 min read",
    featured: false,
  },
];

const CATEGORIES = ["All", "Materials", "Compliance", "Finishes", "Technology", "Design", "Color", "Pricing"];

export default function BlogPage() {
  const featured = POSTS.filter((p) => p.featured);
  const rest = POSTS.filter((p) => !p.featured);

  return (
    <div>
      {/* Hero */}
      <section className="hero-gradient text-white py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-extrabold mb-3">Label Printing Insights</h1>
          <p className="text-white/80 text-lg max-w-xl">
            Practical guides on materials, compliance, design, and print technology — from
            a team that's been doing this for 25+ years.
          </p>
        </div>
      </section>

      {/* Categories */}
      <section className="bg-slate-50 border-b border-slate-200 py-4 sticky top-16 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                className={`shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  cat === "All"
                    ? "bg-navy-900 text-white"
                    : "bg-white border border-slate-200 text-slate-600 hover:border-slate-300"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        {/* Featured posts */}
        <h2 className="text-xl font-bold text-navy-900 mb-6">Featured Articles</h2>
        <div className="grid sm:grid-cols-3 gap-6 mb-14">
          {featured.map((post) => (
            <Link
              key={post.slug}
              href={`/blog/${post.slug}`}
              className="group bg-white border border-slate-200 rounded-2xl overflow-hidden hover:shadow-elevated hover:border-ocean-500/30 transition-all"
            >
              <div className="bg-gradient-to-br from-navy-900 to-ocean-700 h-32 flex items-end p-4">
                <span className="text-xs font-bold text-gold-300 uppercase tracking-wider bg-white/10 px-2 py-1 rounded-full">
                  {post.category}
                </span>
              </div>
              <div className="p-5">
                <h3 className="font-bold text-navy-900 mb-2 leading-snug group-hover:text-ocean-600 transition-colors">
                  {post.title}
                </h3>
                <p className="text-sm text-slate-500 line-clamp-2 mb-3">{post.excerpt}</p>
                <div className="flex items-center gap-3 text-xs text-slate-400">
                  <span>{post.date}</span>
                  <span>·</span>
                  <span className="flex items-center gap-1">
                    <Clock size={11} /> {post.readTime}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* All posts */}
        <h2 className="text-xl font-bold text-navy-900 mb-6">All Articles</h2>
        <div className="space-y-4">
          {rest.map((post) => (
            <Link
              key={post.slug}
              href={`/blog/${post.slug}`}
              className="group flex flex-col sm:flex-row gap-4 bg-white border border-slate-200 rounded-2xl p-5 hover:shadow-elevated hover:border-ocean-500/30 transition-all"
            >
              <div className="sm:w-48 shrink-0">
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-ocean-500">
                  <Tag size={11} /> {post.category}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-navy-900 mb-1 group-hover:text-ocean-600 transition-colors">
                  {post.title}
                </h3>
                <p className="text-sm text-slate-500 line-clamp-2">{post.excerpt}</p>
              </div>
              <div className="flex sm:flex-col sm:items-end gap-3 sm:gap-1 text-xs text-slate-400 shrink-0">
                <span>{post.date}</span>
                <span className="flex items-center gap-1">
                  <Clock size={11} /> {post.readTime}
                </span>
              </div>
            </Link>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-14 bg-navy-900 text-white rounded-2xl p-8 text-center">
          <h2 className="text-2xl font-bold mb-3">Ready to start your label project?</h2>
          <p className="text-navy-300 mb-6">Get an instant price estimate — no account needed.</p>
          <Link
            href="/quote"
            className="inline-flex items-center gap-2 bg-gold-500 hover:bg-gold-600 text-navy-900 font-bold px-6 py-3 rounded-xl transition-colors"
          >
            Get a Quote <ArrowRight size={18} />
          </Link>
        </div>
      </div>
    </div>
  );
}
