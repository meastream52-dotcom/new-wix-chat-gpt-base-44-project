"use client";

import { usePathname } from "next/navigation";
import { Sidebar } from "@/components/Sidebar";
import { AppShell } from "@/components/AppShell";

const EVIDENCE_ROUTES = ["/vault", "/claims", "/graph", "/theory"];
const APP_ROUTES = [
  "/dashboard",
  "/agents",
  "/crm",
  "/appointments",
  "/workflows",
  "/documents",
  "/training",
  "/settings",
  "/onboarding",
];

export function LayoutRouter({ children }: { children: React.ReactNode }) {
  const path = usePathname();

  const isEvidence = EVIDENCE_ROUTES.some(
    (r) => path === r || path.startsWith(r + "/")
  );
  const isApp = APP_ROUTES.some(
    (r) => path === r || path.startsWith(r + "/")
  );

  if (isEvidence) {
    return (
      <div className="flex h-screen overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    );
  }

  if (isApp) {
    return <AppShell>{children}</AppShell>;
  }

  // Marketing pages: /, /auth/*
  return <>{children}</>;
}
