"use client";

import { usePathname } from "next/navigation";
import { IconMenu } from "./icons";
import { UserMenu } from "./UserMenu";
import type { Session } from "next-auth";

type SessionUser = Session["user"];

const SECTION_LABELS: Record<string, string> = {
  "/dashboard":          "Projects",
  "/dashboard/agents":   "Agents",
  "/dashboard/memory":   "Memory",
  "/dashboard/settings": "Settings",
};

function getSectionLabel(path: string): string {
  if (SECTION_LABELS[path]) return SECTION_LABELS[path];
  const match = Object.keys(SECTION_LABELS)
    .filter((k) => path.startsWith(k) && k !== "/dashboard")
    .sort((a, b) => b.length - a.length)[0];
  return match ? SECTION_LABELS[match] : "Dashboard";
}

function getInitials(user: SessionUser): string {
  const { name, email } = user;
  if (name) {
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  }
  if (email) return email.slice(0, 2).toUpperCase();
  return "?";
}

interface TopBarProps {
  onMenuToggle: () => void;
  user: SessionUser;
}

export function TopBar({ onMenuToggle, user }: TopBarProps) {
  const path = usePathname();
  const section = getSectionLabel(path);

  return (
    <header className="flex h-14 items-center justify-between border-b border-border bg-surface px-4 shrink-0">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuToggle}
          className="md:hidden flex h-8 w-8 items-center justify-center rounded-lg text-muted hover:bg-panel hover:text-[#e6edf3] transition-colors"
          aria-label="Toggle sidebar"
        >
          <span className="w-4 h-4">
            <IconMenu />
          </span>
        </button>

        <div className="flex items-center gap-2 text-sm">
          <span className="hidden md:inline text-muted">Platform</span>
          <span className="hidden md:inline text-border">/</span>
          <span className="font-medium text-[#e6edf3]">{section}</span>
        </div>
      </div>

      <UserMenu
        name={user.name ?? user.email ?? "User"}
        email={user.email ?? ""}
        initials={getInitials(user)}
      />
    </header>
  );
}
