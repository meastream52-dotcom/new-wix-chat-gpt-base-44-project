"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";

const EXAMPLES = [
  "Build a SaaS project management app with teams, tasks, and Stripe subscriptions",
  "Create a marketplace for freelancers with profiles, job listings, and payments",
  "Build an AI-powered customer support dashboard with ticket management",
  "Create a booking system for fitness studios with calendar and payments",
  "Build a multi-tenant analytics dashboard with charts and CSV exports",
];

const AGENTS = [
  { icon: "🧠", name: "Product Manager", desc: "Gathers requirements, writes specs" },
  { icon: "🎨", name: "UI/UX Designer", desc: "Designs layouts & component structure" },
  { icon: "⚛️", name: "Frontend Engineer", desc: "React, Next.js, Tailwind components" },
  { icon: "⚙️", name: "Backend Engineer", desc: "API routes, auth, business logic" },
  { icon: "🗄️", name: "Database Architect", desc: "PostgreSQL schema, Prisma ORM" },
  { icon: "🧪", name: "QA Engineer", desc: "Unit, integration & E2E tests" },
  { icon: "🔒", name: "Security Auditor", desc: "OWASP review, vulnerability fixes" },
  { icon: "🚀", name: "DevOps Engineer", desc: "Docker, GitHub Actions, Vercel" },
  { icon: "💳", name: "Billing Specialist", desc: "Stripe subscriptions & payments" },
  { icon: "📖", name: "Tech Writer", desc: "README, API docs, architecture" },
  { icon: "🐛", name: "Debug Expert", desc: "Error detection & auto-fixing" },
  { icon: "🎯", name: "Orchestrator", desc: "Coordinates all agents end-to-end" },
];

const FEATURES = [
  { icon: "⚡", title: "Full-Stack Generation", desc: "Frontend, backend, database, auth, payments — all from one prompt" },
  { icon: "🤖", title: "12 Specialized Agents", desc: "Each agent is an expert in its domain, working together under a lead AI orchestrator" },
  { icon: "👁️", title: "Real-Time Pipeline", desc: "Watch every agent decision as it happens with live logs" },
  { icon: "✋", title: "Smart Approval Gates", desc: "AI asks permission before deploying, spending money, or deleting files" },
  { icon: "📁", title: "Full Code Access", desc: "Browse, edit, and download every generated file" },
  { icon: "🔗", title: "GitHub + Vercel", desc: "Automatic repo creation and deployment to production" },
];

const PRICING = [
  {
    name: "Free", price: "$0", period: "/month",
    features: ["3 projects", "10 builds/month", "3 core agents", "Community support"],
    cta: "Get started free", highlight: false,
  },
  {
    name: "Pro", price: "$29", period: "/month",
    features: ["25 projects", "100 builds/month", "All 12 agents", "GitHub + Vercel deploy", "Priority support"],
    cta: "Start building", highlight: true,
  },
  {
    name: "Enterprise", price: "$99", period: "/month",
    features: ["Unlimited projects", "Unlimited builds", "All agents + integrations", "Private deployment", "Dedicated support"],
    cta: "Contact us", highlight: false,
  },
];

export default function LandingPage() {
  const [prompt, setPrompt] = useState("");
  const [exampleIndex, setExampleIndex] = useState(0);
  const router = useRouter();
  const { data: session } = useSession();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;
    if (session) {
      router.push(`/dashboard?prompt=${encodeURIComponent(prompt)}`);
    } else {
      router.push(`/register?prompt=${encodeURIComponent(prompt)}`);
    }
  };

  return (
    <div className="min-h-screen">
      {/* Nav */}
      <nav className="border-b border-[#21262d] px-6 py-4 flex items-center justify-between sticky top-0 z-50 bg-[#0f1117]/90 backdrop-blur">
        <div className="flex items-center gap-2">
          <span className="text-2xl">⚡</span>
          <span className="font-bold text-lg text-white">BuilderAI</span>
        </div>
        <div className="hidden md:flex items-center gap-6 text-sm text-[#8b949e]">
          <a href="#features" className="hover:text-white transition-colors">Features</a>
          <a href="#agents" className="hover:text-white transition-colors">Agents</a>
          <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
        </div>
        <div className="flex items-center gap-3">
          {session ? (
            <Link href="/dashboard" className="bg-[#58a6ff] hover:bg-[#79b8ff] text-[#0f1117] font-semibold px-4 py-2 rounded-lg text-sm transition-colors">
              Dashboard
            </Link>
          ) : (
            <>
              <Link href="/login" className="text-sm text-[#8b949e] hover:text-white transition-colors">Sign in</Link>
              <Link href="/register" className="bg-[#58a6ff] hover:bg-[#79b8ff] text-[#0f1117] font-semibold px-4 py-2 rounded-lg text-sm transition-colors">
                Get started
              </Link>
            </>
          )}
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-5xl mx-auto px-6 py-24 text-center">
        <div className="inline-flex items-center gap-2 bg-[#161b22] border border-[#21262d] rounded-full px-4 py-1.5 text-sm text-[#58a6ff] mb-8">
          <span className="w-2 h-2 rounded-full bg-[#3fb950] animate-pulse" />
          Powered by Claude AI — 12 specialized agents working together
        </div>
        <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
          Describe your app.
          <br />
          <span className="bg-gradient-to-r from-[#58a6ff] via-[#79b8ff] to-[#a5d6ff] bg-clip-text text-transparent">
            AI builds it.
          </span>
        </h1>
        <p className="text-xl text-[#8b949e] mb-12 max-w-2xl mx-auto">
          Type what you want to build. 12 specialized AI agents handle requirements, design, code, tests, security, and deployment — automatically.
        </p>
        <form onSubmit={handleSubmit} className="max-w-3xl mx-auto">
          <div className="relative bg-[#161b22] border border-[#21262d] rounded-2xl p-2 focus-within:border-[#58a6ff] transition-colors shadow-2xl">
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder={EXAMPLES[exampleIndex]}
              className="w-full bg-transparent text-white placeholder-[#4d5566] resize-none outline-none px-4 pt-3 pb-2 text-base min-h-[80px]"
              onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSubmit(e); } }}
            />
            <div className="flex items-center justify-between px-4 pb-3">
              <button type="button" onClick={() => setExampleIndex((i) => (i + 1) % EXAMPLES.length)} className="text-xs text-[#8b949e] hover:text-[#58a6ff] transition-colors">
                Try an example →
              </button>
              <button type="submit" disabled={!prompt.trim()} className="bg-[#58a6ff] hover:bg-[#79b8ff] disabled:bg-[#21262d] disabled:text-[#4d5566] text-[#0f1117] font-semibold px-6 py-2.5 rounded-xl text-sm transition-colors flex items-center gap-2">
                <span>Build it</span><span>→</span>
              </button>
            </div>
          </div>
        </form>
        <div className="flex items-center justify-center gap-4 mt-6 text-xs text-[#4d5566]">
          <span>✓ No credit card required</span><span>·</span>
          <span>✓ 3 free projects</span><span>·</span>
          <span>✓ Full source code</span>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="max-w-6xl mx-auto px-6 py-20">
        <h2 className="text-3xl font-bold text-white text-center mb-4">Everything included. Automatically.</h2>
        <p className="text-[#8b949e] text-center mb-12">Not just code generation — a full software development pipeline.</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {FEATURES.map((f) => (
            <div key={f.title} className="bg-[#161b22] border border-[#21262d] rounded-xl p-6 hover:border-[#30363d] transition-colors">
              <div className="text-3xl mb-3">{f.icon}</div>
              <h3 className="text-white font-semibold mb-2">{f.title}</h3>
              <p className="text-[#8b949e] text-sm">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Pipeline */}
      <section className="max-w-4xl mx-auto px-6 py-10">
        <div className="bg-[#161b22] border border-[#21262d] rounded-2xl p-8">
          <h3 className="text-white font-semibold mb-6 text-center">The AI Pipeline</h3>
          <div className="flex flex-wrap justify-center items-center gap-3 text-sm">
            {["Your Prompt", "Orchestrator", "Product Manager", "UI/UX", "Database", "Backend", "Frontend", "Security", "Tests", "DevOps", "Deploy"].map((step, i, arr) => (
              <div key={step} className="flex items-center gap-3">
                <div className={`px-3 py-1.5 rounded-lg text-xs font-medium ${i === 0 ? "bg-[#58a6ff] text-[#0f1117]" : i === arr.length - 1 ? "bg-[#3fb950] text-[#0f1117]" : "bg-[#21262d] text-[#8b949e]"}`}>
                  {step}
                </div>
                {i < arr.length - 1 && <span className="text-[#4d5566]">→</span>}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Agents */}
      <section id="agents" className="max-w-6xl mx-auto px-6 py-20">
        <h2 className="text-3xl font-bold text-white text-center mb-4">12 Specialized AI Agents</h2>
        <p className="text-[#8b949e] text-center mb-12">Each agent is a domain expert. One orchestrator coordinates them all.</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {AGENTS.map((agent) => (
            <div key={agent.name} className="bg-[#161b22] border border-[#21262d] rounded-xl p-4 hover:border-[#30363d] transition-colors">
              <div className="text-2xl mb-2">{agent.icon}</div>
              <div className="text-white font-medium text-sm mb-1">{agent.name}</div>
              <div className="text-[#8b949e] text-xs">{agent.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Integrations */}
      <section className="max-w-4xl mx-auto px-6 py-10 text-center">
        <h3 className="text-[#8b949e] text-sm font-medium mb-6 uppercase tracking-wider">Integrates with your stack</h3>
        <div className="flex flex-wrap justify-center gap-3">
          {["Next.js", "React", "TypeScript", "PostgreSQL", "Prisma", "Stripe", "GitHub", "Vercel", "Docker", "Claude API", "OpenAI", "Supabase", "n8n", "VS Code", "Cursor"].map((t) => (
            <span key={t} className="bg-[#161b22] border border-[#21262d] px-3 py-1.5 rounded-full text-xs text-[#8b949e]">{t}</span>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="max-w-5xl mx-auto px-6 py-20">
        <h2 className="text-3xl font-bold text-white text-center mb-4">Simple pricing</h2>
        <p className="text-[#8b949e] text-center mb-12">Start free. Upgrade when you need more.</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {PRICING.map((plan) => (
            <div key={plan.name} className={`rounded-2xl p-6 border ${plan.highlight ? "border-[#58a6ff] bg-[#161b22] ring-1 ring-[#58a6ff]/20" : "border-[#21262d] bg-[#161b22]"}`}>
              {plan.highlight && <div className="text-xs font-semibold text-[#58a6ff] uppercase tracking-wider mb-4">Most popular</div>}
              <div className="text-white font-bold text-lg">{plan.name}</div>
              <div className="mt-2 mb-6">
                <span className="text-4xl font-bold text-white">{plan.price}</span>
                <span className="text-[#8b949e] text-sm">{plan.period}</span>
              </div>
              <ul className="space-y-2 mb-8">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm text-[#8b949e]">
                    <span className="text-[#3fb950]">✓</span> {f}
                  </li>
                ))}
              </ul>
              <Link href={session ? "/settings" : "/register"} className={`block text-center py-2.5 rounded-xl font-semibold text-sm transition-colors ${plan.highlight ? "bg-[#58a6ff] hover:bg-[#79b8ff] text-[#0f1117]" : "bg-[#21262d] hover:bg-[#30363d] text-white"}`}>
                {plan.cta}
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-3xl mx-auto px-6 py-20 text-center">
        <h2 className="text-4xl font-bold text-white mb-4">Ready to build something?</h2>
        <p className="text-[#8b949e] mb-8">Join builders using AI to ship software 10x faster.</p>
        <Link href="/register" className="inline-flex items-center gap-2 bg-[#58a6ff] hover:bg-[#79b8ff] text-[#0f1117] font-bold px-8 py-4 rounded-xl text-lg transition-colors">
          Start building for free →
        </Link>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#21262d] px-6 py-8 text-center text-[#4d5566] text-sm">
        <div className="flex items-center justify-center gap-2 mb-3">
          <span>⚡</span><span className="font-semibold text-[#8b949e]">BuilderAI</span>
        </div>
        <p>Build software with AI — from prompt to production.</p>
      </footer>
    </div>
  );
}
