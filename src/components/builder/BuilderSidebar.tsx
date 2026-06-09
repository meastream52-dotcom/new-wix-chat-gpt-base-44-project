"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { clsx } from "clsx";

const NAV_ITEMS = [
  { href: "/dashboard", icon: "⊞", label: "Dashboard" },
  { href: "/settings", icon: "⚙", label: "Settings" },
];

export function BuilderSidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();

  return (
    <aside className="w-56 shrink-0 bg-[#161b22] border-r border-[#21262d] flex flex-col h-screen sticky top-0">
      {/* Logo */}
      <div className="flex items-center gap-2 px-4 py-4 border-b border-[#21262d]">
        <span className="text-xl">⚡</span>
        <span className="font-bold text-white text-sm">BuilderAI</span>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {NAV_ITEMS.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={clsx(
              "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors",
              pathname === item.href || pathname.startsWith(item.href + "/")
                ? "bg-[#21262d] text-white"
                : "text-[#8b949e] hover:text-white hover:bg-[#21262d]/50"
            )}
          >
            <span className="text-base">{item.icon}</span>
            {item.label}
          </Link>
        ))}
      </nav>

      {/* User */}
      <div className="border-t border-[#21262d] p-3">
        <div className="flex items-center gap-3 px-2 py-2 rounded-lg mb-2">
          <div className="w-7 h-7 rounded-full bg-[#58a6ff] flex items-center justify-center text-[#0f1117] font-bold text-xs shrink-0">
            {session?.user?.name?.[0]?.toUpperCase() ?? session?.user?.email?.[0]?.toUpperCase() ?? "?"}
          </div>
          <div className="min-w-0">
            <div className="text-xs font-medium text-white truncate">{session?.user?.name ?? "User"}</div>
            <div className="text-xs text-[#8b949e] truncate">{session?.user?.plan ?? "FREE"}</div>
          </div>
        </div>
        <button
          onClick={() => signOut({ callbackUrl: "/" })}
          className="w-full text-left text-xs text-[#8b949e] hover:text-white px-2 py-1.5 rounded transition-colors"
        >
          Sign out
        </button>
      </div>
    </aside>
  );
}
