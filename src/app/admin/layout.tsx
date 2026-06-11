import Link from "next/link";
import { notFound } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

/**
 * Layout-level guard: anyone who isn't staff gets a 404 — the admin panel's
 * existence isn't advertised. MODERATOR sees read-only views; mutation
 * endpoints additionally enforce ADMIN per-route.
 */
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  if (!user || (user.role !== "ADMIN" && user.role !== "MODERATOR")) notFound();

  const tabs = [
    ["/admin/revenue", "Revenue"],
    ["/admin/payouts", "Payouts"],
    ["/admin/fraud", "Fraud"],
    ["/admin/content", "Content"],
    ["/admin/users", "Users"],
    ["/admin/health", "Health"],
  ] as const;

  return (
    <div>
      <div className="flex items-center gap-4 border-b border-gray-200 pb-3">
        <h1 className="text-lg font-bold">Admin</h1>
        <nav className="flex gap-3 text-sm text-gray-600">
          {tabs.map(([href, label]) => (
            <Link key={href} href={href} className="hover:text-ink">{label}</Link>
          ))}
        </nav>
        {user.role === "MODERATOR" && (
          <span className="badge ml-auto bg-amber-100 text-amber-800">read-only</span>
        )}
      </div>
      <div className="mt-6">{children}</div>
    </div>
  );
}
