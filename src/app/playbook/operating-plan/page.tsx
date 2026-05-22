"use client";

import { useState } from "react";
import Link from "next/link";

type Task = {
  text: string;
  isMilestone?: boolean;
};

type Section = {
  heading: string;
  tasks: Task[];
};

type Month = {
  num: number;
  title: string;
  budget?: string;
  sections: Section[];
  milestone?: string;
};

const MONTHS: Month[] = [
  {
    num: 1,
    title: "Foundation",
    budget: "$50K–$100K",
    sections: [
      {
        heading: "Team",
        tasks: [
          { text: "Founder (you): full-time, CEO" },
          { text: "Hire #1: Technical co-founder / CTO — must have shipped generative media at scale. Builds orchestrator and generation pipeline. Equity co-founder.", isMilestone: true },
          { text: "Hire #2: Head of Production / EP — real credits, shipped content to audiences. Equity or near-equity.", isMilestone: true },
          { text: "Advisor: SAG signatory entertainment lawyer (outside counsel)" },
        ],
      },
      {
        heading: "Operations",
        tasks: [
          { text: "Incorporate studio as Delaware C-corp", isMilestone: true },
          { text: "Incorporate Community Cinema Foundation as separate 501(c)(3) — file IRS Form 1023 now (takes 3–6 months)" },
          { text: "Secure SAG-AFTRA Theatrical Standard Signatory agreement" },
          { text: "Set up monorepo and project directory structure" },
          { text: "Begin land planning on 500 acres: survey, zoning review, environmental assessment" },
          { text: "Identify first 2–3 soundstage locations on the property" },
          { text: "Apply to Anthology Fund this month — rolling applications, 2-week response time", isMilestone: true },
        ],
      },
      {
        heading: "Creative",
        tasks: [
          { text: "Begin development on Project 1 (animated short)" },
          { text: "Begin development on Project 2 (documentary series)" },
        ],
      },
    ],
  },
  {
    num: 2,
    title: "Orchestrator + First Scripts",
    budget: "$50K–$100K",
    sections: [
      {
        heading: "Tech",
        tasks: [
          { text: "CTO builds orchestrator v0.1: Claude Code runtime, project bible ingestion, agent routing, cost logging", isMilestone: true },
          { text: "Set up vector DB for asset search" },
          { text: "Evaluate and select generative video models: sign API agreements with 2–3 providers" },
          { text: "Stand up rights management data model (performer consent, asset lineage, training provenance)" },
        ],
      },
      {
        heading: "Creative",
        tasks: [
          { text: "Script lock on Project 1 (animated short, 10–12 minutes)", isMilestone: true },
          { text: "Treatment complete on Project 2 (documentary)" },
          { text: "Begin writing Project 3 (live-action short)" },
          { text: "Commission character design for Project 1 — feeds LoRA training" },
        ],
      },
      {
        heading: "Business",
        tasks: [
          { text: "First Anthology Fund meeting (if application advances)" },
          { text: "Identify and begin warm outreach to 5 angel investors" },
          { text: "Begin conversations with 3 churches and 2 schools in your region for theater pilot" },
        ],
      },
    ],
  },
  {
    num: 3,
    title: "Generation Pipeline + Angel Round",
    budget: "$50K–$100K",
    sections: [
      {
        heading: "Tech",
        tasks: [
          { text: "CTO builds generation pipeline v0.1: model router, shot generation, asset tagging, dedup" },
          { text: "Train first character LoRAs from Project 1 character designs" },
          { text: "Orchestrator v0.2: pre-production agents (breakdown, shot list, storyboard generation)" },
          { text: "First end-to-end test: generate 30-second animated scene from script through pipeline", isMilestone: true },
        ],
      },
      {
        heading: "Creative",
        tasks: [
          { text: "Storyboards complete on Project 1" },
          { text: "Begin generating Project 1 shots — pipeline proof point", isMilestone: true },
          { text: "Script draft on Project 3 (live-action short)" },
          { text: "Lock documentary subjects/interviewees for Project 2" },
        ],
      },
      {
        heading: "Business",
        tasks: [
          { text: "Close angel round: $250K–$500K from entertainment and tech angels", isMilestone: true },
          { text: "Finalize theater pilot agreements with first 3 locations (2 churches, 1 school)" },
          { text: "Order portable cinema equipment for pilot venues (~$90K for 3 kits)" },
        ],
      },
    ],
    milestone: "Working 30-second animated clip produced end-to-end by pipeline. This is the demo reel for every subsequent conversation.",
  },
  {
    num: 4,
    title: "First Content Ships",
    budget: "Funded by angel round",
    sections: [
      {
        heading: "Tech",
        tasks: [
          { text: "Audio pipeline v0.1: score sketching, foley, dialogue processing" },
          { text: "Post pipeline v0.1: assembly agent, color first-pass" },
          { text: "Distribution pipeline v0.1: trailer cutting, metadata generation, social asset creation" },
        ],
      },
      {
        heading: "Creative",
        tasks: [
          { text: "Complete Project 1 rough cut (animated short, 10–12 minutes)" },
          { text: "Human editor + director review → picture lock", isMilestone: true },
          { text: "Sound mix and color on Project 1" },
          { text: "Begin shooting documentary interviews for Project 2 (minimal crew, high AI assist)" },
          { text: "Script lock on Project 3" },
        ],
      },
      {
        heading: "Business",
        tasks: [
          { text: "Theater pilot venues receive equipment, begin setup and testing" },
          { text: "Hire venue techs for pilot locations (part-time local)" },
          { text: "Build subscription app MVP (Stripe billing, seat reservation, basic streaming)" },
        ],
      },
    ],
    milestone: "Project 1 in picture lock. You now have a finished piece of content.",
  },
  {
    num: 5,
    title: "Launch + Seed Fundraise Begins",
    budget: "Seed raise starts",
    sections: [
      {
        heading: "Tech",
        tasks: [
          { text: "Multi-format expansion pipeline v0.1: comic generation, short-form cutting" },
          { text: "Generate comic adaptation of Project 1 (3–5 pages proving multi-format thesis)" },
          { text: "Generate 10+ short-form social clips from Project 1" },
        ],
      },
      {
        heading: "Creative",
        tasks: [
          { text: "Release Project 1 on YouTube, social, and subscription platform", isMilestone: true },
          { text: "Release comic version simultaneously" },
          { text: "Social distribution blitz: 30+ platform-specific assets" },
          { text: "Begin Project 2 post-production (documentary)" },
          { text: "Pre-production on Project 3 (live-action): casting, location scouting on 500 acres" },
        ],
      },
      {
        heading: "Business",
        tasks: [
          { text: "Theater pilot launch: first public screenings at 3 locations", isMilestone: true },
          { text: "Track subscriber signups, attendance, revenue share payouts" },
          { text: "Begin seed fundraise: Anthology Fund, a16z, Greycroft, Connect Ventures" },
          { text: "Pitch deck ready" },
        ],
      },
    ],
    milestone: "Content live, theaters screening, fundraise launched.",
  },
  {
    num: 6,
    title: "Seed Close + Production",
    sections: [
      {
        heading: "Tech",
        tasks: [
          { text: "Orchestrator v1.0: all 8 layers functional end-to-end with monitoring", isMilestone: true },
          { text: "Character consistency improvements based on Project 1 learnings" },
          { text: "Begin digital twin work on 500 acres: LIDAR scanning of first locations" },
        ],
      },
      {
        heading: "Creative",
        tasks: [
          { text: "Project 2 (documentary) complete — release on platform and theaters", isMilestone: true },
          { text: "Shoot live-action days for Project 3 (2–3 days on land, minimal crew)" },
          { text: "Begin generative production on Project 3 (backgrounds, environments, VFX)" },
          { text: "Begin development on Projects 4 and 5" },
        ],
      },
      {
        heading: "Business",
        tasks: [
          { text: "Close seed round: $2M–$5M", isMilestone: true },
          { text: "Expand theater pilot to 8–10 locations" },
          { text: "Hire: 2 engineers, 1 marketing/distribution lead" },
          { text: "Begin 501(c)(3) operations for Community Cinema Foundation" },
        ],
      },
    ],
    milestone: "Funded, team growing, two pieces of content released, theater network proving out.",
  },
  {
    num: 7,
    title: "Scale the Pipeline",
    sections: [
      {
        heading: "Tech",
        tasks: [
          { text: "Asset library reaches 1,000+ tagged, searchable clips" },
          { text: "Automated quality scoring on generated shots" },
          { text: "Theater subscription platform v1.1: family plans, gift subscriptions, partner dashboards" },
        ],
      },
      {
        heading: "Creative",
        tasks: [
          { text: "Project 3 (live-action short) in post — generative + traditional hybrid" },
          { text: "Projects 4 and 5 in active development" },
          { text: "Begin novelization pipeline test: AI-assisted novella based on Project 1 IP" },
        ],
      },
      {
        heading: "Business",
        tasks: [
          { text: "Theater network at 10 locations" },
          { text: "First month of theater unit economics data — validate the model" },
          { text: "Pitch to 3 regional church networks (50+ locations each)" },
          { text: "Begin conversations with school districts (district-level, not individual schools)" },
        ],
      },
    ],
  },
  {
    num: 8,
    title: "Third Release + Theater Expansion",
    sections: [
      {
        heading: "Tech",
        tasks: [
          { text: "LIDAR scanning progressing — first Gaussian splat environments available" },
          { text: "Location agent can 'scout' your property virtually" },
          { text: "Localization pipeline: automated dubbing and subtitling in 10 languages" },
        ],
      },
      {
        heading: "Creative",
        tasks: [
          { text: "Release Project 3 (live-action short) — proves the hybrid model", isMilestone: true },
          { text: "Multi-format expansion: comic, short-form, dubbed versions" },
          { text: "Projects 4 and 5 in production" },
        ],
      },
      {
        heading: "Business",
        tasks: [
          { text: "Theater network expansion to 25 locations" },
          { text: "Hire regional theater coordinator" },
          { text: "Begin New Markets Tax Credit application for theater network" },
          { text: "Identify Opportunity Zone locations for future theaters" },
        ],
      },
    ],
  },
  {
    num: 9,
    title: "The Slate Materializes",
    sections: [
      {
        heading: "Creative",
        tasks: [
          { text: "3 projects released, 2 more in production" },
          { text: "Studio has a recognizable brand and IP library" },
          { text: "First audience data: what genres, lengths, formats perform best" },
          { text: "Begin planning first feature-length project (Project 6, year 2)" },
        ],
      },
      {
        heading: "Business",
        tasks: [
          { text: "Theater network at 40 locations" },
          { text: "Subscription base target: 2,000+ paying subscribers" },
          { text: "Press strategy: Variety, THR, IndieWire, TechCrunch, The Verge" },
        ],
      },
    ],
  },
  {
    num: 10,
    title: "Creator Platform Alpha",
    sections: [
      {
        heading: "Tech",
        tasks: [
          { text: "Creator platform alpha: invite-only, 50 creators", isMilestone: true },
          { text: "Users can create short films using your IP, characters, locations, and agents" },
          { text: "Sandbox mode only (no open mode yet)" },
          { text: "Content moderation and trust/safety pipeline operational" },
        ],
      },
      {
        heading: "Creative",
        tasks: [
          { text: "Project 4 complete and released", isMilestone: true },
          { text: "Project 5 in late production" },
          { text: "First creator-made content appears on the platform" },
        ],
      },
      {
        heading: "Business",
        tasks: [
          { text: "Theater network at 50 locations" },
          { text: "Begin Series A conversations", isMilestone: true },
        ],
      },
    ],
  },
  {
    num: 11,
    title: "Density and Data",
    sections: [
      {
        heading: "Tech",
        tasks: [
          { text: "Creator platform improvements based on alpha feedback" },
          { text: "Pipeline cost optimization: 30%+ reduction from month 3 baselines" },
          { text: "Theater analytics dashboard: per-location performance, content preferences, demographics" },
        ],
      },
      {
        heading: "Creative",
        tasks: [
          { text: "Project 5 complete and released", isMilestone: true },
          { text: "5 projects in the library — enough for a small but real catalog" },
          { text: "Creator alpha producing content; curate the best for theatrical distribution" },
        ],
      },
      {
        heading: "Business",
        tasks: [
          { text: "Theater network at 65 locations" },
          { text: "First crowdfunding campaign for a specific theater location (Republic or Wefunder)" },
          { text: "Formalize church network partnerships (denomination-level deals)" },
          { text: "Begin school district pilot proposals" },
        ],
      },
    ],
  },
  {
    num: 12,
    title: "Year-End Position",
    sections: [
      {
        heading: "Where you are",
        tasks: [
          { text: "5 released projects across animation, documentary, live-action, multi-format", isMilestone: true },
          { text: "Working AI production pipeline battle-tested on real content", isMilestone: true },
          { text: "65–100 theater locations generating subscription revenue", isMilestone: true },
          { text: "Creator platform in alpha with early traction", isMilestone: true },
          { text: "Team of 10–15 people", isMilestone: true },
          { text: "Brand known in both entertainment and AI circles" },
          { text: "$2M–$5M raised, positioned for $15M–$30M Series A", isMilestone: true },
          { text: "500 acres with digital twin coverage of key locations" },
          { text: "Rights management and SAG compliance operational from day one" },
        ],
      },
      {
        heading: "Series A pitch",
        tasks: [
          { text: '"We shipped 5 projects at 10% of traditional cost, built a 100-location theater network with $0 content licensing cost, and have a creator platform with 50 active creators. Here\'s what we do with $20M."', isMilestone: true },
        ],
      },
    ],
  },
];

const HEADING_COLORS: Record<string, string> = {
  Team: "#58a6ff",
  Tech: "#a371f7",
  Creative: "#f0883e",
  Business: "#3fb950",
  Operations: "#79c0ff",
  "Where you are": "#d29922",
  "Series A pitch": "#f0883e",
};

export default function OperatingPlanPage() {
  const [activeMonth, setActiveMonth] = useState(1);
  const month = MONTHS[activeMonth - 1];

  return (
    <div className="flex h-full overflow-hidden">
      {/* Month selector sidebar */}
      <div className="w-44 shrink-0 border-r border-[#21262d] overflow-y-auto py-4">
        <div className="px-3 mb-3">
          <Link
            href="/playbook"
            className="text-xs text-[#8b949e] hover:text-[#e6edf3] transition-colors flex items-center gap-1"
          >
            ← Playbook
          </Link>
        </div>
        <div className="px-3 mb-3">
          <div className="text-[10px] font-mono text-[#8b949e] uppercase tracking-widest">
            12-Month Plan
          </div>
        </div>
        {MONTHS.map((m) => (
          <button
            key={m.num}
            onClick={() => setActiveMonth(m.num)}
            className={`w-full text-left px-3 py-2.5 text-xs transition-colors ${
              activeMonth === m.num
                ? "bg-[#161b22] text-[#58a6ff] border-r-2 border-[#58a6ff]"
                : "text-[#8b949e] hover:text-[#e6edf3] hover:bg-[#161b22]/50"
            }`}
          >
            <div className="font-mono font-bold mb-0.5">Mo {m.num}</div>
            <div className="truncate">{m.title}</div>
          </button>
        ))}
      </div>

      {/* Month detail */}
      <div className="flex-1 overflow-y-auto p-8">
        <div className="max-w-3xl">
          <div className="flex items-start justify-between mb-6">
            <div>
              <div className="text-xs font-mono text-[#58a6ff]/70 uppercase tracking-widest mb-1">
                Month {month.num} of 12
              </div>
              <h1 className="text-2xl font-mono font-bold text-[#e6edf3]">
                {month.title}
              </h1>
            </div>
            {month.budget && (
              <div className="text-right">
                <div className="text-[10px] font-mono text-[#8b949e] uppercase mb-0.5">
                  Budget
                </div>
                <div className="text-sm font-mono text-[#3fb950]">{month.budget}</div>
              </div>
            )}
          </div>

          {month.milestone && (
            <div className="mb-6 p-4 rounded-lg border border-[#d29922]/30 bg-[#d29922]/5">
              <div className="text-xs font-mono text-[#d29922] uppercase mb-1 tracking-widest">
                Critical Milestone
              </div>
              <p className="text-sm text-[#e6edf3] leading-relaxed">{month.milestone}</p>
            </div>
          )}

          <div className="space-y-6">
            {month.sections.map((section) => {
              const color = HEADING_COLORS[section.heading] ?? "#8b949e";
              return (
                <div key={section.heading}>
                  <h2
                    className="text-xs font-mono uppercase tracking-widest mb-3"
                    style={{ color }}
                  >
                    {section.heading}
                  </h2>
                  <div className="space-y-1.5">
                    {section.tasks.map((task, i) => (
                      <div
                        key={i}
                        className={`flex gap-3 p-3 rounded-md text-sm leading-relaxed ${
                          task.isMilestone
                            ? "border border-[#d29922]/25 bg-[#d29922]/5 text-[#e6edf3]"
                            : "text-[#8b949e]"
                        }`}
                      >
                        <span
                          className={`shrink-0 mt-0.5 text-xs font-mono ${
                            task.isMilestone ? "text-[#d29922]" : "text-[#30363d]"
                          }`}
                        >
                          {task.isMilestone ? "★" : "·"}
                        </span>
                        <span>{task.text}</span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Navigation buttons */}
          <div className="flex gap-3 mt-10 pt-6 border-t border-[#21262d]">
            {activeMonth > 1 && (
              <button
                onClick={() => setActiveMonth(activeMonth - 1)}
                className="px-4 py-2 rounded-md text-sm text-[#8b949e] border border-[#21262d] hover:text-[#e6edf3] hover:border-[#30363d] transition-colors"
              >
                ← Mo {activeMonth - 1}
              </button>
            )}
            {activeMonth < 12 && (
              <button
                onClick={() => setActiveMonth(activeMonth + 1)}
                className="ml-auto px-4 py-2 rounded-md text-sm text-[#58a6ff] border border-[#58a6ff]/30 hover:bg-[#58a6ff]/10 transition-colors"
              >
                Mo {activeMonth + 1} →
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
