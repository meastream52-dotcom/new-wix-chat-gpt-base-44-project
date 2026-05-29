import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { BuilderSidebar } from "@/components/builder/BuilderSidebar";

export default async function BuilderLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");

  return (
    <div className="flex h-screen overflow-hidden">
      <BuilderSidebar />
      <main className="flex-1 overflow-y-auto">{children}</main>
    </div>
  );
}
