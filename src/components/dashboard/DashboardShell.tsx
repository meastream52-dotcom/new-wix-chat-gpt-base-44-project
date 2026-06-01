"use client";

import { useState } from "react";
import { AppSidebar } from "./AppSidebar";
import { TopBar } from "./TopBar";
import type { Session } from "next-auth";

type SessionUser = Session["user"];

interface DashboardShellProps {
  children: React.ReactNode;
  // Passed down from the Server Component layout so client components
  // can display real user data without an extra client-side fetch.
  user: SessionUser;
}

export function DashboardShell({ children, user }: DashboardShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-surface">
      <AppSidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <TopBar
          user={user}
          onMenuToggle={() => setSidebarOpen((o) => !o)}
        />
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
