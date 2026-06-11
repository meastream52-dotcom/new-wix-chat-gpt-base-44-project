import Link from "next/link";
import { redirect } from "next/navigation";
import { getAdminUser } from "@/lib/auth";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const admin = await getAdminUser();
  if (!admin) redirect("/login");

  const tabs = [
    ["/admin", "Overview"],
    ["/admin/requests", "Requests"],
    ["/admin/products", "Products"],
    ["/admin/orders", "Orders"],
    ["/admin/config", "Config"],
  ] as const;

  return (
    <div>
      <div className="mb-6 flex items-center gap-1 border-b border-ink-100 pb-2 text-sm">
        {tabs.map(([href, label]) => (
          <Link key={href} href={href} className="rounded-md px-3 py-1.5 hover:bg-ink-100">
            {label}
          </Link>
        ))}
      </div>
      {children}
    </div>
  );
}
