"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

const BUSINESS_TYPES = [
  { id: "hvac", label: "HVAC", icon: "🌬️" },
  { id: "plumbing", label: "Plumbing", icon: "🔧" },
  { id: "roofing", label: "Roofing", icon: "🏠" },
  { id: "dental", label: "Dental", icon: "🦷" },
  { id: "real-estate", label: "Real Estate", icon: "🏘️" },
  { id: "insurance", label: "Insurance", icon: "🛡️" },
  { id: "salon", label: "Salon / Spa", icon: "💈" },
  { id: "electrical", label: "Electrical", icon: "⚡" },
  { id: "other", label: "Other", icon: "🏢" },
];

const AGENTS = [
  { type: "RECEPTIONIST", name: "AI Receptionist", icon: "◈", desc: "Handles inquiries, books appointments" },
  { type: "SALES_FOLLOWUP", name: "AI Sales Agent", icon: "◇", desc: "Qualifies leads, drafts emails" },
  { type: "SUPPORT", name: "AI Customer Support", icon: "◎", desc: "Resolves customer issues" },
  { type: "DOCUMENT", name: "AI Document Agent", icon: "▤", desc: "Extracts data from documents" },
  { type: "TRAINING", name: "AI Training Agent", icon: "▣", desc: "Generates training materials" },
];

export default function OnboardingPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const businessId = (session?.user as { businessId?: string })?.businessId ?? "";

  const [step, setStep] = useState(1);
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", industry: "", description: "", phone: "", address: "" });
  const [selectedAgents, setSelectedAgents] = useState<string[]>(AGENTS.map((a) => a.type));
  const [saving, setSaving] = useState(false);

  const handleFinish = async () => {
    setSaving(true);
    await fetch("/api/onboarding", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        businessId,
        name: form.name || `My ${selectedType ?? "Business"}`,
        industry: form.industry || (selectedType ?? ""),
        description: form.description,
        phone: form.phone,
        address: form.address,
        agents: selectedAgents,
      }),
    });
    setSaving(false);
    router.push("/dashboard");
  };

  const toggleAgent = (type: string) => {
    setSelectedAgents((prev) =>
      prev.includes(type) ? prev.filter((a) => a !== type) : [...prev, type]
    );
  };

  return (
    <div className="min-h-screen bg-[#0f1117] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-2xl">
        {/* Progress */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center gap-2">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${
                  s <= step ? "bg-[#58a6ff] text-[#0f1117]" : "bg-[#21262d] text-[#8b949e]"
                }`}
              >
                {s < step ? "✓" : s}
              </div>
              {s < 3 && <div className={`w-16 h-0.5 ${s < step ? "bg-[#58a6ff]" : "bg-[#21262d]"}`} />}
            </div>
          ))}
        </div>

        <div className="text-center mb-8">
          <div className="text-[10px] text-[#58a6ff] font-mono uppercase tracking-widest mb-1">Step {step} of 3</div>
          <h1 className="text-2xl font-bold text-[#e6edf3]">
            {step === 1 && "What type of business do you run?"}
            {step === 2 && "Tell us about your business"}
            {step === 3 && "Choose your AI agents"}
          </h1>
          <p className="text-[#8b949e] text-sm mt-1">
            {step === 1 && "We'll personalize your AI agents for your industry."}
            {step === 2 && "This helps your AI agents represent your business accurately."}
            {step === 3 && "All agents are enabled by default. Toggle any off to start simple."}
          </p>
        </div>

        {/* Step 1: Business type */}
        {step === 1 && (
          <div className="grid grid-cols-3 gap-3">
            {BUSINESS_TYPES.map((bt) => (
              <button
                key={bt.id}
                onClick={() => { setSelectedType(bt.id); setForm((p) => ({ ...p, industry: bt.label })); }}
                className={`p-4 rounded-lg border text-center transition-all ${
                  selectedType === bt.id
                    ? "border-[#58a6ff] bg-[#58a6ff]/10"
                    : "border-[#21262d] bg-[#161b22] hover:border-[#30363d]"
                }`}
              >
                <div className="text-2xl mb-1">{bt.icon}</div>
                <div className="text-sm font-medium text-[#e6edf3]">{bt.label}</div>
              </button>
            ))}
          </div>
        )}

        {/* Step 2: Business info */}
        {step === 2 && (
          <div className="bg-[#161b22] border border-[#21262d] rounded-lg p-6 space-y-4">
            {[
              { label: "Business Name *", key: "name", type: "text", placeholder: "Cool Air HVAC" },
              { label: "Phone Number", key: "phone", type: "tel", placeholder: "(555) 867-5309" },
              { label: "Address", key: "address", type: "text", placeholder: "123 Main St, City, State" },
              { label: "Description", key: "description", type: "textarea", placeholder: "Brief description of what your business does…" },
            ].map(({ label, key, type, placeholder }) => (
              <div key={key}>
                <label className="block text-xs text-[#8b949e] mb-1">{label}</label>
                {type === "textarea" ? (
                  <textarea
                    value={form[key as keyof typeof form]}
                    onChange={(e) => setForm((p) => ({ ...p, [key]: e.target.value }))}
                    rows={3}
                    placeholder={placeholder}
                    className="w-full bg-[#0f1117] border border-[#21262d] rounded-md px-3 py-2 text-sm text-[#e6edf3] placeholder-[#8b949e] focus:outline-none focus:border-[#58a6ff] resize-none"
                  />
                ) : (
                  <input
                    type={type}
                    value={form[key as keyof typeof form]}
                    onChange={(e) => setForm((p) => ({ ...p, [key]: e.target.value }))}
                    placeholder={placeholder}
                    className="w-full bg-[#0f1117] border border-[#21262d] rounded-md px-3 py-2 text-sm text-[#e6edf3] placeholder-[#8b949e] focus:outline-none focus:border-[#58a6ff]"
                  />
                )}
              </div>
            ))}
          </div>
        )}

        {/* Step 3: Agent selection */}
        {step === 3 && (
          <div className="space-y-3">
            {AGENTS.map((agent) => (
              <button
                key={agent.type}
                onClick={() => toggleAgent(agent.type)}
                className={`w-full flex items-center gap-4 p-4 rounded-lg border text-left transition-all ${
                  selectedAgents.includes(agent.type)
                    ? "border-[#58a6ff]/50 bg-[#58a6ff]/5"
                    : "border-[#21262d] bg-[#161b22] opacity-60"
                }`}
              >
                <span className="text-2xl">{agent.icon}</span>
                <div className="flex-1">
                  <div className="font-medium text-[#e6edf3] text-sm">{agent.name}</div>
                  <div className="text-xs text-[#8b949e]">{agent.desc}</div>
                </div>
                <div
                  className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                    selectedAgents.includes(agent.type) ? "border-[#58a6ff] bg-[#58a6ff]" : "border-[#8b949e]"
                  }`}
                >
                  {selectedAgents.includes(agent.type) && <span className="text-[#0f1117] text-xs font-bold">✓</span>}
                </div>
              </button>
            ))}
          </div>
        )}

        {/* Navigation */}
        <div className="flex justify-between mt-8">
          <button
            onClick={() => setStep((s) => s - 1)}
            disabled={step === 1}
            className="px-5 py-2 bg-[#21262d] text-[#8b949e] rounded-md text-sm hover:bg-[#30363d] disabled:opacity-30"
          >
            Back
          </button>
          {step < 3 ? (
            <button
              onClick={() => setStep((s) => s + 1)}
              disabled={step === 1 && !selectedType}
              className="px-6 py-2 bg-[#58a6ff] text-[#0f1117] rounded-md text-sm font-semibold hover:bg-[#79c0ff] disabled:opacity-50"
            >
              Continue →
            </button>
          ) : (
            <button
              onClick={handleFinish}
              disabled={saving}
              className="px-6 py-2 bg-[#58a6ff] text-[#0f1117] rounded-md text-sm font-semibold hover:bg-[#79c0ff] disabled:opacity-50"
            >
              {saving ? "Setting up…" : "Launch Dashboard →"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
