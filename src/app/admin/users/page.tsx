import { prisma } from "@/lib/prisma";
import { dollars, shortDate } from "@/lib/format";
import { AdminAction } from "@/components/admin/AdminAction";

export const dynamic = "force-dynamic";

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;

  const users = await prisma.user.findMany({
    where: q
      ? {
          OR: [
            { username: { contains: q, mode: "insensitive" } },
            { email: { contains: q, mode: "insensitive" } },
            { name: { contains: q, mode: "insensitive" } },
          ],
        }
      : {},
    include: {
      _count: { select: { posts: true, comments: true, engagementEvents: true } },
      ledgerEntries: { select: { amountCents: true, status: true } },
      subscription: { select: { status: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return (
    <div>
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Users</h2>
        <form className="flex gap-2">
          <input name="q" defaultValue={q ?? ""} placeholder="Search username/email" className="input max-w-60" />
          <button className="btn-ghost">Search</button>
        </form>
      </div>

      <div className="card mt-4 overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="text-left text-xs text-gray-500">
            <tr>
              <th className="py-2">User</th><th>Role</th><th>Joined</th><th>Premium</th>
              <th className="text-right">Posts</th><th className="text-right">Comments</th>
              <th className="text-right">Lifetime earned</th><th className="text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => {
              const earned = user.ledgerEntries
                .filter((e) => e.status === "paid" || e.status === "approved")
                .reduce((sum, e) => sum + e.amountCents, 0n);
              return (
                <tr key={user.id} className="border-t border-gray-100">
                  <td className="py-2 font-medium">
                    @{user.username}
                    {user.isFlagged && <span className="ml-1 text-red-600" title="Flagged">⚑</span>}
                  </td>
                  <td><span className="badge bg-gray-100">{user.role}</span></td>
                  <td>{shortDate(user.createdAt)}</td>
                  <td>{user.subscription?.status === "active" || user.subscription?.status === "trialing" ? "✓" : "—"}</td>
                  <td className="text-right">{user._count.posts}</td>
                  <td className="text-right">{user._count.comments}</td>
                  <td className="text-right">{dollars(earned)}</td>
                  <td className="space-x-1 text-right">
                    <AdminAction
                      url="/api/admin/moderation"
                      body={{ action: "user_flag", userId: user.id, flagged: !user.isFlagged }}
                      label={user.isFlagged ? "Unflag" : "Flag"}
                      confirmText={
                        user.isFlagged
                          ? undefined
                          : "Flag this user? Their future ledger entries will be auto-held for review."
                      }
                    />
                    <AdminAction
                      url="/api/admin/moderation"
                      body={{
                        action: "user_role",
                        userId: user.id,
                        role: user.role === "MODERATOR" ? "USER" : "MODERATOR",
                      }}
                      label={user.role === "MODERATOR" ? "Demote" : "Make mod"}
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
