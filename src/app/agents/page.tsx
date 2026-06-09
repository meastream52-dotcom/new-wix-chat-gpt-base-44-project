"use client";

import { useEffect, useState, useCallback, Suspense } from "react";
import { useSession } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { AgentCard } from "@/components/AgentCard";
import { ChatWidget } from "@/components/ChatWidget";

const AGENTS = [
  {
    type: "RECEPTIONIST",
    name: "AI Receptionist",
    icon: "◈",
    description: "Handles inbound inquiries from customers, captures lead information (name, phone, email), answers FAQs about your business, and books appointments automatically.",
    defaultPrompt: "You are a professional receptionist. Greet callers warmly, capture their name and purpose, answer FAQs about the business, and offer to book appointments. Be friendly and concise.",
  },
  {
    type: "SALES_FOLLOWUP",
    name: "AI Sales Agent",
    icon: "◇",
    description: "Qualifies incoming leads, scores prospects, drafts personalized follow-up emails, and keeps your sales pipeline moving forward without manual effort.",
    defaultPrompt: "You are an expert sales agent. Qualify leads by asking about their needs, budget, and timeline. Score their potential, draft personalized follow-up messages, and advance deals through the pipeline.",
  },
  {
    type: "SUPPORT",
    name: "AI Customer Support",
    icon: "◎",
    description: "Answers customer questions, resolves common issues, escalates complex problems, and creates support tickets — keeping customers happy 24/7.",
    defaultPrompt: "You are a friendly and empathetic customer support agent. Resolve issues clearly and efficiently. For complex issues, create a ticket and escalate. Always end with 'Is there anything else I can help you with?'",
  },
  {
    type: "DOCUMENT",
    name: "AI Document Agent",
    icon: "▤",
    description: "Analyzes uploaded documents including invoices, contracts, forms, and receipts. Extracts key fields like names, dates, amounts, and action items automatically.",
    defaultPrompt: "You are a document analysis specialist. Extract key fields such as names, dates, amounts, line items, and action items from documents. Return structured data and highlight anything requiring attention.",
  },
  {
    type: "TRAINING",
    name: "AI Training Agent",
    icon: "▣",
    description: "Creates employee onboarding materials, SOPs, and FAQs. Employees can ask questions and get answers directly from your company knowledge base.",
    defaultPrompt: "You are a knowledgeable training assistant. Answer employee questions using the company knowledge base. Generate clear SOPs, onboarding checklists, and FAQ documents on request.",
  },
];

const TONE_PRESETS = [
  { label: "Professional", suffix: " Maintain a formal, professional tone at all times." },
  { label: "Friendly", suffix: " Use a warm, conversational tone. Use the customer's name often." },
  { label: "Direct", suffix: " Be concise and to the point. Skip pleasantries unless the customer initiates them." },
  { label: "Empathetic", suffix: " Lead with empathy. Acknowledge feelings before offering solutions." },
];

interface BusinessAgent {
  agentType: string;
  enabled: boolean;
}

interface AgentConfig {
  systemPrompt?: string | null;
  enabled?: boolean;
}

function AgentsContent() {
  const { data: session } = useSession();
  const searchParams = useSearchParams();
  const activeType = searchParams.get("type")?.toUpperCase();
  const businessId = (session?.user as { businessId?: string })?.businessId ?? "demo-business-001";

  const [agentStates, setAgentStates] = useState<Record<string, boolean>>({});
  const [toggling, setToggling] = useState<string | null>(null);
  const [chatAgent, setChatAgent] = useState<string | null>(activeType ?? null);
  const [rightTab, setRightTab] = useState<"chat" | "configure">("chat");

  // Configure tab state
  const [configs, setConfigs] = useState<Record<string, AgentConfig>>({});
  const [promptDraft, setPromptDraft] = useState("");
  const [configSaving, setConfigSaving] = useState(false);
  const [configSaved, setConfigSaved] = useState(false);

  const loadAgents = useCallback(async () => {
    try {
      const res = await fetch(`/api/onboarding?businessId=${businessId}`);
      if (!res.ok) return;
    } catch {
      // ignore
    }
    const states: Record<string, boolean> = {};
    for (const a of AGENTS) states[a.type] = true;
    setAgentStates(states);
  }, [businessId]);

  const loadConfig = useCallback(async (agentType: string) => {
    try {
      const res = await fetch(`/api/agents/${agentType.toLowerCase()}?businessId=${businessId}`);
      if (!res.ok) return;
      const data = await res.json();
      if (data.config) {
        setConfigs((prev) => ({ ...prev, [agentType]: data.config }));
        setPromptDraft(data.config.systemPrompt ?? "");
      }
    } catch { /* ignore */ }
  }, [businessId]);

  useEffect(() => { loadAgents(); }, [loadAgents]);
  useEffect(() => { if (activeType) setChatAgent(activeType); }, [activeType]);

  useEffect(() => {
    if (chatAgent) {
      const existing = configs[chatAgent];
      if (existing !== undefined) {
        setPromptDraft(existing.systemPrompt ?? "");
      } else {
        loadConfig(chatAgent);
      }
    }
  }, [chatAgent, configs, loadConfig]);

  const handleToggle = async (agentType: string, enabled: boolean) => {
    setToggling(agentType);
    setAgentStates((prev) => ({ ...prev, [agentType]: enabled }));
    try {
      await fetch("/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          businessId,
          agents: AGENTS.map((a) => (a.type === agentType ? (enabled ? a.type : null) : agentStates[a.type] ? a.type : null)).filter(Boolean),
        }),
      });
    } catch { /* ignore */ }
    setToggling(null);
  };

  const handleSaveConfig = async () => {
    if (!chatAgent) return;
    setConfigSaving(true);
    try {
      await fetch(`/api/agents/${chatAgent.toLowerCase()}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ businessId, systemPrompt: promptDraft }),
      });
      setConfigs((prev) => ({ ...prev, [chatAgent]: { ...prev[chatAgent], systemPrompt: promptDraft } }));
      setConfigSaved(true);
      setTimeout(() => setConfigSaved(false), 2500);
    } catch { /* ignore */ }
    setConfigSaving(false);
  };

  const handleTonePreset = (suffix: string) => {
    const agent = AGENTS.find((a) => a.type === chatAgent);
    const base = agent?.defaultPrompt ?? "";
    setPromptDraft(base + suffix);
  };

  const activeAgent = AGENTS.find((a) => a.type === chatAgent);

  return (
    <div className="p-6 max-w-7xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#e6edf3]">AI Agents</h1>
        <p className="text-[#8b949e] text-sm mt-1">Your AI workforce — toggle agents on/off, chat, and configure each agent.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Agent cards */}
        <div className="space-y-4">
          {AGENTS.map((agent) => (
            <AgentCard
              key={agent.type}
              name={agent.name}
              description={agent.description}
              icon={agent.icon}
              agentType={agent.type}
              enabled={agentStates[agent.type] ?? true}
              onToggle={handleToggle}
              loading={toggling === agent.type}
            />
          ))}
        </div>

        {/* Right: Chat / Configure */}
        <div className="lg:sticky lg:top-6">
          {chatAgent && activeAgent ? (
            <div>
              {/* Agent selector tabs (top row) */}
              <div className="flex gap-2 mb-3 flex-wrap">
                {AGENTS.map((a) => (
                  <button
                    key={a.type}
                    onClick={() => setChatAgent(a.type)}
                    className={`text-xs px-3 py-1.5 rounded-md border transition-colors ${
                      chatAgent === a.type
                        ? "bg-[#58a6ff]/15 border-[#58a6ff]/40 text-[#58a6ff]"
                        : "bg-[#161b22] border-[#21262d] text-[#8b949e] hover:text-[#e6edf3]"
                    }`}
                  >
                    {a.icon} {a.name}
                  </button>
                ))}
              </div>

              {/* Chat / Configure tab bar */}
              <div className="flex gap-1 mb-3 bg-[#161b22] border border-[#21262d] rounded-lg p-1 w-fit">
                <button
                  onClick={() => setRightTab("chat")}
                  className={`text-xs px-4 py-1.5 rounded-md transition-colors ${
                    rightTab === "chat"
                      ? "bg-[#21262d] text-[#e6edf3]"
                      : "text-[#8b949e] hover:text-[#e6edf3]"
                  }`}
                >
                  Chat
                </button>
                <button
                  onClick={() => setRightTab("configure")}
                  className={`text-xs px-4 py-1.5 rounded-md transition-colors ${
                    rightTab === "configure"
                      ? "bg-[#21262d] text-[#e6edf3]"
                      : "text-[#8b949e] hover:text-[#e6edf3]"
                  }`}
                >
                  Configure
                </button>
              </div>

              {rightTab === "chat" ? (
                <div className="h-[540px]">
                  <ChatWidget
                    agentType={activeAgent.type.toLowerCase()}
                    businessId={businessId}
                    agentName={activeAgent.name}
                    agentIcon={activeAgent.icon}
                    placeholder={`Chat with ${activeAgent.name}…`}
                  />
                </div>
              ) : (
                <div className="bg-[#161b22] border border-[#21262d] rounded-lg p-5 space-y-5">
                  {/* Header */}
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{activeAgent.icon}</span>
                    <div>
                      <div className="font-semibold text-[#e6edf3] text-sm">{activeAgent.name}</div>
                      <div className="text-[10px] text-[#8b949e] font-mono">{activeAgent.type}</div>
                    </div>
                  </div>

                  {/* Tone presets */}
                  <div>
                    <label className="block text-xs text-[#8b949e] mb-2">Quick Tone Presets</label>
                    <div className="flex flex-wrap gap-2">
                      {TONE_PRESETS.map((preset) => (
                        <button
                          key={preset.label}
                          onClick={() => handleTonePreset(preset.suffix)}
                          className="text-xs px-3 py-1.5 rounded-md border border-[#21262d] bg-[#0f1117] text-[#8b949e] hover:text-[#e6edf3] hover:border-[#30363d] transition-colors"
                        >
                          {preset.label}
                        </button>
                      ))}
                      <button
                        onClick={() => {
                          const agent = AGENTS.find((a) => a.type === chatAgent);
                          setPromptDraft(agent?.defaultPrompt ?? "");
                        }}
                        className="text-xs px-3 py-1.5 rounded-md border border-[#21262d] bg-[#0f1117] text-[#8b949e] hover:text-[#e6edf3] hover:border-[#30363d] transition-colors"
                      >
                        Reset Default
                      </button>
                    </div>
                  </div>

                  {/* System prompt */}
                  <div>
                    <label className="block text-xs text-[#8b949e] mb-2">
                      System Prompt
                      <span className="ml-2 text-[#8b949e]/60">— instructions the AI follows in every conversation</span>
                    </label>
                    <textarea
                      value={promptDraft}
                      onChange={(e) => setPromptDraft(e.target.value)}
                      rows={8}
                      placeholder={activeAgent.defaultPrompt}
                      className="w-full bg-[#0f1117] border border-[#21262d] rounded-md px-3 py-2.5 text-sm text-[#e6edf3] placeholder-[#8b949e]/50 focus:outline-none focus:border-[#58a6ff] resize-none font-mono leading-relaxed"
                    />
                    <div className="text-[10px] text-[#8b949e]/60 mt-1">
                      {promptDraft.length} chars
                    </div>
                  </div>

                  {/* Save */}
                  <div className="flex items-center gap-3 pt-1">
                    <button
                      onClick={handleSaveConfig}
                      disabled={configSaving}
                      className="px-5 py-2 bg-[#58a6ff]/20 text-[#58a6ff] border border-[#58a6ff]/30 rounded-md text-sm hover:bg-[#58a6ff]/30 disabled:opacity-50 transition-colors"
                    >
                      {configSaving ? "Saving…" : "Save Configuration"}
                    </button>
                    {configSaved && (
                      <span className="text-xs text-[#3fb950]">✓ Saved</span>
                    )}
                  </div>

                  {/* Info note */}
                  <div className="text-[11px] text-[#8b949e]/60 border-t border-[#21262d] pt-4">
                    Changes apply to new conversations immediately. Existing conversations are not affected.
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-[#161b22] border border-[#21262d] rounded-lg p-8 text-center h-[400px] flex flex-col items-center justify-center">
              <div className="text-4xl mb-3 text-[#8b949e]">◈</div>
              <div className="text-[#e6edf3] font-medium mb-2">Chat with an AI Agent</div>
              <p className="text-[#8b949e] text-sm mb-4">Select an agent from the cards to start a conversation or configure it.</p>
              <div className="flex flex-wrap gap-2 justify-center">
                {AGENTS.map((a) => (
                  <button
                    key={a.type}
                    onClick={() => setChatAgent(a.type)}
                    className="text-xs px-3 py-1.5 bg-[#21262d] text-[#8b949e] hover:text-[#e6edf3] rounded-md border border-[#21262d] hover:border-[#30363d] transition-colors"
                  >
                    {a.icon} {a.name}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function AgentsPage() {
  return (
    <Suspense fallback={<div className="p-6 text-[#8b949e]">Loading agents…</div>}>
      <AgentsContent />
    </Suspense>
  );
}
