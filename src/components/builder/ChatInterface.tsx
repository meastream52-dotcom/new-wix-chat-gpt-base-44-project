"use client";
import { useState, useRef, useEffect } from "react";
import type { ConversationMessage } from "@/lib/builder-types";

const AGENT_ICONS: Record<string, string> = {
  ORCHESTRATOR: "🎯", PRODUCT_MANAGER: "🧠", UI_UX: "🎨",
  FRONTEND: "⚛️", BACKEND: "⚙️", DATABASE: "🗄️",
};

interface ChatInterfaceProps {
  messages: ConversationMessage[];
  onSend: (message: string) => void;
  loading?: boolean;
  projectStatus: string;
  className?: string;
}

export function ChatInterface({ messages, onSend, loading, projectStatus, className }: ChatInterfaceProps) {
  const [input, setInput] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = () => {
    if (!input.trim() || loading) return;
    onSend(input.trim());
    setInput("");
  };

  const isBuilding = projectStatus === "BUILDING" || projectStatus === "PLANNING";

  return (
    <div className={`flex flex-col ${className}`}>
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-center text-[#4d5566] text-sm py-8">
            <div className="text-4xl mb-3">🤖</div>
            <p>AI agents are ready to build your project.</p>
            <p className="text-xs mt-1">Click &quot;Start Build&quot; to begin, or chat to get started.</p>
          </div>
        )}
        {messages.map((msg, i) => (
          <div key={i} className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-sm shrink-0 mt-0.5 ${msg.role === "user" ? "bg-[#58a6ff] text-[#0f1117]" : "bg-[#21262d]"}`}>
              {msg.role === "user" ? "U" : (msg.agentType ? AGENT_ICONS[msg.agentType] ?? "🤖" : "🤖")}
            </div>
            <div className={`max-w-[80%] ${msg.role === "user" ? "items-end" : "items-start"} flex flex-col gap-1`}>
              {msg.agentType && (
                <span className="text-xs text-[#4d5566]">{msg.agentType.replace(/_/g, " ")}</span>
              )}
              <div className={`px-4 py-2.5 rounded-xl text-sm leading-relaxed ${msg.role === "user" ? "bg-[#58a6ff] text-[#0f1117]" : "bg-[#21262d] text-[#e6edf3]"}`}>
                {msg.content}
              </div>
              <span className="text-xs text-[#4d5566]">
                {new Date(msg.timestamp).toLocaleTimeString("en", { hour: "2-digit", minute: "2-digit" })}
              </span>
            </div>
          </div>
        ))}
        {isBuilding && (
          <div className="flex gap-3">
            <div className="w-7 h-7 rounded-full bg-[#21262d] flex items-center justify-center text-sm shrink-0">🎯</div>
            <div className="bg-[#21262d] px-4 py-2.5 rounded-xl text-sm text-[#8b949e] flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-[#58a6ff] rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
              <span className="w-1.5 h-1.5 bg-[#58a6ff] rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
              <span className="w-1.5 h-1.5 bg-[#58a6ff] rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="border-t border-[#21262d] p-3">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") handleSend(); }}
            placeholder={isBuilding ? "Building..." : "Ask the AI to make changes..."}
            disabled={loading || isBuilding}
            className="flex-1 bg-[#21262d] border border-[#30363d] text-white placeholder-[#4d5566] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#58a6ff] transition-colors disabled:opacity-50"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || loading || isBuilding}
            className="bg-[#58a6ff] hover:bg-[#79b8ff] disabled:bg-[#21262d] disabled:text-[#4d5566] text-[#0f1117] font-semibold px-4 py-2 rounded-lg text-sm transition-colors"
          >
            →
          </button>
        </div>
      </div>
    </div>
  );
}
