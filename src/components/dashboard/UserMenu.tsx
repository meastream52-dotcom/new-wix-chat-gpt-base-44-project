"use client";

import { useState, useRef, useEffect } from "react";
import { clsx } from "clsx";
import { IconChevronDown, IconLogOut, IconSettings } from "./icons";

interface UserMenuProps {
  name: string;
  email: string;
  initials: string;
}

export function UserMenu({ name, email, initials }: UserMenuProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className={clsx(
          "flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-sm transition-colors",
          "hover:bg-panel border border-transparent",
          open && "bg-panel border-border",
        )}
        aria-expanded={open}
        aria-haspopup="true"
      >
        {/* Avatar */}
        <span className="w-7 h-7 rounded-full bg-accent/20 border border-accent/30 flex items-center justify-center shrink-0">
          <span className="text-xs font-mono font-semibold text-accent">{initials}</span>
        </span>
        <span className="hidden sm:block text-[#e6edf3] font-medium">{name}</span>
        <span className="hidden sm:block w-3.5 h-3.5 text-muted">
          <IconChevronDown />
        </span>
      </button>

      {open && (
        <div
          className={clsx(
            "absolute right-0 mt-1.5 w-56 z-50",
            "bg-panel border border-border rounded-xl shadow-2xl shadow-black/40",
            "py-1 overflow-hidden",
          )}
        >
          {/* User info header */}
          <div className="px-4 py-3 border-b border-border">
            <div className="text-sm font-medium text-[#e6edf3] truncate">{name}</div>
            <div className="text-xs text-muted truncate">{email}</div>
          </div>

          {/* Menu items */}
          <div className="py-1">
            <button
              className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-muted hover:text-[#e6edf3] hover:bg-[#1c2128] transition-colors text-left"
              onClick={() => setOpen(false)}
            >
              <span className="w-4 h-4">
                <IconSettings />
              </span>
              Account settings
            </button>
            <button
              className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-danger hover:bg-danger/5 transition-colors text-left"
              onClick={() => setOpen(false)}
            >
              <span className="w-4 h-4">
                <IconLogOut />
              </span>
              Sign out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
