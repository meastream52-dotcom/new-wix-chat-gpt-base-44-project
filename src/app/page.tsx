import Link from "next/link";

const PIPELINE = [
  { step: "01", label: "Upload", desc: "Ingest historical or legal documents into the vault", href: "/vault" },
  { step: "02", label: "Extract", desc: "AI breaks documents into atomic, verifiable claims", href: "/claims" },
  { step: "03", label: "Judge", desc: "Claims are filtered and scored by confidence", href: "/claims" },
  { step: "04", label: "Graph", desc: "Entities and claims form a knowledge graph", href: "/graph" },
  { step: "05", label: "Contradict", desc: "Temporal and semantic inconsistencies surface as red edges", href: "/graph" },
  { step: "06", label: "Theorize", desc: "Build a theory from claims and receive a scored verdict", href: "/theory" },
];

const CASES = [
  { tag: "marilyn-monroe", label: "Marilyn Monroe", status: "Active" },
  { tag: "jfk", label: "JFK Assassination", status: "Active" },
  { tag: "mlk", label: "MLK Archives", status: "Coming soon" },
];

export default function Home() {
  return (
    <div className="p-8 max-w-4xl">
      <div className="mb-10">
        <h1 className="text-2xl font-mono font-bold text-[#e6edf3] mb-2">Evidence AI</h1>
        <p className="text-[#8b949e]">
          Structured reasoning infrastructure for contested historical information.
        </p>
      </div>

      <section className="mb-10">
        <h2 className="text-xs font-mono text-[#8b949e] uppercase mb-4">Pipeline</h2>
        <div className="grid grid-cols-2 gap-3">
          {PIPELINE.map(({ step, label, desc, href }) => (
            <Link
              key={step}
              href={href}
              className="flex gap-4 p-4 rounded-lg border border-[#21262d] bg-[#161b22] hover:border-[#30363d] transition-colors"
            >
              <span className="font-mono text-xs text-[#58a6ff] shrink-0 mt-0.5">{step}</span>
              <div>
                <div className="text-sm font-medium text-gray-200 mb-0.5">{label}</div>
                <div className="text-xs text-[#8b949e]">{desc}</div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-xs font-mono text-[#8b949e] uppercase mb-4">Case Datasets</h2>
        <div className="space-y-2">
          {CASES.map(({ tag, label, status }) => (
            <div
              key={tag}
              className="flex items-center justify-between p-4 rounded-lg border border-[#21262d] bg-[#161b22]"
            >
              <div className="flex items-center gap-3">
                <span className="w-2 h-2 rounded-full bg-[#58a6ff]" />
                <span className="text-sm text-gray-200">{label}</span>
                <span className="text-xs font-mono text-[#8b949e]">{tag}</span>
              </div>
              <span
                className={
                  status === "Active"
                    ? "text-xs text-green-400 bg-green-500/10 px-2 py-0.5 rounded"
                    : "text-xs text-[#8b949e] bg-[#21262d] px-2 py-0.5 rounded"
                }
              >
                {status}
              </span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
