import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Clock, Calendar, ArrowRight } from "lucide-react";

// Static blog content — in production this would come from a CMS/DB
const POSTS: Record<string, {
  title: string; category: string; date: string; readTime: string; content: string;
}> = {
  "bopp-vs-paper-labels": {
    title: "BOPP vs. Paper Labels: Which Is Right for Your Product?",
    category: "Materials",
    date: "June 2, 2026",
    readTime: "4 min read",
    content: `
## The Short Answer

Use **paper** when cost is the primary driver and your labels stay dry. Use **BOPP** (biaxially-oriented polypropylene) when your labels need to survive moisture, refrigeration, oil, or rough handling.

## What Is BOPP?

BOPP is a type of plastic film created by stretching polypropylene in two directions. That biaxial orientation gives it excellent tensile strength, dimensional stability, and moisture resistance. The result is a label face stock that:

- Doesn't absorb moisture and cause wrinkling
- Resists tearing and scuffing
- Accepts inks well with the right coatings
- Looks clean and professional on the shelf

BOPP comes in two common variants for labels:

- **BOPP White** — opaque white film, the most popular choice for labels that need to look clean and crisp.
- **BOPP Clear** — transparent film that creates a "no-label look," making your design appear to be printed directly on the product.

## When Paper Works Fine

Paper is the right choice when:

1. Your labels are applied in a dry environment and stay dry during use.
2. You're printing food labels that never touch water (dry goods, cereals, boxed products).
3. Budget is tight and your volumes are modest.
4. The label will be discarded before the product is used (outer shipping carton labels, instruction sheets).

Standard white paper labels are the most affordable option we offer — approximately 30–40% cheaper per unit than equivalent BOPP labels at the same quantity.

## When BOPP Is the Right Call

Switch to BOPP when:

- **Refrigerated or frozen products** — condensation will cause paper labels to wrinkle and peel. BOPP holds its adhesion and appearance down to -40°F.
- **Beverages and condiments** — bottles get wet. Paper doesn't like water.
- **Health & beauty / personal care** — shower, sink, and bathroom environments mean constant moisture exposure.
- **Outdoor or industrial applications** — sun, rain, and handling abuse require a tougher face stock.
- **Premium shelf presence** — BOPP prints with higher gloss and a more professional look than paper.

## The Cost Trade-Off

At 1,000 units, a 2"×3" label:

| Face Stock | Estimated Price |
|---|---|
| White Paper | ~$89–105 |
| BOPP White | ~$125–145 |
| BOPP Clear | ~$140–165 |

The gap narrows at higher volumes. At 10,000 units, the per-unit cost difference between paper and BOPP white is often less than a penny per label.

## Making the Decision

Ask yourself: *Will this label ever get wet, handled roughly, or exposed to chemicals?* If yes — BOPP. If no — paper is fine.

Need help choosing? [Contact our team](/contact) — we've been advising on material selection for 25 years and will tell you the right answer for your specific application.
    `,
  },
  "fda-nutrition-facts-2026": {
    title: "FDA Nutrition Facts Label Requirements in 2026: What's Changed",
    category: "Compliance",
    date: "May 28, 2026",
    readTime: "6 min read",
    content: `
## Overview

The FDA's updated Nutrition Facts Label regulations went into full effect for most manufacturers in January 2020 (large manufacturers) and January 2021 (small/very small). Yet our team still sees non-compliant artwork regularly in 2026. Here's a practical rundown.

## Key Changes from the 2016 Rule

### 1. Serving Sizes Are Now "Realistic"

The FDA updated reference amounts customarily consumed (RACCs) to reflect how people actually eat, not idealized portion sizes. If you haven't revisited your nutrition facts since 2015, your serving size may need updating.

### 2. "Added Sugars" Is Now Required

Total sugars alone is no longer enough. Labels must now separately declare **Added Sugars** with a % Daily Value.

### 3. Mandatory Vitamin D and Potassium

Vitamin A and Vitamin C are now *optional* (not required). Vitamin D and Potassium are now *required*.

### 4. Updated % Daily Values

The reference values for nutrients like sodium, dietary fiber, and vitamins have been updated. If you calculated your % DVs before 2016, recalculate.

### 5. Calorie Count Must Be Larger

The serving size and Calories numbers must appear in a larger, bolder font. Specific minimum point sizes apply.

## What We Need from You

When you submit a food label for printing:

1. **Provide a print-ready PDF** with fonts embedded and color mode set to the appropriate profile (CMYK for most substrates).
2. **Confirm your nutrition facts were generated after 2016** and reviewed by a qualified food scientist or dietitian.
3. **Do not ask us to verify compliance** — we are printers, not nutritional fact reviewers. We print what you supply. FDA compliance is your responsibility as the brand owner.

## The "Dual Column" Format

Products sold as a single-serving container that could reasonably be consumed in one sitting *and* contains between 1 and 3 servings must use a dual-column format showing both "per serving" and "per container" values.

## Common Compliance Mistakes We See

- **Missing Added Sugars declaration** — still the most frequent error.
- **Wrong vitamins** — still showing Vitamin A and C as required instead of Vitamin D and Potassium.
- **Calorie font too small** — especially common on small labels where designers shrank everything to fit.
- **Outdated % Daily Values** — especially for sodium and fiber.

## Need a Compliance Referral?

We can't review your nutrition facts, but we work with several food labeling consultants in the Bay Area who can. [Contact us](/contact) and we'll make an introduction.
    `,
  },
  "cold-foil-stamping-guide": {
    title: "Cold Foil Stamping: When to Use It and How Much It Costs",
    category: "Finishes",
    date: "May 15, 2026",
    readTime: "5 min read",
    content: `
## What Is Cold Foil Stamping?

Cold foil stamping applies a thin metallic film to a label using UV adhesive and pressure — without heat. This distinguishes it from traditional "hot foil" stamping, which uses a heated die.

## Cold Foil vs. Hot Foil: Key Differences

| Feature | Cold Foil | Hot Foil |
|---|---|---|
| Heat required | No | Yes |
| Compatible substrates | Most films and papers | Limited (heat-sensitive substrates excluded) |
| Registration | Very precise | Precise but setup-intensive |
| Minimum quantity | Moderate | High (typically 5,000+) |
| Cost | Moderate | Higher |
| Sharpness | Excellent | Excellent |

For roll-label production on a flexographic press, cold foil is generally the preferred choice because it integrates cleanly into the print workflow.

## What Cold Foil Looks Like

Cold foil creates a brilliant, mirror-like metallic surface. Available finishes include:

- **Gold** — the most common
- **Silver** — clean, modern
- **Holographic** — rainbow effect, frequently used for premium spirits and cosmetics
- **Colored metallics** — red, blue, copper, rose gold (with an overprint layer)

The foil can be printed over or under other ink layers. Printing a transparent color over silver foil creates a rich, deep metallic color that's impossible to achieve with standard inks.

## Cost Expectations

Cold foil adds approximately **$75–$120 to your order** at typical Ocean Label volumes (1,000–5,000 labels), depending on the foil area and coverage. The more of your label that's covered in foil, the higher the cost.

Per-unit cost at 2,500 labels: typically $0.03–$0.08 additional per label for moderate coverage.

## When to Use Cold Foil

Consider cold foil for:

- **Premium spirits, wine, or spirits** — where shelf presence drives purchase decisions
- **Cosmetics and beauty** — where luxury positioning matters
- **Specialty food and beverage** — gift-grade products
- **Holiday or limited-edition runs** — even a small foil element signals premium quality

## What We Need from You

If your artwork includes cold foil:

1. **Provide a separate foil layer** in your artwork file, clearly labeled.
2. **Foil areas should be 100% K** in the foil-layer file.
3. **Minimum foil element size**: approximately 1pt stroke or 8pt type — finer detail will not reproduce cleanly.

[Contact us](/contact) or use the [quote calculator](/quote) to get pricing for your specific artwork.
    `,
  },
};

type Params = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const post = POSTS[slug];
  if (!post) return { title: "Post Not Found | Ocean Label" };
  return {
    title: `${post.title} | Ocean Label Blog`,
    description: post.title,
  };
}

function renderMarkdown(md: string) {
  const lines = md.trim().split("\n");
  const elements: React.ReactNode[] = [];
  let i = 0;
  let tableBuffer: string[] = [];

  function flushTable() {
    if (tableBuffer.length < 3) { tableBuffer = []; return; }
    const headers = tableBuffer[0].split("|").map(s => s.trim()).filter(Boolean);
    const rows = tableBuffer.slice(2).map(r => r.split("|").map(s => s.trim()).filter(Boolean));
    elements.push(
      <div key={`table-${i}`} className="overflow-x-auto my-6">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="bg-slate-100">
              {headers.map((h, hi) => (
                <th key={hi} className="border border-slate-200 px-4 py-2 text-left font-semibold text-navy-900">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, ri) => (
              <tr key={ri} className={ri % 2 === 0 ? "bg-white" : "bg-slate-50"}>
                {row.map((cell, ci) => (
                  <td key={ci} className="border border-slate-200 px-4 py-2 text-slate-700">{cell}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
    tableBuffer = [];
  }

  while (i < lines.length) {
    const line = lines[i];

    if (line.startsWith("|")) {
      tableBuffer.push(line);
      i++;
      continue;
    } else if (tableBuffer.length > 0) {
      flushTable();
    }

    if (line.startsWith("## ")) {
      elements.push(<h2 key={i} className="text-2xl font-extrabold text-navy-900 mt-10 mb-4">{line.slice(3)}</h2>);
    } else if (line.startsWith("### ")) {
      elements.push(<h3 key={i} className="text-xl font-bold text-navy-900 mt-6 mb-3">{line.slice(4)}</h3>);
    } else if (line.startsWith("- ")) {
      const listItems = [];
      while (i < lines.length && lines[i].startsWith("- ")) {
        const text = lines[i].slice(2).replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
        listItems.push(<li key={i} className="text-slate-700 leading-relaxed" dangerouslySetInnerHTML={{ __html: text }} />);
        i++;
      }
      elements.push(<ul key={`ul-${i}`} className="list-disc list-inside space-y-1.5 my-4 ml-2">{listItems}</ul>);
      continue;
    } else if (/^\d+\./.test(line)) {
      const listItems = [];
      while (i < lines.length && /^\d+\./.test(lines[i])) {
        const text = lines[i].replace(/^\d+\.\s*/, "").replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
        listItems.push(<li key={i} className="text-slate-700 leading-relaxed" dangerouslySetInnerHTML={{ __html: text }} />);
        i++;
      }
      elements.push(<ol key={`ol-${i}`} className="list-decimal list-inside space-y-1.5 my-4 ml-2">{listItems}</ol>);
      continue;
    } else if (line.trim() === "") {
      // skip blank lines
    } else {
      const html = line
        .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
        .replace(/\*(.+?)\*/g, "<em>$1</em>")
        .replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2" class="text-ocean-500 hover:underline">$1</a>');
      elements.push(<p key={i} className="text-slate-700 leading-relaxed my-3" dangerouslySetInnerHTML={{ __html: html }} />);
    }

    i++;
  }

  if (tableBuffer.length > 0) flushTable();
  return elements;
}

export default async function BlogPostPage({ params }: Params) {
  const { slug } = await params;
  const post = POSTS[slug];

  if (!post) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <h1 className="text-2xl font-bold text-navy-900 mb-4">Post Not Found</h1>
        <Link href="/blog" className="text-ocean-500 hover:underline">← Back to Blog</Link>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <section className="hero-gradient text-white py-14">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link href="/blog" className="inline-flex items-center gap-1 text-navy-300 hover:text-white text-sm mb-6 transition-colors">
            <ArrowLeft size={14} /> Back to Blog
          </Link>
          <span className="text-xs font-semibold text-gold-400 uppercase tracking-wider">{post.category}</span>
          <h1 className="text-3xl sm:text-4xl font-extrabold mt-2 mb-4 leading-tight">{post.title}</h1>
          <div className="flex items-center gap-4 text-sm text-navy-300">
            <span className="flex items-center gap-1.5"><Calendar size={14} /> {post.date}</span>
            <span className="flex items-center gap-1.5"><Clock size={14} /> {post.readTime}</span>
            <span className="text-navy-400">Ocean Label Team</span>
          </div>
        </div>
      </section>

      {/* Content */}
      <article className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="prose-content">
          {renderMarkdown(post.content)}
        </div>

        {/* CTA */}
        <div className="mt-16 bg-navy-900 text-white rounded-2xl p-8">
          <h2 className="text-xl font-bold mb-2">Ready to print your labels?</h2>
          <p className="text-navy-300 mb-5 text-sm">
            Get an instant price estimate with our quote calculator — no account needed.
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              href="/quote"
              className="inline-flex items-center gap-2 bg-gold-500 hover:bg-gold-600 text-navy-900 font-bold px-5 py-2.5 rounded-xl transition-colors text-sm"
            >
              Get a Quote <ArrowRight size={16} />
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 border border-white/30 hover:border-white text-white font-semibold px-5 py-2.5 rounded-xl transition-colors text-sm"
            >
              Contact Our Team
            </Link>
          </div>
        </div>
      </article>
    </div>
  );
}
