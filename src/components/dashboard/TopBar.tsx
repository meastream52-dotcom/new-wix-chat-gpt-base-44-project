"use client";

import { usePathname } from "next/navigation";
import { IconMenu } from "./icons";
import { UserMenu } from "./UserMenu";

const SECTION_LABELS: Record<string, string> = {
  "/dashboard":          "Projects",
  "/dashboard/agents":   "Agents",
  "/dashboard/memory":   "Memory",
  "/dashboard/settings": "Settings",
};

function getSectionLabel(path: string): string {
  // Exact match first, then longest prefix
  if (SECTION_LABELS[path]) return SECTION_LABELS[path];
  const match = Object.keys(SECTION_LABELS)
    .filter((k) => path.startsWith(k) && k !== "/dashboard")
    .sort((a, b) => b.length - a.length)[0];
  return match ? SECTION_LABELS[match] : "Dashboard";
}

interface TopBarProps {
  onMenuToggle: () => void;
}

export function TopBar({ onMenuToggle }: TopBarProps) {
  const path = usePathname();
  const section = getSectionLabel(path);

  return (
    <header className="flex h-14 items-center justify-between border-b border-border bg-surface px-4 shrink-0">
      {/* Left: hamburger (mobile) + breadcrumb */}
      <div className="flex items-center gap-3">
        {/* Hamburger — only visible on mobile (hidden on md+) */}
        <button
          onClick={onMenuToggle}
          className="md:hidden flex h-8 w-8 items-center justify-center rounded-lg text-muted hover:bg-panel hover:text-[#e6edf3] transition-colors"
          aria-label="Toggle sidebar"
        >
          <span className="w-4 h-4">
            <IconMenu />
          </span>
        </button>

        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm">
          <span className="hidden md:inline text-muted">Platform</span>
          <span className="hidden md:inline text-border">/</span>
          <span className="font-medium text-[#e6edf3]">{section}</span>
        </div>
      </div>

      {/* Right: user menu */}
      <UserMenu
        name="Alex Johnson"
        email="alex@platform.ai"
        initials="AJ"
      />
    </header>
  );
}
