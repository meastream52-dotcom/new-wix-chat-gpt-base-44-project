"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { clsx } from "clsx";

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

interface ChatWidgetProps {
  agentType: string;
  businessId: string;
  placeholder?: string;
  agentName?: string;
  agentIcon?: string;
}

export function ChatWidget({
  agentType,
  businessId,
  placeholder = "Type a message…",
  agentName = "AI Agent",
  agentIcon = "◈",
}: ChatWidgetProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = useCallback(async () => {
    const trimmed = input.trim();
    if (!trimmed || loading) return;

    const userMsg: Message = { role: "user", content: trimmed, timestamp: new Date() };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch(`/api/agents/${agentType}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: trimmed,
          businessId,
          sessionId,
          history: messages.map((m) => ({ role: m.role, content: m.content })),
        }),
      });
      const data = await res.json();
      if (data.sessionId) setSessionId(data.sessionId);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.reply ?? "Sorry, I couldn't process that.", timestamp: new Date() },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Something went wrong. Please try again.", timestamp: new Date() },
      ]);
    } finally {
      setLoading(false);
    }
  }, [input, loading, messages, agentType, businessId, sessionId]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#0f1117] rounded-lg border border-[#21262d] overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-[#21262d] bg-[#161b22]">
        <span className="text-[#58a6ff]">{agentIcon}</span>
        <span className="text-sm font-medium text-[#e6edf3]">{agentName}</span>
        <span
          className={clsx(
            "ml-auto w-2 h-2 rounded-full",
            loading ? "bg-[#d29922] animate-pulse" : "bg-[#3fb950]"
          )}
        />
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-center text-[#8b949e] text-sm mt-8">
            <div className="text-3xl mb-2">{agentIcon}</div>
            <div>Start a conversation with {agentName}</div>
          </div>
        )}
        {messages.map((msg, i) => (
          <div
            key={i}
            className={clsx(
              "flex",
              msg.role === "user" ? "justify-end" : "justify-start"
            )}
          >
            <div
              className={clsx(
                "max-w-[80%] rounded-lg px-3 py-2 text-sm",
                msg.role === "user"
                  ? "bg-[#58a6ff]/15 text-[#e6edf3] border border-[#58a6ff]/30"
                  : "bg-[#161b22] text-[#e6edf3] border border-[#21262d]"
              )}
            >
              <div className="whitespace-pre-wrap">{msg.content}</div>
              <div className="text-[10px] text-[#8b949e] mt-1">
                {msg.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </div>
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-[#161b22] border border-[#21262d] rounded-lg px-3 py-2">
              <div className="flex gap-1">
                <span className="w-1.5 h-1.5 bg-[#8b949e] rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                <span className="w-1.5 h-1.5 bg-[#8b949e] rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                <span className="w-1.5 h-1.5 bg-[#8b949e] rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="p-3 border-t border-[#21262d] bg-[#161b22]">
        <div className="flex gap-2">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            rows={1}
            disabled={loading}
            className="flex-1 bg-[#0f1117] border border-[#21262d] rounded-md px-3 py-2 text-sm text-[#e6edf3] placeholder-[#8b949e] resize-none focus:outline-none focus:border-[#58a6ff] disabled:opacity-50"
          />
          <button
            onClick={sendMessage}
            disabled={loading || !input.trim()}
            className="px-4 py-2 bg-[#58a6ff]/20 text-[#58a6ff] border border-[#58a6ff]/30 rounded-md text-sm hover:bg-[#58a6ff]/30 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Send
          </button>
        </div>
        <div className="text-[10px] text-[#8b949e]/50 mt-1.5 pl-1">Enter to send · Shift+Enter for newline</div>
      </div>
    </div>
  );
}
