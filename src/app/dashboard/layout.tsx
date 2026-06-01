import type { Metadata } from "next";
import { DashboardShell } from "@/components/dashboard/DashboardShell";

export const metadata: Metadata = {
  title: "Platform — Dashboard",
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  // DashboardShell is a Client Component so it can own sidebarOpen state.
  // This layout stays a Server Component — metadata, future data-fetching, etc.
  return <DashboardShell>{children}</DashboardShell>;
}
