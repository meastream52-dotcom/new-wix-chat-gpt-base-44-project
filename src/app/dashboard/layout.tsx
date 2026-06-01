import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { DashboardShell } from "@/components/dashboard/DashboardShell";

export const metadata: Metadata = {
  title: "Platform — Dashboard",
};

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  // auth() reads the JWT cookie server-side.
  // Middleware already redirected unauthenticated users, but checking here
  // gives us a typed, non-null session for the rest of the tree.
  const session = await auth();
  if (!session?.user) redirect("/login");

  return (
    <DashboardShell user={session.user}>
      {children}
    </DashboardShell>
  );
}
