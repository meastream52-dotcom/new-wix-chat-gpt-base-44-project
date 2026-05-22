"use client";

import { useState } from "react";
import Link from "next/link";

type Slide = {
  num: number;
  title: string;
  subtitle?: string;
  body: (string | { label: string; trad: string; ours: string })[];
  type?: "table" | "bullets" | "quote" | "metrics" | "investors";
};

const SLIDES: Slide[] = [
  {
    num: 1,
    title: "Title",
    body: [
      "[Studio Name]",
      "The first AI-native entertainment company — from script to screen to every screen.",
      "Anthology Fund Application | [Date]",
    ],
    type: "quote",
  },
  {
    num: 2,
    title: "The Problem",
    subtitle: "Hollywood is broken in three ways",
    body: [
      "Creation: a feature film costs $65M+ average. A TV pilot costs $3–15M. 99.9% of stories never get told because the economics don't work.",
      "Distribution: streaming killed theatrical. Theaters are dying. Communities lost the shared experience of cinema.",
      "Access: only a tiny fraction of humanity can participate in professional storytelling. The rest are consumers, never creators.",
    ],
  },
  {
    num: 3,
    title: "The Solution",
    subtitle: "Three things on one technology stack",
    body: [
      "An AI-native studio that produces film, animation, books, comics, and games at 10% of traditional cost",
      "A community theater network in churches and schools — $20/month unlimited, revenue shared with partners",
      "A creator platform where anyone can make theatrical-quality content using our agents, IP, and distribution",
    ],
  },
  {
    num: 4,
    title: "The Demo",
    subtitle: "Most important slide — show, don't describe",
    body: [
      "Play the 30-second clip or the full short. Don't describe it — show it.",
      '"This was produced in [X] weeks by a team of [X] people for $[X]. A comparable piece would cost $[Y] at a traditional studio."',
    ],
    type: "quote",
  },
  {
    num: 5,
    title: "How It Works — The Agent Stack",
    subtitle: "Claude orchestrates the entire pipeline",
    body: [
      "Claude orchestrates the entire pipeline from script to distribution",
      "Specialized agents at each layer: development, pre-production, generation, audio, post, multi-format, distribution",
      "Human creative leads at every checkpoint — agents are leverage, not replacement",
      "Every asset tracked for rights, provenance, and cost",
    ],
  },
  {
    num: 6,
    title: "The 500-Acre Backlot",
    subtitle: "The physical moat pure-software competitors can't replicate",
    body: [
      "LIDAR-scanned digital twin: infinite virtual reshoots, AI location scouting",
      "Physical soundstages for human performance days",
      "Comparable to Tyler Perry Studios ($250M+ asset) at a fraction of cost",
    ],
  },
  {
    num: 7,
    title: "The Theater Network",
    subtitle: "Churches and schools as venue partners",
    body: [
      "$0 rent — revenue share model. $20/month unlimited subscription; 30% to venue partners.",
      "$0 content licensing cost (we own everything we screen)",
      "501(c)(3) structure preserves partner tax exemptions",
      "Path to 1,000+ locations in 3 years; standalone profitable at 200",
    ],
  },
  {
    num: 8,
    title: "The Creator Platform (Year 2)",
    subtitle: "The Roblox of film",
    body: [
      "Anyone can make theatrical-quality content using our agents and IP",
      "Sandbox mode (create within our universes) and open mode (original IP)",
      "Built-in distribution to our theater network and digital platforms",
      "Trust and safety from day one: identity verification, content classification, watermarking",
    ],
  },
  {
    num: 9,
    title: "Unit Economics",
    subtitle: "The cost comparison is the core of the pitch",
    body: [
      { label: "Animated short (10 min)", trad: "$300K–$1M", ours: "$40K–$80K" },
      { label: "Live-action short (15 min)", trad: "$500K–$2M", ours: "$80K–$150K" },
      { label: "Animated series pilot (3×20 min)", trad: "$3M–$9M", ours: "$100K–$200K" },
      { label: "Feature film (year 2)", trad: "$20M–$65M", ours: "$2M–$5M" },
    ],
    type: "table",
  },
  {
    num: 10,
    title: "Traction and Timeline",
    subtitle: "Where you are and where you're going",
    body: [
      "Month 1: applied to Anthology Fund, began development on first 2 projects",
      "Month 3: first animated clip produced end-to-end by pipeline",
      "Month 5: first project released, theater pilot launches",
      "Month 6: seed round closes",
      "Month 12: 5 projects shipped, 65–100 theater locations, creator platform alpha",
    ],
  },
  {
    num: 11,
    title: "The Team",
    subtitle: "Fill in your backgrounds here",
    body: [
      "[You]: Founder and CEO. [Your background, emphasis on entertainment + tech intersection]",
      "[CTO]: [Background, emphasis on generative AI / media tech]",
      "[Head of Production]: [Their credits]",
      "Advisors: [Talent Advisory Board members, entertainment lawyer, any notable names]",
      "Key hires planned: 2 engineers, marketing/distribution lead, theater operations coordinator",
    ],
  },
  {
    num: 12,
    title: "The Ask",
    subtitle: "What you need and how you'll use it",
    body: [
      "Raising: $[X] seed round — lead or participating from Anthology Fund",
      "Production of 5 projects: $350K",
      "Theater network pilot: $150K",
      "Team: $300K",
      "Infrastructure: $200K",
      "Milestones: 5 shipped projects, 65+ theater locations, creator platform alpha, positioned for $15–30M Series A",
      "Anthropic credits accelerate our Claude-based orchestration layer",
    ],
  },
  {
    num: 13,
    title: "The Vision",
    subtitle: "By 2030 — the leave-behind",
    body: [
      "The largest AI-native entertainment catalog in the world",
      "5,000+ community theater locations across the US",
      "A creator platform with 1M+ active creators",
      "Vertically integrated from creation to exhibition for the first time since the Paramount Decree of 1948",
      '"We\'re not building an AI tool for Hollywood. We\'re building the studio that makes Hollywood\'s model obsolete."',
    ],
    type: "quote",
  },
];

const INVESTORS = [
  { firm: "Anthology Fund", partner: "Tim Tully, Deedy Das, Amy Wu", why: "Claude/Anthropic ecosystem fund. Rolling, 2-week response. Apply now.", priority: "high" },
  { firm: "a16z", partner: "Andrew Chen (consumer), Chris Dixon (media)", why: "Back Promise, understand AI entertainment", priority: "high" },
  { firm: "a16z American Dynamism", partner: "Katherine Boyle", why: "Physical infrastructure + tech thesis fits the 500 acres", priority: "high" },
  { firm: "Greycroft", partner: "Dana Settle", why: "Deep entertainment sector expertise", priority: "med" },
  { firm: "Connect Ventures", partner: "—", why: "Entertainment-specialist fund", priority: "med" },
  { firm: "Lightspeed", partner: "Alex Taussig", why: "Has written publicly about AI media", priority: "med" },
  { firm: "Raine Group", partner: "—", why: "Media and entertainment specialist investment bank/fund", priority: "med" },
  { firm: "Strategic: A24 Capital", partner: "—", why: "Brand halo, distribution knowledge", priority: "strategic" },
  { firm: "Strategic: Lionsgate", partner: "—", why: "Publicly explored AI; potential output deal", priority: "strategic" },
];

const PRIORITY_STYLES: Record<string, string> = {
  high: "text-[#3fb950] bg-[#3fb950]/10 border-[#3fb950]/20",
  med: "text-[#58a6ff] bg-[#58a6ff]/10 border-[#58a6ff]/20",
  strategic: "text-[#a371f7] bg-[#a371f7]/10 border-[#a371f7]/20",
};

export default function PitchPage() {
  const [activeSlide, setActiveSlide] = useState(1);
  const [showInvestors, setShowInvestors] = useState(false);
  const slide = SLIDES[activeSlide - 1];

  return (
    <div className="flex h-full overflow-hidden">
      {/* Slide selector */}
      <div className="w-48 shrink-0 border-r border-[#21262d] overflow-y-auto py-4">
        <div className="px-3 mb-3">
          <Link
            href="/playbook"
            className="text-xs text-[#8b949e] hover:text-[#e6edf3] transition-colors flex items-center gap-1"
          >
            ← Playbook
          </Link>
        </div>
        <div className="px-3 mb-2">
          <div className="text-[10px] font-mono text-[#8b949e] uppercase tracking-widest">
            Pitch Deck
          </div>
        </div>
        {SLIDES.map((s) => (
          <button
            key={s.num}
            onClick={() => setActiveSlide(s.num)}
            className={`w-full text-left px-3 py-2 text-xs transition-colors ${
              activeSlide === s.num
                ? "bg-[#161b22] text-[#f0883e] border-r-2 border-[#f0883e]"
                : "text-[#8b949e] hover:text-[#e6edf3] hover:bg-[#161b22]/50"
            }`}
          >
            <span className="font-mono font-bold mr-1.5">{String(s.num).padStart(2, "0")}</span>
            {s.title}
          </button>
        ))}
        <div className="mt-2 border-t border-[#21262d] pt-2">
          <button
            onClick={() => setShowInvestors(!showInvestors)}
            className={`w-full text-left px-3 py-2 text-xs transition-colors ${
              showInvestors
                ? "bg-[#161b22] text-[#f0883e] border-r-2 border-[#f0883e]"
                : "text-[#8b949e] hover:text-[#e6edf3] hover:bg-[#161b22]/50"
            }`}
          >
            <span className="font-mono font-bold mr-1.5">+</span>
            Investor List
          </button>
        </div>
      </div>

      {/* Slide content */}
      <div className="flex-1 overflow-y-auto p-8">
        <div className="max-w-3xl">
          {showInvestors ? (
            <>
              <div className="mb-6">
                <div className="text-xs font-mono text-[#f0883e]/70 uppercase tracking-widest mb-1">
                  Investor Outreach
                </div>
                <h1 className="text-2xl font-mono font-bold text-[#e6edf3] mb-2">
                  Simultaneous Outreach Targets
                </h1>
                <p className="text-sm text-[#8b949e]">
                  Apply to Anthology Fund first — but approach these simultaneously, not sequentially.
                </p>
              </div>

              <div className="overflow-hidden rounded-lg border border-[#21262d] mb-8">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-[#21262d] bg-[#161b22]">
                      <th className="text-left px-4 py-3 text-xs font-mono text-[#8b949e] uppercase">Firm</th>
                      <th className="text-left px-4 py-3 text-xs font-mono text-[#8b949e] uppercase">Partner</th>
                      <th className="text-left px-4 py-3 text-xs font-mono text-[#8b949e] uppercase">Why</th>
                      <th className="px-4 py-3 text-xs font-mono text-[#8b949e] uppercase">Priority</th>
                    </tr>
                  </thead>
                  <tbody>
                    {INVESTORS.map(({ firm, partner, why, priority }) => (
                      <tr key={firm} className="border-b border-[#21262d] last:border-0">
                        <td className="px-4 py-3 text-[#e6edf3] font-medium text-xs">{firm}</td>
                        <td className="px-4 py-3 text-[#8b949e] text-xs">{partner}</td>
                        <td className="px-4 py-3 text-[#8b949e] text-xs">{why}</td>
                        <td className="px-4 py-3 text-center">
                          <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded border ${PRIORITY_STYLES[priority]}`}>
                            {priority}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="p-5 rounded-lg border border-[#f0883e]/20 bg-[#f0883e]/5">
                <div className="text-xs font-mono text-[#f0883e] uppercase mb-2 tracking-widest">
                  The Cold Email (3 sentences max)
                </div>
                <div className="text-sm text-[#e6edf3] font-mono leading-relaxed p-3 bg-[#0f1117] rounded border border-[#21262d]">
                  <p className="mb-2">
                    Subject: AI-native studio — first content shipping, applying to Anthology Fund
                  </p>
                  <p className="text-[#8b949e]">
                    "I'm building [Studio Name], the first vertically integrated AI entertainment company —
                    production, theaters, and a creator platform. We just shipped our first animated short
                    for $[X] that would cost $[Y] traditional, and we're piloting a community theater network
                    in [X] churches and schools. [Link to the short] [Link to one-pager]. Would love 15 minutes."
                  </p>
                </div>
                <div className="text-xs text-[#8b949e] mt-2">
                  Attach: one-pager PDF + link to the short film. No deck in the cold email.
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="flex items-start justify-between mb-6">
                <div>
                  <div className="text-xs font-mono text-[#f0883e]/70 uppercase tracking-widest mb-1">
                    Slide {String(slide.num).padStart(2, "0")} of {SLIDES.length}
                  </div>
                  <h1 className="text-2xl font-mono font-bold text-[#e6edf3]">{slide.title}</h1>
                  {slide.subtitle && (
                    <p className="text-sm text-[#8b949e] mt-1">{slide.subtitle}</p>
                  )}
                </div>
              </div>

              {slide.type === "table" ? (
                <div className="overflow-hidden rounded-lg border border-[#21262d] mb-6">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-[#21262d] bg-[#161b22]">
                        <th className="text-left px-4 py-3 text-xs font-mono text-[#8b949e] uppercase">Project type</th>
                        <th className="text-left px-4 py-3 text-xs font-mono text-[#8b949e] uppercase">Traditional</th>
                        <th className="text-left px-4 py-3 text-xs font-mono text-[#3fb950] uppercase">Our studio</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(slide.body as { label: string; trad: string; ours: string }[]).map(({ label, trad, ours }) => (
                        <tr key={label} className="border-b border-[#21262d] last:border-0">
                          <td className="px-4 py-3 text-[#e6edf3]">{label}</td>
                          <td className="px-4 py-3 text-[#f85149] font-mono text-xs">{trad}</td>
                          <td className="px-4 py-3 text-[#3fb950] font-mono text-xs font-bold">{ours}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <div className="px-4 py-3 bg-[#161b22] border-t border-[#21262d]">
                    <div className="text-xs text-[#8b949e]">
                      Theater network: profitable at 200 subscribers/location. $15.6M annual margin at 1,000 locations.
                    </div>
                  </div>
                </div>
              ) : slide.type === "quote" ? (
                <div className="space-y-4">
                  {(slide.body as string[]).map((item, i) => (
                    <div
                      key={i}
                      className={`p-4 rounded-lg border ${
                        item.startsWith('"') || item.startsWith('"')
                          ? "border-[#f0883e]/20 bg-[#f0883e]/5 text-[#e6edf3] text-base italic"
                          : "border-[#21262d] bg-[#161b22] text-[#8b949e] text-sm"
                      }`}
                    >
                      {item}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-2">
                  {(slide.body as string[]).map((item, i) => (
                    <div
                      key={i}
                      className="flex gap-3 p-3 rounded-md border border-[#21262d] bg-[#161b22] text-sm text-[#8b949e] leading-relaxed"
                    >
                      <span className="shrink-0 text-[#f0883e] mt-0.5 text-xs">◈</span>
                      {item}
                    </div>
                  ))}
                </div>
              )}

              {/* Anthology Fund tips — show on slide 1 */}
              {slide.num === 1 && (
                <div className="mt-6 p-4 rounded-lg border border-[#58a6ff]/20 bg-[#58a6ff]/5">
                  <div className="text-xs font-mono text-[#58a6ff] uppercase mb-2 tracking-widest">
                    Application Tips — Anthology Fund
                  </div>
                  <ul className="space-y-1.5 text-xs text-[#8b949e]">
                    <li className="flex gap-2"><span className="text-[#58a6ff]">·</span>The application is short. Company name, stage, what you're building, how you use Claude, team, link to materials.</li>
                    <li className="flex gap-2"><span className="text-[#58a6ff]">·</span>Include the demo. Tim Tully: a video demo is the best way to stand out.</li>
                    <li className="flex gap-2"><span className="text-[#58a6ff]">·</span>Emphasize Claude usage — it's core infrastructure, not a nice-to-have. Make the orchestrator dependency concrete.</li>
                    <li className="flex gap-2"><span className="text-[#58a6ff]">·</span>Rolling basis, 2-week response. Apply early. Don't wait until the round is "ready."</li>
                    <li className="flex gap-2"><span className="text-[#58a6ff]">·</span>If no response in 2 weeks, email a partner directly with a one-line pitch and your application number.</li>
                  </ul>
                </div>
              )}

              {/* Navigation */}
              <div className="flex gap-3 mt-8 pt-6 border-t border-[#21262d]">
                {activeSlide > 1 && (
                  <button
                    onClick={() => setActiveSlide(activeSlide - 1)}
                    className="px-4 py-2 rounded-md text-sm text-[#8b949e] border border-[#21262d] hover:text-[#e6edf3] hover:border-[#30363d] transition-colors"
                  >
                    ← Slide {activeSlide - 1}
                  </button>
                )}
                {activeSlide < SLIDES.length && (
                  <button
                    onClick={() => setActiveSlide(activeSlide + 1)}
                    className="ml-auto px-4 py-2 rounded-md text-sm text-[#f0883e] border border-[#f0883e]/30 hover:bg-[#f0883e]/10 transition-colors"
                  >
                    Slide {activeSlide + 1} →
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
