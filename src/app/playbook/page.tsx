import Link from "next/link";

const SECTIONS = [
  {
    num: "01",
    href: "/playbook/operating-plan",
    title: "12-Month Operating Plan",
    desc: "Month-by-month task sequencing, team milestones, and critical-path items from foundation to Series A positioning.",
    stat: "12 months · 5 critical milestones",
    color: "#58a6ff",
  },
  {
    num: "02",
    href: "/playbook/talent",
    title: "Talent Strategy",
    desc: "How to attract A-list talent, form an advisory board, structure consent infrastructure, and build the performer pipeline.",
    stat: "Advisory board · SAG compliance · Digital twins",
    color: "#3fb950",
  },
  {
    num: "03",
    href: "/playbook/projects",
    title: "First 5 Projects",
    desc: "The ordered slate: animated short, documentary, live-action hybrid, series pilot, and community anthology — each chosen for strategic proof.",
    stat: "$300K–$570K total · Traditional cost: $25M+",
    color: "#d29922",
  },
  {
    num: "04",
    href: "/playbook/pitch",
    title: "Anthology Fund Pitch Deck",
    desc: "13-slide deck structure, application framing for Menlo VC's Anthology Fund, and the investor outreach email template.",
    stat: "13 slides · Target: $250K–$500K seed",
    color: "#f0883e",
  },
];

const KEYMETRICS = [
  { label: "Year-1 content budget", value: "$300K–$570K" },
  { label: "Traditional equivalent", value: "$25M+" },
  { label: "Theater locations (Mo 12)", value: "65–100" },
  { label: "Target Series A", value: "$15M–$30M" },
  { label: "Team at year end", value: "10–15 people" },
  { label: "Projects shipped", value: "5" },
];

export default function PlaybookHome() {
  return (
    <div className="p-8 max-w-5xl">
      <div className="mb-2">
        <span className="text-xs font-mono text-[#58a6ff]/70 uppercase tracking-widest">
          AI Movie Studio
        </span>
      </div>
      <h1 className="text-3xl font-mono font-bold text-[#e6edf3] mb-3">
        Playbook — Part 3
      </h1>
      <p className="text-[#8b949e] max-w-2xl mb-10 leading-relaxed">
        12-month operating plan, talent strategy, first 5 projects, and Anthology Fund pitch deck.
        Every task maps to a person or role. Bold milestones are critical path — miss them and everything downstream shifts.
      </p>

      <section className="mb-10">
        <h2 className="text-xs font-mono text-[#8b949e] uppercase mb-4 tracking-widest">
          Key Metrics — Year 1
        </h2>
        <div className="grid grid-cols-3 gap-3">
          {KEYMETRICS.map(({ label, value }) => (
            <div
              key={label}
              className="p-4 rounded-lg border border-[#21262d] bg-[#161b22]"
            >
              <div className="text-xl font-mono font-bold text-[#e6edf3] mb-1">{value}</div>
              <div className="text-xs text-[#8b949e]">{label}</div>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-xs font-mono text-[#8b949e] uppercase mb-4 tracking-widest">
          Sections
        </h2>
        <div className="grid grid-cols-1 gap-4">
          {SECTIONS.map(({ num, href, title, desc, stat, color }) => (
            <Link
              key={num}
              href={href}
              className="flex gap-5 p-5 rounded-lg border border-[#21262d] bg-[#161b22] hover:border-[#30363d] hover:bg-[#1c2128] transition-all group"
            >
              <span
                className="font-mono text-sm shrink-0 mt-0.5 font-bold"
                style={{ color }}
              >
                {num}
              </span>
              <div className="flex-1">
                <div className="text-base font-semibold text-[#e6edf3] mb-1 group-hover:text-white">
                  {title}
                </div>
                <div className="text-sm text-[#8b949e] mb-3 leading-relaxed">{desc}</div>
                <div className="text-xs font-mono" style={{ color: `${color}99` }}>
                  {stat}
                </div>
              </div>
              <div className="text-[#8b949e] group-hover:text-[#e6edf3] transition-colors self-center text-lg">
                →
              </div>
            </Link>
          ))}
        </div>
      </section>

      <div className="mt-10 p-5 rounded-lg border border-[#f0883e]/20 bg-[#f0883e]/5">
        <div className="text-xs font-mono text-[#f0883e] uppercase mb-2 tracking-widest">
          The Vision
        </div>
        <p className="text-sm text-[#8b949e] leading-relaxed">
          By 2030: the largest AI-native entertainment catalog in the world, 5,000+ community theater locations across the US,
          a creator platform with 1M+ active creators. Vertically integrated from creation to exhibition for the first time
          since the Paramount Decree of 1948. Every person on earth with a story can tell it at theatrical quality.
        </p>
      </div>
    </div>
  );
}
