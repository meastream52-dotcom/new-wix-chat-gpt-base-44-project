import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { BillingPanel } from "@/components/builder/BillingPanel";
import { redirect } from "next/navigation";

export default async function SettingsPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, email: true, name: true, plan: true, createdAt: true, stripeCustomerId: true },
  });
  if (!user) redirect("/login");

  const projectCount = await prisma.project.count({ where: { userId: user.id } });
  const fileCount = await prisma.generatedFile.count({ where: { project: { userId: user.id } } });

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white mb-1">Settings</h1>
        <p className="text-[#8b949e] text-sm">Manage your account and subscription</p>
      </div>

      {/* Account */}
      <section className="bg-[#161b22] border border-[#21262d] rounded-xl p-6 mb-6">
        <h2 className="text-white font-semibold mb-4">Account</h2>
        <div className="space-y-3">
          <div className="flex justify-between items-center py-2 border-b border-[#21262d]">
            <span className="text-sm text-[#8b949e]">Name</span>
            <span className="text-sm text-white">{user.name ?? "—"}</span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-[#21262d]">
            <span className="text-sm text-[#8b949e]">Email</span>
            <span className="text-sm text-white">{user.email}</span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-[#21262d]">
            <span className="text-sm text-[#8b949e]">Member since</span>
            <span className="text-sm text-white">{new Date(user.createdAt).toLocaleDateString()}</span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-[#21262d]">
            <span className="text-sm text-[#8b949e]">Projects</span>
            <span className="text-sm text-white">{projectCount}</span>
          </div>
          <div className="flex justify-between items-center py-2">
            <span className="text-sm text-[#8b949e]">Files generated</span>
            <span className="text-sm text-white">{fileCount}</span>
          </div>
        </div>
      </section>

      {/* Billing */}
      <section className="bg-[#161b22] border border-[#21262d] rounded-xl p-6">
        <BillingPanel currentPlan={user.plan} />
      </section>
    </div>
  );
}
