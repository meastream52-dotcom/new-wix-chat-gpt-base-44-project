import Link from "next/link";

const FEATURES = [
  { icon: "◈", title: "AI Receptionist", desc: "Never miss a lead. Handles every inbound inquiry, captures contact info, and books appointments 24/7." },
  { icon: "◇", title: "AI Sales Follow-Up", desc: "Qualify leads automatically, draft personalized outreach emails, and keep your pipeline moving." },
  { icon: "◎", title: "AI Customer Support", desc: "Resolve common issues instantly, escalate complex tickets, keep customers happy around the clock." },
  { icon: "▤", title: "AI Document Agent", desc: "Upload invoices, contracts, forms. Extract names, dates, amounts, and action items automatically." },
  { icon: "▣", title: "AI Training Agent", desc: "Generate onboarding materials, SOPs, and FAQs. Let employees ask questions from your knowledge base." },
  { icon: "▧", title: "Smart Workflows", desc: "Set triggers and actions that run automatically. Follow up with leads, send reminders, update records." },
];

const PLANS = [
  {
    name: "Starter",
    price: "$49",
    period: "/mo",
    features: ["3 AI Agents", "100 leads", "50 appointments/mo", "Basic workflows", "Email support"],
    cta: "Get Started",
    highlight: false,
  },
  {
    name: "Professional",
    price: "$99",
    period: "/mo",
    features: ["All 5 AI Agents", "Unlimited leads", "Unlimited appointments", "Advanced workflows", "Document AI", "Priority support"],
    cta: "Start Free Trial",
    highlight: true,
  },
  {
    name: "Enterprise",
    price: "$249",
    period: "/mo",
    features: ["Everything in Pro", "Custom AI training", "White-label option", "API access", "Dedicated account manager"],
    cta: "Contact Sales",
    highlight: false,
  },
];

const INDUSTRIES = ["HVAC", "Plumbing", "Roofing", "Dental", "Real Estate", "Insurance", "Salons", "Electricians"];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#0f1117] text-[#e6edf3]">
      {/* Nav */}
      <nav className="border-b border-[#21262d] px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-[#58a6ff] text-xl">⚙</span>
          <span className="font-bold text-[#e6edf3]">AutomateOS</span>
        </div>
        <div className="flex items-center gap-4">
          <Link href="#features" className="text-[#8b949e] hover:text-[#e6edf3] text-sm transition-colors hidden md:block">
            Features
          </Link>
          <Link href="#pricing" className="text-[#8b949e] hover:text-[#e6edf3] text-sm transition-colors hidden md:block">
            Pricing
          </Link>
          <Link href="/auth/login" className="text-[#8b949e] hover:text-[#e6edf3] text-sm transition-colors">
            Sign In
          </Link>
          <Link
            href="/auth/signup"
            className="px-4 py-2 bg-[#58a6ff] text-[#0f1117] rounded-md text-sm font-semibold hover:bg-[#79c0ff] transition-colors"
          >
            Get Started
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-5xl mx-auto px-6 py-20 text-center">
        <div className="inline-flex items-center gap-2 bg-[#58a6ff]/10 border border-[#58a6ff]/20 rounded-full px-4 py-1.5 text-xs text-[#58a6ff] mb-6">
          <span className="w-1.5 h-1.5 rounded-full bg-[#58a6ff] animate-pulse" />
          AI-powered workforce for solo entrepreneurs
        </div>
        <h1 className="text-4xl md:text-5xl font-bold text-[#e6edf3] mb-6 leading-tight">
          Your AI Workforce —{" "}
          <span className="text-[#58a6ff]">One Dashboard.</span>
        </h1>
        <p className="text-lg md:text-xl text-[#8b949e] mb-10 max-w-2xl mx-auto leading-relaxed">
          Run your entire business with AI agents. Receptionist, sales, support, training, document processing — all automated so you can focus on growth.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/auth/signup"
            className="px-8 py-3 bg-[#58a6ff] text-[#0f1117] rounded-lg font-semibold hover:bg-[#79c0ff] transition-colors text-lg w-full sm:w-auto text-center"
          >
            Start Free Trial →
          </Link>
          <Link
            href="/auth/login"
            className="px-8 py-3 bg-[#161b22] text-[#e6edf3] border border-[#21262d] rounded-lg hover:border-[#30363d] transition-colors text-lg w-full sm:w-auto text-center"
          >
            View Demo
          </Link>
        </div>
        <p className="text-xs text-[#8b949e] mt-4">No credit card required · 14-day free trial · Cancel anytime</p>

        <div className="mt-10 flex flex-wrap justify-center gap-2">
          {INDUSTRIES.map((ind) => (
            <span key={ind} className="text-xs text-[#8b949e] bg-[#161b22] border border-[#21262d] px-3 py-1 rounded-full">
              {ind}
            </span>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="features" className="max-w-5xl mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-[#e6edf3] mb-3">Your complete AI team</h2>
          <p className="text-[#8b949e]">Five specialized AI agents working together to run your business.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {FEATURES.map((f) => (
            <div key={f.title} className="bg-[#161b22] border border-[#21262d] rounded-lg p-6 hover:border-[#30363d] transition-colors">
              <div className="text-[#58a6ff] text-2xl mb-3">{f.icon}</div>
              <h3 className="font-semibold text-[#e6edf3] mb-2">{f.title}</h3>
              <p className="text-[#8b949e] text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Stats */}
      <section className="border-y border-[#21262d] py-10 bg-[#161b22]/50">
        <div className="max-w-4xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {[
            { value: "24/7", label: "AI always on" },
            { value: "5 min", label: "Setup time" },
            { value: "10×", label: "Faster responses" },
            { value: "$0", label: "Extra staff needed" },
          ].map((s) => (
            <div key={s.label}>
              <div className="text-3xl font-bold text-[#58a6ff]">{s.value}</div>
              <div className="text-sm text-[#8b949e] mt-1">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="max-w-5xl mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-[#e6edf3] mb-3">Simple pricing</h2>
          <p className="text-[#8b949e]">One price, your whole AI team. No per-agent fees.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {PLANS.map((plan) => (
            <div
              key={plan.name}
              className={`rounded-lg p-6 border ${
                plan.highlight
                  ? "border-[#58a6ff]/50 bg-[#58a6ff]/5"
                  : "border-[#21262d] bg-[#161b22]"
              }`}
            >
              {plan.highlight && (
                <div className="text-xs text-[#58a6ff] font-semibold mb-3 uppercase tracking-wide">Most Popular</div>
              )}
              <div className="text-lg font-bold text-[#e6edf3]">{plan.name}</div>
              <div className="mt-2 mb-5">
                <span className="text-3xl font-bold text-[#e6edf3]">{plan.price}</span>
                <span className="text-[#8b949e] text-sm">{plan.period}</span>
              </div>
              <ul className="space-y-2 mb-6">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm text-[#8b949e]">
                    <span className="text-[#3fb950]">✓</span>
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                href="/auth/signup"
                className={`block text-center py-2.5 rounded-md text-sm font-semibold transition-colors ${
                  plan.highlight
                    ? "bg-[#58a6ff] text-[#0f1117] hover:bg-[#79c0ff]"
                    : "bg-[#21262d] text-[#e6edf3] hover:bg-[#30363d]"
                }`}
              >
                {plan.cta}
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-3xl mx-auto px-6 py-16 text-center">
        <h2 className="text-3xl font-bold text-[#e6edf3] mb-4">Ready to hire your AI team?</h2>
        <p className="text-[#8b949e] mb-8">Set up in minutes. Your AI agents start working immediately.</p>
        <Link
          href="/auth/signup"
          className="inline-block px-10 py-4 bg-[#58a6ff] text-[#0f1117] rounded-lg font-bold text-lg hover:bg-[#79c0ff] transition-colors"
        >
          Start Free Trial →
        </Link>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#21262d] px-6 py-8 text-center">
        <div className="flex items-center justify-center gap-2 mb-3">
          <span className="text-[#58a6ff]">⚙</span>
          <span className="font-semibold text-[#e6edf3]">AutomateOS</span>
        </div>
        <p className="text-[#8b949e] text-xs">Your AI Workforce — One Dashboard.</p>
        <div className="flex justify-center gap-6 mt-4 text-xs text-[#8b949e]">
          <Link href="/auth/login" className="hover:text-[#e6edf3] transition-colors">Sign In</Link>
          <Link href="/auth/signup" className="hover:text-[#e6edf3] transition-colors">Sign Up</Link>
          <Link href="/vault" className="hover:text-[#e6edf3] transition-colors">Evidence AI ↗</Link>
        </div>
      </footer>
    </div>
  );
}
