"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { clsx } from "clsx";

const NAV = [
  { href: "/", label: "Dashboard", icon: "⬡" },
  { href: "/vault", label: "Vault", icon: "▣" },
  { href: "/claims", label: "Claims", icon: "◈" },
  { href: "/graph", label: "Graph", icon: "◎" },
  { href: "/theory", label: "Theory", icon: "◉" },
  { href: "/podcast", label: "Podcast", icon: "🎙" },
  { href: "/ads", label: "Ad Campaigns", icon: "📢" },
];

export function Sidebar() {
  const path = usePathname();

  return (
    <nav className="w-56 shrink-0 h-screen sticky top-0 border-r border-[#21262d] bg-[#0f1117] flex flex-col">
      <div className="px-5 py-5 border-b border-[#21262d]">
        <div className="text-xs font-mono text-[#8b949e] mb-0.5">EVIDENCE AI</div>
        <div className="text-[10px] text-[#58a6ff]/60">structured reasoning</div>
      </div>

      <div className="flex-1 py-4 px-3 space-y-1">
        {NAV.map(({ href, label, icon }) => (
          <Link
            key={href}
            href={href}
            className={clsx(
              "flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors",
              path === href
                ? "bg-[#161b22] text-[#58a6ff] border border-[#21262d]"
                : "text-[#8b949e] hover:text-gray-200 hover:bg-[#161b22]"
            )}
          >
            <span className="text-base leading-none">{icon}</span>
            {label}
          </Link>
        ))}
      </div>

      <div className="px-5 py-4 border-t border-[#21262d]">
        <div className="text-[10px] text-[#8b949e]/50 font-mono">v0.1.0 — MVP</div>
      </div>
    </nav>
  );
}
