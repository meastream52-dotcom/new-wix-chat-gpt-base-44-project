"use client";

import { useState } from "react";
import Link from "next/link";

type MultiFormat = string[];

type Project = {
  num: number;
  slug: string;
  title: string;
  subtitle: string;
  format: string;
  budget: string;
  timeline: string;
  length: string;
  color: string;
  tagline: string;
  synopsis: string;
  whyThis: string[];
  strategicOutputs: string[];
  multiFormat: MultiFormat;
};

const PROJECTS: Project[] = [
  {
    num: 1,
    slug: "boundary",
    title: "The Boundary",
    subtitle: "Animated Short",
    format: "Animated short",
    budget: "$40K–$80K",
    timeline: "Mo 1–5",
    length: "10–12 minutes",
    color: "#58a6ff",
    tagline: "Pipeline proof. First IP. Theater content.",
    synopsis:
      "A stylized animated short about a child in a near-future city who discovers a portal between the physical and digital world. Visually ambitious, emotionally simple, family-friendly.",
    whyThis: [
      "Animation is the most forgiving medium for current AI generation — stylized characters tolerate variance",
      "No live actors = no SAG complexity on project 1 (voice actors are simpler)",
      "Proves the full pipeline: script → storyboard → generation → audio → post → distribution",
      "Family-friendly for theater network pilot screenings at churches and schools",
      "Creates the first IP universe for multi-format expansion and future creator platform",
    ],
    strategicOutputs: [
      "Pipeline proof-of-concept (30-second clip at month 3, full short at month 4)",
      "The demo you show every investor",
      "First catalog title for the theater network",
      "Comic adaptation proving multi-format",
      "Character LoRAs that become creator platform assets",
    ],
    multiFormat: [
      "Comic adaptation (3–5 pages)",
      "10+ short-form social clips",
      "Making-of content",
      "Educational 'how we made this with AI' for tech press",
    ],
  },
  {
    num: 2,
    slug: "building",
    title: "Building the Studio",
    subtitle: "Documentary Series",
    format: "Documentary series",
    budget: "$20K–$40K",
    timeline: "Mo 2–6",
    length: "4 episodes × 15–20 min",
    color: "#3fb950",
    tagline: "Meta-narrative. Press magnet. Recruiting tool.",
    synopsis:
      "A meta-documentary about building your AI studio. Film the process — the tech decisions, the creative struggles, the land development, the first screenings. Brutally honest.",
    whyThis: [
      "Documentary requires minimal generative production — tests pipeline for non-fiction",
      "Creates an audience for the studio itself, not just any one project — marketing as content",
      "Low cost, high narrative value. Investors, press, and talent all watch this.",
      "Episodic release (one episode per month) provides ongoing content during build phase",
    ],
    strategicOutputs: [
      "Ongoing content for platform and theater network while other projects are in production",
      "Press magnet: tech and entertainment journalists love meta-narratives",
      "Recruiting tool: potential hires see the culture and vision",
      "Fundraising asset: 'watch episode 3 before our meeting'",
    ],
    multiFormat: [
      "Podcast version (audio strip)",
      "Blog posts",
      "Social clips",
      "Behind-the-scenes stills",
    ],
  },
  {
    num: 3,
    slug: "meridian",
    title: "Meridian",
    subtitle: "Live-Action Short",
    format: "Live-action short",
    budget: "$80K–$150K",
    timeline: "Mo 3–8",
    length: "15–20 minutes",
    color: "#d29922",
    tagline: "Hybrid model proof. SAG test. Festival entry.",
    synopsis:
      "A sci-fi thriller about an architect who discovers their AI design tool has been subtly redesigning the city around them. Shot on your 500 acres (exterior locations) with 2–3 shoot days, everything else generative: environments, VFX, backgrounds, score.",
    whyThis: [
      "Proves the hybrid model: real actors + AI everything else",
      "Tests SAG compliance infrastructure in production",
      "Tests the 500-acre backlot as a production asset",
      "Sci-fi genre: AI VFX is most forgiving and most impressive",
      "Creates a 'serious' catalog entry for press and talent conversations",
    ],
    strategicOutputs: [
      "Proves 'we can make real films, not just animations'",
      "First SAG project — demonstrates compliance infrastructure works",
      "Digital twin of first backlot location",
      "Film festival submission: Sundance shorts, SXSW, Tribeca",
    ],
    multiFormat: [
      "Novelization (short story)",
      "Concept art book",
      "Making-of documentary episode",
      "Comic adaptation",
      "5+ social clips",
    ],
  },
  {
    num: 4,
    slug: "chronicles",
    title: "The Boundary: Chronicles",
    subtitle: "Animated Series Pilot",
    format: "Animated series pilot",
    budget: "$100K–$200K",
    timeline: "Mo 6–10",
    length: "3 episodes × 20 min",
    color: "#a371f7",
    tagline: "Series production. IP expansion. Creator platform setup.",
    synopsis:
      "Expansion of Project 1's universe into a series. New characters, deeper world-building, episodic structure. First test of whether your IP has legs.",
    whyThis: [
      "Series production tests pipeline at scale — 3 episodes, not 1",
      "Proves character and world consistency across episodes",
      "Tests the continuity agent seriously for the first time",
      "Series content is what theater subscribers want: recurring reasons to return",
      "Sets up creator platform: 'The Boundary' universe becomes the first sandbox",
    ],
    strategicOutputs: [
      "Recurring content for theater network (weekly screenings)",
      "IP depth that makes the creator platform viable",
      "Series-level production capability for potential partners and streamers",
      "First potential licensing opportunity (a streamer might pick this up)",
    ],
    multiFormat: [
      "Full comic series (one issue per episode)",
      "Expanded universe novellas",
      "Character-of-the-week social content",
      "Interactive episode on creator platform alpha",
    ],
  },
  {
    num: 5,
    slug: "our-stories",
    title: "Our Stories",
    subtitle: "Community Anthology",
    format: "Community anthology",
    budget: "$60K–$100K",
    timeline: "Mo 7–11",
    length: "6 films × 5–10 min",
    color: "#f0883e",
    tagline: "Creator validation. Community engagement. Best press narrative.",
    synopsis:
      "Six short films by six different creators from six different communities, all produced using your studio's pipeline with your team as mentors. Source creators from your theater network communities.",
    whyThis: [
      "Directly validates the creator platform thesis: real people using your tools",
      "Creates content that resonates in theater network communities — local church screens a film made by its members",
      "Best press narrative: 'AI studio democratizes filmmaking'",
      "Tests the creator workflow at a serious level before building the full platform",
      "Builds community goodwill that protects against 'AI is killing Hollywood' press cycles",
    ],
    strategicOutputs: [
      "Creator platform proof-of-concept with real human stories",
      "Community engagement content for every theater location",
      "Evidence for Anthology Fund that 'democratized creation' is real, not a pitch slide",
      "Recruiting pipeline: best community creators might join the studio or become power users",
    ],
    multiFormat: [
      "Comic for each creator's story",
      "Social clips per film",
      "Podcast interview with each creator",
      "Screening at their local theater location",
    ],
  },
];

const SLATE_SUMMARY = [
  { num: 1, title: "The Boundary", format: "Animated short", budget: "$40–80K", timeline: "Mo 1–5", purpose: "Pipeline proof, first IP, theater content" },
  { num: 2, title: "Building the Studio", format: "Documentary", budget: "$20–40K", timeline: "Mo 2–6", purpose: "Meta-narrative, press, recruiting, fundraising" },
  { num: 3, title: "Meridian", format: "Live-action short", budget: "$80–150K", timeline: "Mo 3–8", purpose: "Hybrid model proof, SAG test, festival entry" },
  { num: 4, title: "The Boundary: Chronicles", format: "Animated series pilot", budget: "$100–200K", timeline: "Mo 6–10", purpose: "Series production, IP expansion, creator platform" },
  { num: 5, title: "Our Stories", format: "Community anthology", budget: "$60–100K", timeline: "Mo 7–11", purpose: "Creator validation, community engagement, press" },
];

export default function ProjectsPage() {
  const [activeProject, setActiveProject] = useState(1);
  const project = PROJECTS[activeProject - 1];

  return (
    <div className="p-8 max-w-5xl">
      <div className="mb-2">
        <Link href="/playbook" className="text-xs text-[#8b949e] hover:text-[#e6edf3] transition-colors">
          ← Playbook
        </Link>
      </div>
      <div className="mb-2 mt-4">
        <span className="text-xs font-mono text-[#d29922]/70 uppercase tracking-widest">Section 03</span>
      </div>
      <h1 className="text-2xl font-mono font-bold text-[#e6edf3] mb-2">First 5 Projects</h1>
      <p className="text-[#8b949e] mb-2 max-w-2xl leading-relaxed">
        Chosen to prove the pipeline progressively, build a catalog, test the theater network, and attract increasingly serious talent and capital.
        Each is chosen for strategic reason, not just creative merit.
      </p>
      <div className="text-xs font-mono text-[#3fb950] mb-8">
        Total: $300K–$570K · Traditional equivalent: $25M+ · Cost advantage: 10–20×
      </div>

      {/* Slate table */}
      <section className="mb-8">
        <div className="overflow-hidden rounded-lg border border-[#21262d]">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#21262d] bg-[#161b22]">
                <th className="text-left px-4 py-3 text-xs font-mono text-[#8b949e] uppercase">#</th>
                <th className="text-left px-4 py-3 text-xs font-mono text-[#8b949e] uppercase">Title</th>
                <th className="text-left px-4 py-3 text-xs font-mono text-[#8b949e] uppercase hidden md:table-cell">Format</th>
                <th className="text-left px-4 py-3 text-xs font-mono text-[#8b949e] uppercase">Budget</th>
                <th className="text-left px-4 py-3 text-xs font-mono text-[#8b949e] uppercase hidden lg:table-cell">Timeline</th>
                <th className="w-8 px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {SLATE_SUMMARY.map(({ num, title, format, budget, timeline }) => (
                <tr
                  key={num}
                  onClick={() => setActiveProject(num)}
                  className={`border-b border-[#21262d] last:border-0 cursor-pointer transition-colors ${
                    activeProject === num
                      ? "bg-[#161b22] text-[#e6edf3]"
                      : "hover:bg-[#161b22]/50 text-[#8b949e]"
                  }`}
                >
                  <td className="px-4 py-3">
                    <span
                      className="font-mono text-xs font-bold"
                      style={{ color: PROJECTS[num - 1].color }}
                    >
                      {num}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-medium text-[#e6edf3]">{title}</td>
                  <td className="px-4 py-3 text-xs hidden md:table-cell">{format}</td>
                  <td className="px-4 py-3 text-xs font-mono text-[#3fb950]">{budget}</td>
                  <td className="px-4 py-3 text-xs font-mono hidden lg:table-cell">{timeline}</td>
                  <td className="px-4 py-3 text-[#8b949e]">
                    {activeProject === num ? "▾" : "▸"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Project detail */}
      <section>
        <div
          className="rounded-lg border p-6"
          style={{ borderColor: `${project.color}30`, backgroundColor: `${project.color}05` }}
        >
          <div className="flex items-start justify-between mb-4">
            <div>
              <div className="text-xs font-mono uppercase tracking-widest mb-1" style={{ color: `${project.color}99` }}>
                Project {project.num} · {project.subtitle}
              </div>
              <h2 className="text-xl font-mono font-bold text-[#e6edf3]">{project.title}</h2>
              <div className="text-xs text-[#8b949e] mt-1">{project.tagline}</div>
            </div>
            <div className="text-right shrink-0 ml-4">
              <div className="text-sm font-mono font-bold" style={{ color: project.color }}>
                {project.budget}
              </div>
              <div className="text-xs text-[#8b949e]">{project.timeline}</div>
              <div className="text-xs text-[#8b949e]">{project.length}</div>
            </div>
          </div>

          <p className="text-sm text-[#8b949e] leading-relaxed mb-6">{project.synopsis}</p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h3 className="text-xs font-mono uppercase tracking-widest mb-2" style={{ color: `${project.color}99` }}>
                Why This Is First/Next
              </h3>
              <ul className="space-y-1.5">
                {project.whyThis.map((item, i) => (
                  <li key={i} className="flex gap-2 text-xs text-[#8b949e] leading-relaxed">
                    <span className="shrink-0 text-[#30363d] mt-0.5">·</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="text-xs font-mono uppercase tracking-widest mb-2" style={{ color: `${project.color}99` }}>
                Strategic Outputs
              </h3>
              <ul className="space-y-1.5">
                {project.strategicOutputs.map((item, i) => (
                  <li key={i} className="flex gap-2 text-xs text-[#8b949e] leading-relaxed">
                    <span className="shrink-0 text-[#3fb950] mt-0.5">✓</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="text-xs font-mono uppercase tracking-widest mb-2" style={{ color: `${project.color}99` }}>
                Multi-Format Expansion
              </h3>
              <ul className="space-y-1.5">
                {project.multiFormat.map((item, i) => (
                  <li key={i} className="flex gap-2 text-xs text-[#8b949e] leading-relaxed">
                    <span className="shrink-0 text-[#a371f7] mt-0.5">◈</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Prev / next project nav */}
          <div className="flex gap-3 mt-6 pt-5 border-t" style={{ borderColor: `${project.color}20` }}>
            {activeProject > 1 && (
              <button
                onClick={() => setActiveProject(activeProject - 1)}
                className="px-3 py-1.5 rounded text-xs text-[#8b949e] border border-[#21262d] hover:text-[#e6edf3] transition-colors"
              >
                ← Project {activeProject - 1}
              </button>
            )}
            {activeProject < 5 && (
              <button
                onClick={() => setActiveProject(activeProject + 1)}
                className="ml-auto px-3 py-1.5 rounded text-xs border transition-colors"
                style={{ color: project.color, borderColor: `${project.color}30` }}
              >
                Project {activeProject + 1} →
              </button>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
