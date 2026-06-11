import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { subDays } from "date-fns";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { MIN_QUALIFIED_SECONDS } from "@/lib/engagement/constants";
import { shortDate } from "@/lib/format";
import { ReadChart } from "@/components/ReadChart";

export const dynamic = "force-dynamic";

const WORDS_PER_MINUTE = 220;

export default async function PostDrilldownPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/");
  const { id } = await params;

  const post = await prisma.post.findUnique({ where: { id } });
  if (!post || (post.authorId !== user.id && user.role !== "ADMIN")) notFound();

  const since = subDays(new Date(), 30);
  const [daily, agg, comments] = await Promise.all([
    prisma.$queryRaw<Array<{ day: Date; minutes: number }>>(Prisma.sql`
      SELECT date_trunc('day', rs."startedAt") AS day,
             SUM(rs."qualifiedSeconds") / 60.0 AS minutes
      FROM reading_sessions rs
      WHERE rs."postId" = ${id} AND rs."startedAt" >= ${since}
        AND rs."isSuspicious" = false
        AND rs."qualifiedSeconds" >= ${MIN_QUALIFIED_SECONDS}
        AND rs."userId" <> ${post.authorId}
      GROUP BY 1 ORDER BY 1
    `),
    prisma.readingSession.aggregate({
      where: {
        postId: id,
        isSuspicious: false,
        qualifiedSeconds: { gte: MIN_QUALIFIED_SECONDS },
        userId: { not: post.authorId },
      },
      _avg: { qualifiedSeconds: true },
      _count: { _all: true },
    }),
    prisma.comment.findMany({
      where: { postId: id, status: "visible" },
      include: { author: { select: { username: true } } },
      orderBy: { createdAt: "desc" },
      take: 20,
    }),
  ]);

  const wordCount = post.contentMarkdown.split(/\s+/).length;
  const estimatedReadSeconds = Math.max(30, (wordCount / WORDS_PER_MINUTE) * 60);
  const avgQualified = agg._avg.qualifiedSeconds ?? 0;
  const completionPct = Math.min(100, Math.round((avgQualified / estimatedReadSeconds) * 100));

  return (
    <div className="mx-auto max-w-3xl">
      <Link href="/dashboard" className="text-sm text-gray-500 hover:underline">← Dashboard</Link>
      <h1 className="mt-2 text-2xl font-bold">{post.title}</h1>
      <p className="text-sm text-gray-500">Published {shortDate(post.publishedAt)}</p>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <div className="card"><p className="text-xs text-gray-500">Qualified sessions</p><p className="mt-1 text-2xl font-extrabold">{agg._count._all}</p></div>
        <div className="card"><p className="text-xs text-gray-500">Avg time per reader</p><p className="mt-1 text-2xl font-extrabold">{Math.round(avgQualified)}s</p></div>
        <div className="card"><p className="text-xs text-gray-500">Completion proxy</p><p className="mt-1 text-2xl font-extrabold">{completionPct}%</p>
          <p className="text-xs text-gray-400">vs ~{Math.round(estimatedReadSeconds)}s estimated read time</p></div>
      </div>

      <div className="card mt-6">
        <h2 className="text-sm font-semibold text-gray-700">Daily read minutes — last 30 days</h2>
        <ReadChart
          data={daily.map((d) => ({
            day: d.day.toISOString().slice(0, 10),
            readMinutes: Math.round(Number(d.minutes) * 10) / 10,
          }))}
        />
      </div>

      <div className="card mt-6">
        <h2 className="text-sm font-semibold text-gray-700">Recent responses</h2>
        <div className="mt-2 divide-y divide-gray-100 text-sm">
          {comments.map((c) => (
            <div key={c.id} className="py-2">
              <span className="font-medium">@{c.author.username}</span>{" "}
              <span className="text-gray-400">· {shortDate(c.createdAt)}</span>
              <p className="mt-0.5 text-gray-700">{c.content}</p>
            </div>
          ))}
          {comments.length === 0 && <p className="py-2 text-gray-500">No responses yet.</p>}
        </div>
      </div>
    </div>
  );
}
