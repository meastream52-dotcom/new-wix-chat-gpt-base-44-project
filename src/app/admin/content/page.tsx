import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { shortDate } from "@/lib/format";
import { AdminAction } from "@/components/admin/AdminAction";

export const dynamic = "force-dynamic";

export default async function AdminContentPage() {
  const [queue, reports, repeatOffenders] = await Promise.all([
    prisma.post.findMany({
      where: {
        status: "PUBLISHED",
        moderationStatus: { in: ["PENDING", "FLAGGED"] },
      },
      include: { author: { select: { username: true } } },
      orderBy: { createdAt: "asc" },
      take: 100,
    }),
    prisma.report.findMany({
      where: { status: "open", targetType: { in: ["post", "comment"] } },
      include: { reporter: { select: { username: true } } },
      orderBy: { createdAt: "asc" },
      take: 100,
    }),
    prisma.report.groupBy({
      by: ["targetId"],
      where: { targetType: "comment_author", status: "upheld" },
      _count: { _all: true },
      orderBy: { _count: { targetId: "desc" } },
      take: 10,
    }),
  ]);

  return (
    <div>
      <h2 className="text-xl font-bold">Moderation queue</h2>

      <div className="card mt-4">
        <h3 className="text-sm font-semibold text-gray-700">Posts awaiting review ({queue.length})</h3>
        {queue.map((post) => (
          <div key={post.id} className="mt-3 flex flex-wrap items-center gap-3 rounded-lg border border-gray-100 p-3 text-sm">
            <span className={`badge ${post.moderationStatus === "FLAGGED" ? "bg-red-100 text-red-800" : "bg-amber-100 text-amber-800"}`}>
              {post.moderationStatus}
            </span>
            <Link href={`/posts/${post.slug}`} className="font-medium hover:underline">{post.title}</Link>
            <span className="text-xs text-gray-500">@{post.author.username} · {shortDate(post.createdAt)}</span>
            <span className="ml-auto flex gap-2">
              <AdminAction url="/api/admin/moderation" body={{ action: "post_moderate", postId: post.id, status: "APPROVED" }} label="Approve" className="btn-primary" />
              <AdminAction url="/api/admin/moderation" body={{ action: "post_moderate", postId: post.id, status: "REJECTED" }} label="Reject" className="btn-danger" />
            </span>
          </div>
        ))}
        {queue.length === 0 && <p className="mt-2 text-sm text-gray-500">Queue is clear.</p>}
      </div>

      <div className="card mt-6">
        <h3 className="text-sm font-semibold text-gray-700">Open reports ({reports.length})</h3>
        {reports.map((report) => (
          <div key={report.id} className="mt-3 flex flex-wrap items-center gap-3 rounded-lg border border-gray-100 p-3 text-sm">
            <span className="badge bg-gray-100">{report.targetType}</span>
            <span className="max-w-80 truncate" title={report.reason}>{report.reason}</span>
            <span className="text-xs text-gray-500">by @{report.reporter.username} · {shortDate(report.createdAt)}</span>
            <span className="ml-auto flex gap-2">
              <AdminAction
                url="/api/admin/moderation"
                body={{ action: "report_resolve", reportId: report.id, outcome: "upheld" }}
                label="Uphold"
                confirmText="Uphold this report? The content is hidden and the author notified."
                className="btn-danger"
              />
              <AdminAction url="/api/admin/moderation" body={{ action: "report_resolve", reportId: report.id, outcome: "dismissed" }} label="Dismiss" />
            </span>
          </div>
        ))}
        {reports.length === 0 && <p className="mt-2 text-sm text-gray-500">No open reports.</p>}
      </div>

      {repeatOffenders.length > 0 && (
        <div className="card mt-6">
          <h3 className="text-sm font-semibold text-gray-700">Repeat offenders (upheld reports)</h3>
          <RepeatOffenders rows={repeatOffenders.map((r) => ({ userId: r.targetId, count: r._count._all }))} />
        </div>
      )}
    </div>
  );
}

async function RepeatOffenders({ rows }: { rows: Array<{ userId: string; count: number }> }) {
  const users = await prisma.user.findMany({
    where: { id: { in: rows.map((r) => r.userId) } },
    select: { id: true, username: true },
  });
  const nameOf = new Map(users.map((u) => [u.id, u.username]));
  return (
    <div className="mt-2 flex flex-wrap gap-2 text-xs">
      {rows.map((r) => (
        <span key={r.userId} className="badge bg-red-100 text-red-800">
          @{nameOf.get(r.userId) ?? r.userId} · {r.count} upheld
        </span>
      ))}
    </div>
  );
}
