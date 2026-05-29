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
  },
  {
    type: "SALES_FOLLOWUP",
    name: "AI Sales Agent",
    icon: "◇",
    description: "Qualifies incoming leads, scores prospects, drafts personalized follow-up emails, and keeps your sales pipeline moving forward without manual effort.",
  },
  {
    type: "SUPPORT",
    name: "AI Customer Support",
    icon: "◎",
    description: "Answers customer questions, resolves common issues, escalates complex problems, and creates support tickets — keeping customers happy 24/7.",
  },
  {
    type: "DOCUMENT",
    name: "AI Document Agent",
    icon: "▤",
    description: "Analyzes uploaded documents including invoices, contracts, forms, and receipts. Extracts key fields like names, dates, amounts, and action items automatically.",
  },
  {
    type: "TRAINING",
    name: "AI Training Agent",
    icon: "▣",
    description: "Creates employee onboarding materials, SOPs, and FAQs. Employees can ask questions and get answers directly from your company knowledge base.",
  },
];

interface BusinessAgent {
  agentType: string;
  enabled: boolean;
}

function AgentsContent() {
  const { data: session } = useSession();
  const searchParams = useSearchParams();
  const activeType = searchParams.get("type")?.toUpperCase();
  const businessId = (session?.user as { businessId?: string })?.businessId ?? "demo-business-001";

  const [agentStates, setAgentStates] = useState<Record<string, boolean>>({});
  const [toggling, setToggling] = useState<string | null>(null);
  const [chatAgent, setChatAgent] = useState<string | null>(activeType ?? null);

  const loadAgents = useCallback(async () => {
    try {
      const res = await fetch(`/api/onboarding?businessId=${businessId}`);
      if (!res.ok) return;
    } catch {
      // ignore — load from agents endpoint
    }
    const states: Record<string, boolean> = {};
    for (const a of AGENTS) states[a.type] = true;
    setAgentStates(states);
  }, [businessId]);

  useEffect(() => { loadAgents(); }, [loadAgents]);
  useEffect(() => { if (activeType) setChatAgent(activeType); }, [activeType]);

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

  const activeAgent = AGENTS.find((a) => a.type === chatAgent);

  return (
    <div className="p-6 max-w-7xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#e6edf3]">AI Agents</h1>
        <p className="text-[#8b949e] text-sm mt-1">Your AI workforce — toggle agents on/off and chat with any agent.</p>
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

        {/* Right: Chat interface */}
        <div className="lg:sticky lg:top-6">
          {chatAgent && activeAgent ? (
            <div className="h-[600px]">
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
              <div className="h-[540px]">
                <ChatWidget
                  agentType={activeAgent.type.toLowerCase()}
                  businessId={businessId}
                  agentName={activeAgent.name}
                  agentIcon={activeAgent.icon}
                  placeholder={`Chat with ${activeAgent.name}…`}
                />
              </div>
            </div>
          ) : (
            <div className="bg-[#161b22] border border-[#21262d] rounded-lg p-8 text-center h-[400px] flex flex-col items-center justify-center">
              <div className="text-4xl mb-3 text-[#8b949e]">◈</div>
              <div className="text-[#e6edf3] font-medium mb-2">Chat with an AI Agent</div>
              <p className="text-[#8b949e] text-sm mb-4">Select an agent from the cards to start a conversation.</p>
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
