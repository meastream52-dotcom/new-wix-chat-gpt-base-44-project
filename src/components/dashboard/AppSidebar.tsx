"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { clsx } from "clsx";
import { IconProjects, IconAgents, IconMemory, IconSettings } from "./icons";

const NAV_ITEMS = [
  { href: "/dashboard",          label: "Projects", Icon: IconProjects },
  { href: "/dashboard/agents",   label: "Agents",   Icon: IconAgents   },
  { href: "/dashboard/memory",   label: "Memory",   Icon: IconMemory   },
  { href: "/dashboard/settings", label: "Settings", Icon: IconSettings },
];

interface AppSidebarProps {
  open: boolean;
  onClose: () => void;
}

export function AppSidebar({ open, onClose }: AppSidebarProps) {
  const path = usePathname();

  return (
    <>
      {/* Mobile backdrop */}
      <div
        className={clsx(
          "fixed inset-0 z-30 bg-black/60 backdrop-blur-sm transition-opacity md:hidden",
          open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none",
        )}
        onClick={onClose}
        aria-hidden
      />

      {/* Sidebar panel */}
      <aside
        className={clsx(
          "fixed inset-y-0 left-0 z-40 flex w-60 flex-col",
          "bg-surface border-r border-border",
          "transition-transform duration-200 ease-out",
          // Mobile: slide in/out. Desktop: always visible.
          open ? "translate-x-0" : "-translate-x-full",
          "md:relative md:translate-x-0",
        )}
      >
        {/* Brand */}
        <div className="flex h-14 items-center gap-2.5 border-b border-border px-5 shrink-0">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-accent/15 border border-accent/25">
            <span className="font-mono text-xs font-bold text-accent">P</span>
          </div>
          <span className="text-sm font-semibold tracking-tight text-[#e6edf3]">Platform</span>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-0.5">
          {NAV_ITEMS.map(({ href, label, Icon }) => {
            const isActive =
              href === "/dashboard" ? path === href : path.startsWith(href);

            return (
              <Link
                key={href}
                href={href}
                onClick={onClose}
                className={clsx(
                  "group flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                  isActive
                    ? "bg-accent/10 text-accent border border-accent/20"
                    : "text-muted hover:bg-panel hover:text-[#e6edf3] border border-transparent",
                )}
              >
                <span
                  className={clsx(
                    "h-4 w-4 shrink-0 transition-colors",
                    isActive
                      ? "text-accent"
                      : "text-muted group-hover:text-[#8b949e]",
                  )}
                >
                  <Icon />
                </span>
                {label}
              </Link>
            );
          })}
        </nav>

        {/* Footer label */}
        <div className="shrink-0 border-t border-border px-5 py-4">
          <span className="text-[10px] font-mono text-muted/50">v0.1.0</span>
        </div>
      </aside>
    </>
  );
}
