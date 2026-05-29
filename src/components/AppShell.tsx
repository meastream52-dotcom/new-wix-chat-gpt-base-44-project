"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { clsx } from "clsx";
import { useState } from "react";

const NAV_SECTIONS = [
  {
    label: "MAIN",
    items: [
      { href: "/dashboard", label: "Dashboard", icon: "⬡" },
    ],
  },
  {
    label: "AI AGENTS",
    items: [
      { href: "/agents", label: "AI Agents", icon: "◈" },
    ],
  },
  {
    label: "OPERATIONS",
    items: [
      { href: "/crm", label: "CRM", icon: "◫" },
      { href: "/appointments", label: "Appointments", icon: "▷" },
      { href: "/workflows", label: "Workflows", icon: "▧" },
    ],
  },
  {
    label: "TOOLS",
    items: [
      { href: "/documents", label: "Documents", icon: "▤" },
      { href: "/training", label: "Training", icon: "▣" },
    ],
  },
  {
    label: "ACCOUNT",
    items: [
      { href: "/settings", label: "Settings", icon: "◉" },
    ],
  },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  const { data: session } = useSession();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="flex h-screen overflow-hidden bg-[#0f1117] text-[#e6edf3]">
      {/* Sidebar */}
      <nav
        className={clsx(
          "shrink-0 h-screen sticky top-0 border-r border-[#21262d] bg-[#0f1117] flex flex-col transition-all duration-200",
          sidebarOpen ? "w-56" : "w-14"
        )}
      >
        {/* Header */}
        <div className="px-4 py-4 border-b border-[#21262d] flex items-center gap-2">
          <span className="text-[#58a6ff] text-lg font-bold">⚙</span>
          {sidebarOpen && (
            <div>
              <div className="text-xs font-mono font-bold text-[#e6edf3]">AutomateOS</div>
              <div className="text-[10px] text-[#8b949e]">AI Workforce</div>
            </div>
          )}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="ml-auto text-[#8b949e] hover:text-[#e6edf3] text-xs"
          >
            {sidebarOpen ? "◁" : "▷"}
          </button>
        </div>

        {/* Nav */}
        <div className="flex-1 py-3 px-2 space-y-4 overflow-y-auto">
          {NAV_SECTIONS.map((section) => (
            <div key={section.label}>
              {sidebarOpen && (
                <div className="text-[9px] font-mono text-[#8b949e]/50 uppercase px-3 pb-1 tracking-widest">
                  {section.label}
                </div>
              )}
              <div className="space-y-0.5">
                {section.items.map(({ href, label, icon }) => {
                  const active = path === href || (href !== "/dashboard" && path.startsWith(href + "/"));
                  return (
                    <Link
                      key={href}
                      href={href}
                      title={!sidebarOpen ? label : undefined}
                      className={clsx(
                        "flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors",
                        active
                          ? "bg-[#161b22] text-[#58a6ff] border border-[#21262d]"
                          : "text-[#8b949e] hover:text-[#e6edf3] hover:bg-[#161b22]"
                      )}
                    >
                      <span className="text-base leading-none shrink-0">{icon}</span>
                      {sidebarOpen && <span className="truncate">{label}</span>}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="px-3 py-3 border-t border-[#21262d]">
          {sidebarOpen ? (
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-[#58a6ff]/20 flex items-center justify-center text-[#58a6ff] text-xs font-bold shrink-0">
                {session?.user?.name?.[0]?.toUpperCase() ?? "U"}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-medium truncate">{session?.user?.name ?? "User"}</div>
                <div className="text-[10px] text-[#8b949e] truncate">{(session?.user as { role?: string })?.role ?? "OWNER"}</div>
              </div>
              <button
                onClick={() => signOut({ callbackUrl: "/auth/login" })}
                className="text-[#8b949e] hover:text-[#f85149] text-xs"
                title="Sign out"
              >
                ✕
              </button>
            </div>
          ) : (
            <button
              onClick={() => signOut({ callbackUrl: "/auth/login" })}
              className="w-full flex items-center justify-center text-[#8b949e] hover:text-[#f85149] text-sm py-1"
              title="Sign out"
            >
              ✕
            </button>
          )}
        </div>
      </nav>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top bar */}
        <header className="h-12 border-b border-[#21262d] bg-[#0f1117] flex items-center px-6 shrink-0">
          <div className="flex-1" />
          <div className="flex items-center gap-4 text-sm text-[#8b949e]">
            <span className="text-xs">
              {session?.user?.name ?? ""}
            </span>
            <Link
              href="/vault"
              className="text-[10px] font-mono text-[#8b949e]/50 hover:text-[#58a6ff] transition-colors"
            >
              Evidence AI ↗
            </Link>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
