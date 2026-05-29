"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { clsx } from "clsx";

const NAV_ITEMS = [
  { href: "/", label: "Build", icon: "⚡" },
  { href: "/dashboard", label: "Projects", icon: "▣" },
  { href: "/agents", label: "Agents", icon: "◈" },
  { href: "/settings", label: "Settings", icon: "⬡" },
];

const EVIDENCE_NAV = [
  { href: "/vault", label: "Vault", icon: "◉" },
  { href: "/claims", label: "Claims", icon: "◎" },
  { href: "/graph", label: "Graph", icon: "⬡" },
  { href: "/theory", label: "Theory", icon: "▣" },
];

export function AscNavigation() {
  const path = usePathname();

  return (
    <nav className="w-60 shrink-0 h-screen sticky top-0 border-r border-gray-800 bg-gray-950 flex flex-col">
      <div className="px-5 py-5 border-b border-gray-800">
        <div className="text-sm font-bold text-white tracking-tight">ASC</div>
        <div className="text-[10px] text-indigo-400/80 mt-0.5">Autonomous Software Company</div>
      </div>

      <div className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
        <div className="text-[10px] font-mono text-gray-600 uppercase px-3 mb-2">Platform</div>
        {NAV_ITEMS.map(({ href, label, icon }) => (
          <Link
            key={href}
            href={href}
            className={clsx(
              "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all",
              path === href || (href !== "/" && path.startsWith(href))
                ? "bg-indigo-600/20 text-indigo-400 border border-indigo-500/30"
                : "text-gray-400 hover:text-gray-200 hover:bg-gray-800/60"
            )}
          >
            <span className="text-base leading-none w-5 text-center">{icon}</span>
            {label}
          </Link>
        ))}

        <div className="text-[10px] font-mono text-gray-600 uppercase px-3 mb-2 mt-6">Evidence AI</div>
        {EVIDENCE_NAV.map(({ href, label, icon }) => (
          <Link
            key={href}
            href={href}
            className={clsx(
              "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all",
              path === href
                ? "bg-blue-600/20 text-blue-400 border border-blue-500/30"
                : "text-gray-500 hover:text-gray-300 hover:bg-gray-800/40"
            )}
          >
            <span className="text-base leading-none w-5 text-center">{icon}</span>
            {label}
          </Link>
        ))}
      </div>

      <div className="px-5 py-4 border-t border-gray-800">
        <div className="text-[10px] text-gray-600 font-mono">v1.0.0 — MVP</div>
      </div>
    </nav>
  );
}
