import Link from "next/link";

const CORE_OFFER = [
  {
    icon: "◈",
    title: "Shorter, better performance days",
    desc: "AI handles backgrounds, environments, and VFX — talent focuses on acting.",
  },
  {
    icon: "◈",
    title: "Higher per-day pay",
    desc: "Budgets reallocate from crew and set costs to talent.",
  },
  {
    icon: "◈",
    title: "Consent ownership",
    desc: "Talent owns their digital twin data and can revoke consent at any time.",
  },
  {
    icon: "◈",
    title: "Profit participation",
    desc: "Revenue share on AI uses of performance — not a flat buyout.",
  },
  {
    icon: "◈",
    title: "Full transparency",
    desc: "Auditable pipeline — talent sees exactly how their likeness is used.",
  },
  {
    icon: "◈",
    title: "Multi-format participation",
    desc: "A performance becomes a book, comic, international dub — talent earns from all formats.",
  },
];

const ADVISORY_BOARD = [
  {
    role: "Mid-career character actor",
    why: "Vocal about AI rights — they exist and are active on social media",
    comp: "Paid advisory role + equity",
  },
  {
    role: "Voice actor",
    why: "SAG-AFTRA AI committee connections",
    comp: "Paid advisory role + equity",
  },
  {
    role: "Director",
    why: "Has experimented with AI tools, credibility with creative community",
    comp: "First-look on projects",
  },
  {
    role: "Showrunner",
    why: "Curious but cautious — represents the mainstream perspective",
    comp: "First-look on projects",
  },
];

const SEQUENCE_STEPS = [
  {
    phase: "Projects 1–3",
    label: "Unknown but talented",
    desc: "Generous terms. They become your studio's faces. No A-list expectations — build the pipeline and track record.",
  },
  {
    phase: "Projects 4–5",
    label: "Recognizable character actors",
    desc: '"I saw what you did with Project 1, that was interesting" — this is how the conversation starts.',
  },
  {
    phase: "Project 6+ (Year 2)",
    label: "A-list talent",
    desc: "Approach with a proven pipeline, a library, a theater network, and a creator platform. The pitch now has substance.",
  },
];

const AGENT_CHECKLIST = [
  { q: "Is this SAG signatory?", a: "Yes — from day one" },
  { q: "What's the money?", a: "Be real about budgets; offer creative backend and equity-like participation" },
  { q: "How is AI being used with my client?", a: "Show them the consent and transparency infrastructure" },
  { q: "Who else is attached?", a: "Advisory board — names breed names" },
  { q: "Is this going to be embarrassing?", a: "Show them finished work. Quality kills this objection." },
];

const PERFORMER_TYPES = [
  { type: "Hero characters", treatment: "Always human-performed (even if AI-augmented). Audience connection to a real performer is your premium content signal." },
  { type: "Supporting / background", treatment: "Mix of human and synthetic, clearly disclosed." },
  { type: "Animation characters", treatment: "Voices are human-performed, visuals are generated. Cleanest current model for AI entertainment." },
  { type: "Creator platform characters", treatment: "Library of original synthetic characters, with optional licensed real-performer characters (consent + revenue share)." },
];

export default function TalentPage() {
  return (
    <div className="p-8 max-w-4xl">
      <div className="mb-2">
        <Link href="/playbook" className="text-xs text-[#8b949e] hover:text-[#e6edf3] transition-colors">
          ← Playbook
        </Link>
      </div>
      <div className="mb-2 mt-4">
        <span className="text-xs font-mono text-[#3fb950]/70 uppercase tracking-widest">Section 02</span>
      </div>
      <h1 className="text-2xl font-mono font-bold text-[#e6edf3] mb-2">Talent Strategy</h1>
      <p className="text-[#8b949e] mb-10 leading-relaxed max-w-2xl">
        Actors are scared. Studios are scared of actors being scared. You can be the studio that talent wants to work with.
        This is a genuine competitive advantage in a market where everyone else is either exploiting performers or tiptoeing around them.
      </p>

      {/* Core offer */}
      <section className="mb-10">
        <div className="p-4 rounded-lg border border-[#3fb950]/20 bg-[#3fb950]/5 mb-5">
          <div className="text-xs font-mono text-[#3fb950] uppercase tracking-widest mb-1">The Core Offer to Talent</div>
          <p className="text-sm text-[#e6edf3] font-semibold">
            "We use AI to make you more valuable, not to replace you."
          </p>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {CORE_OFFER.map(({ icon, title, desc }) => (
            <div key={title} className="p-4 rounded-lg border border-[#21262d] bg-[#161b22]">
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-[#3fb950] text-xs">{icon}</span>
                <span className="text-sm font-medium text-[#e6edf3]">{title}</span>
              </div>
              <p className="text-xs text-[#8b949e] leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Talent advisory board */}
      <section className="mb-10">
        <h2 className="text-xs font-mono text-[#8b949e] uppercase tracking-widest mb-1">
          Talent Advisory Board
        </h2>
        <p className="text-xs text-[#8b949e] mb-4">
          Form this <em>before</em> approaching any talent for projects. Gives you credibility, real feedback, and names that breed more names.
        </p>
        <div className="overflow-hidden rounded-lg border border-[#21262d]">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#21262d] bg-[#161b22]">
                <th className="text-left px-4 py-3 text-xs font-mono text-[#8b949e] uppercase">Role</th>
                <th className="text-left px-4 py-3 text-xs font-mono text-[#8b949e] uppercase">Why them</th>
                <th className="text-left px-4 py-3 text-xs font-mono text-[#8b949e] uppercase">Comp</th>
              </tr>
            </thead>
            <tbody>
              {ADVISORY_BOARD.map(({ role, why, comp }, i) => (
                <tr key={role} className={`border-b border-[#21262d] last:border-0 ${i % 2 === 0 ? "" : "bg-[#161b22]/40"}`}>
                  <td className="px-4 py-3 text-[#e6edf3] font-medium">{role}</td>
                  <td className="px-4 py-3 text-[#8b949e]">{why}</td>
                  <td className="px-4 py-3 text-[#3fb950] text-xs font-mono">{comp}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* A-list sequence */}
      <section className="mb-10">
        <h2 className="text-xs font-mono text-[#8b949e] uppercase tracking-widest mb-1">
          How to Sequence Toward A-List Talent
        </h2>
        <p className="text-xs text-[#8b949e] mb-4">
          You won't get A-list for Project 1. Don't try. The sequencing is the strategy.
        </p>
        <div className="space-y-3">
          {SEQUENCE_STEPS.map(({ phase, label, desc }, i) => (
            <div key={phase} className="flex gap-4 p-4 rounded-lg border border-[#21262d] bg-[#161b22]">
              <div className="shrink-0 text-center">
                <div className="w-8 h-8 rounded-full border border-[#58a6ff]/30 bg-[#58a6ff]/10 flex items-center justify-center text-xs font-mono text-[#58a6ff] mb-1">
                  {i + 1}
                </div>
              </div>
              <div>
                <div className="text-xs font-mono text-[#58a6ff]/70 mb-0.5">{phase}</div>
                <div className="text-sm font-semibold text-[#e6edf3] mb-1">{label}</div>
                <div className="text-xs text-[#8b949e] leading-relaxed">{desc}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Agent/manager checklist */}
      <section className="mb-10">
        <h2 className="text-xs font-mono text-[#8b949e] uppercase tracking-widest mb-1">
          What Agents and Managers Care About
        </h2>
        <p className="text-xs text-[#8b949e] mb-4">When you call CAA or WME, this is their checklist.</p>
        <div className="space-y-2">
          {AGENT_CHECKLIST.map(({ q, a }) => (
            <div key={q} className="flex gap-4 p-3 rounded-md border border-[#21262d] bg-[#161b22]">
              <div className="shrink-0 text-[#d29922] text-xs font-mono pt-0.5">?</div>
              <div>
                <div className="text-sm text-[#e6edf3] mb-0.5">{q}</div>
                <div className="text-xs text-[#3fb950]">{a}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Synthetic vs human */}
      <section className="mb-10">
        <h2 className="text-xs font-mono text-[#8b949e] uppercase tracking-widest mb-1">
          Synthetic vs. Human Performers
        </h2>
        <p className="text-xs text-[#8b949e] mb-4">
          Your studio uses both. Never pass a synthetic performer off as human — be ahead of mandatory disclosure curves.
        </p>
        <div className="space-y-2">
          {PERFORMER_TYPES.map(({ type, treatment }) => (
            <div key={type} className="flex gap-4 p-3 rounded-md border border-[#21262d] bg-[#161b22]">
              <div className="shrink-0">
                <span className="text-xs font-mono font-semibold text-[#a371f7] px-2 py-0.5 rounded bg-[#a371f7]/10 border border-[#a371f7]/20">
                  {type}
                </span>
              </div>
              <div className="text-xs text-[#8b949e] leading-relaxed">{treatment}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Land-based talent pipeline */}
      <section>
        <h2 className="text-xs font-mono text-[#8b949e] uppercase tracking-widest mb-3">
          The 500-Acre Talent Pipeline (Long-Term)
        </h2>
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: "Residences", desc: "Short-term housing for performers on extended shoots" },
            { label: "On-site training", desc: '"Learn to act for AI production" — skills for scan marks and reference capture' },
            { label: "Acting school partnerships", desc: "Your studio becomes a training ground" },
            { label: "Community theater scouting", desc: "Talent pipeline from the grassroots at theater network locations" },
          ].map(({ label, desc }) => (
            <div key={label} className="p-4 rounded-lg border border-[#21262d] bg-[#161b22]">
              <div className="text-sm font-medium text-[#e6edf3] mb-1">{label}</div>
              <div className="text-xs text-[#8b949e]">{desc}</div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
