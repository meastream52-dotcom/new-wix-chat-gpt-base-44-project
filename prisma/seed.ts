/**
 * Demo seed: a small working world for dev-auth mode, plus fraud fixtures
 * the nightly scan should (and should not) catch.
 *
 *   npx tsx prisma/seed.ts
 *
 * Users (switch via the dev user picker in the navbar):
 *   admin      — ADMIN
 *   alice      — writer with real engagement
 *   bob        — premium reader/commenter
 *   carol      — writer + reader
 *   botfarmer  — author boosted by a same-IP bot farm   (should flag HIGH)
 *   bot1..bot3 — the farm readers
 *   ringo/ringa — reciprocal engagement ring            (should flag HIGH)
 *   frank/fran — real friends, one reads the other      (should stay low/quiet)
 */
import { PrismaClient } from "@prisma/client";
import { createHash } from "crypto";
import { subDays, subMinutes } from "date-fns";

const prisma = new PrismaClient();

const SALT = process.env.ENGAGEMENT_HASH_SALT ?? "echoblog-dev-salt";
const hash = (s: string) =>
  createHash("sha256").update(`${SALT}:${s}`).digest("hex").slice(0, 32);

async function user(username: string, opts: Partial<{ role: "USER" | "MODERATOR" | "ADMIN"; name: string; createdDaysAgo: number; premium: boolean }> = {}) {
  const u = await prisma.user.upsert({
    where: { username },
    update: {},
    create: {
      username,
      clerkId: `dev_${username}`,
      email: `${username}@demo.echoblog.local`,
      name: opts.name ?? username[0].toUpperCase() + username.slice(1),
      role: opts.role ?? "USER",
      createdAt: subDays(new Date(), opts.createdDaysAgo ?? 60),
      isPremiumCached: opts.premium ?? false,
    },
  });
  if (opts.premium) {
    await prisma.subscription.upsert({
      where: { userId: u.id },
      update: { status: "active" },
      create: {
        userId: u.id,
        stripeCustomerId: `cus_demo_${username}`,
        stripeSubscriptionId: `sub_demo_${username}`,
        status: "active",
        currentPeriodStart: subDays(new Date(), 15),
        currentPeriodEnd: subDays(new Date(), -15),
      },
    });
  }
  return u;
}

async function post(authorId: string, title: string, daysAgo: number, body?: string) {
  const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  return prisma.post.upsert({
    where: { slug },
    update: {},
    create: {
      authorId,
      title,
      slug,
      excerpt: `${title} — a story on EchoBlog.`,
      contentMarkdown:
        body ??
        `# ${title}\n\nThis is a seeded demo story. ${"Readers spend time here, and that time becomes writer earnings. ".repeat(20)}\n\n## A second section\n\n${"More thoughtful prose to scroll through. ".repeat(30)}`,
      status: "PUBLISHED",
      moderationStatus: "APPROVED",
      publishedAt: subDays(new Date(), daysAgo),
      createdAt: subDays(new Date(), daysAgo),
    },
  });
}

/** A closed, qualified reading session + its engagement event. */
async function read(
  userId: string,
  postId: string,
  minutes: number,
  daysAgo: number,
  opts: Partial<{ ip: string; scroll: number }> = {}
) {
  const seconds = Math.min(minutes * 60, 600);
  const startedAt = subMinutes(subDays(new Date(), daysAgo), minutes + 5);
  const session = await prisma.readingSession.create({
    data: {
      userId,
      postId,
      startedAt,
      lastHeartbeatAt: subDays(new Date(), daysAgo),
      closedAt: subDays(new Date(), daysAgo),
      totalSeconds: minutes * 60,
      qualifiedSeconds: seconds,
      maxScrollPct: opts.scroll ?? 85,
      ipHash: hash(opts.ip ?? `ip-${userId}`),
      userAgentHash: hash(`ua-${userId}`),
    },
  });
  await prisma.engagementEvent.create({
    data: {
      userId,
      postId,
      eventType: "read_session_completed",
      points: Math.floor(seconds / 60),
      metadata: { sessionId: session.id, postId, qualifiedSeconds: seconds },
      createdAt: subDays(new Date(), daysAgo),
    },
  });
}

async function comment(userId: string, postId: string, content: string, daysAgo: number) {
  await prisma.comment.create({
    data: {
      authorId: userId,
      postId,
      content,
      contentHash: hash(content.toLowerCase().trim()),
      createdAt: subDays(new Date(), daysAgo),
    },
  });
  await prisma.engagementEvent.create({
    data: { userId, postId, eventType: "comment_created", points: 2, createdAt: subDays(new Date(), daysAgo) },
  });
}

async function like(userId: string, postId: string, daysAgo: number) {
  await prisma.reaction.upsert({
    where: { userId_postId: { userId, postId } },
    update: {},
    create: { userId, postId, createdAt: subDays(new Date(), daysAgo) },
  });
  await prisma.engagementEvent.create({
    data: { userId, postId, eventType: "reaction_created", points: 0, createdAt: subDays(new Date(), daysAgo) },
  });
}

async function main() {
  console.log("Seeding EchoBlog demo data…");

  // Platform config — split lives in the DB, never in code
  for (const [key, value] of Object.entries({
    revenue_split: { ownerPct: 50, writerPct: 40, userPct: 10 },
    premium_price_cents: 500,
    minimum_payout_cents: 1000,
    demo_monthly_revenue_cents: 50000, // $500/mo pretend revenue for the estimator
    banned_comment_patterns: ["buy followers", "crypto giveaway"],
  })) {
    await prisma.platformConfig.upsert({
      where: { key },
      update: { value: JSON.stringify(value) },
      create: { key, value: JSON.stringify(value) },
    });
  }

  // --- Core cast ---
  // Distinct account ages — the self-dealing rule looks at registration
  // proximity, so organic users must not share a createdAt
  const admin = await user("admin", { role: "ADMIN", name: "The Admin", createdDaysAgo: 120 });
  const alice = await user("alice", { name: "Alice Writer", createdDaysAgo: 90 });
  const bob = await user("bob", { name: "Bob Reader", premium: true, createdDaysAgo: 60 });
  const carol = await user("carol", { name: "Carol Both", createdDaysAgo: 45 });

  for (const t of ["writing", "technology", "money", "life"]) {
    await prisma.tag.upsert({
      where: { slug: t },
      update: {},
      create: { name: t, slug: t, creatorId: admin.id },
    });
  }

  const p1 = await post(alice.id, "Why I Left My Job to Write Full Time", 20);
  const p2 = await post(alice.id, "The Economics of Attention", 12);
  const p3 = await post(carol.id, "Field Notes from a Slow Internet", 8);
  const tagRows = await prisma.tag.findMany();
  for (const p of [p1, p2, p3]) {
    await prisma.postTag.createMany({
      data: tagRows.slice(0, 2).map((t) => ({ postId: p.id, tagId: t.id })),
      skipDuplicates: true,
    });
  }

  // Organic engagement spread over this month
  for (const daysAgo of [1, 2, 3, 5, 7, 9]) {
    await read(bob.id, p1.id, 8, daysAgo);
    await read(bob.id, p2.id, 5, daysAgo);
    await read(carol.id, p1.id, 6, daysAgo);
  }
  await read(alice.id, p3.id, 7, 2);
  await read(alice.id, p3.id, 4, 4);
  await comment(bob.id, p1.id, "This resonated — the part about deadlines especially.", 3);
  await comment(carol.id, p1.id, "Saving this one. Thank you for writing it.", 5);
  await comment(bob.id, p3.id, "Slow internet is a feature, not a bug.", 1);
  await like(bob.id, p1.id, 3);
  await like(carol.id, p1.id, 4);
  await like(bob.id, p3.id, 2);
  await like(alice.id, p3.id, 2);

  // --- Fixture 1: bot farm (same IP, 3+ readers, one author) → HIGH ---
  const botfarmer = await user("botfarmer", { name: "Bot Farmer", createdDaysAgo: 30 });
  const farmPost = await post(botfarmer.id, "Ten Tricks They Dont Want You to Know", 6);
  for (const name of ["bot1", "bot2", "bot3"]) {
    const bot = await user(name, { createdDaysAgo: 4 });
    for (const daysAgo of [1, 2, 3]) {
      await read(bot.id, farmPost.id, 10, daysAgo, { ip: "farm-shared-ip", scroll: 0 });
    }
  }

  // --- Fixture 2: engagement ring (reciprocal, concentrated) → HIGH ---
  const ringo = await user("ringo", { createdDaysAgo: 25 });
  const ringa = await user("ringa", { createdDaysAgo: 28 });
  const ringoPost = await post(ringo.id, "My Ring Manifesto Part One", 10);
  const ringaPost = await post(ringa.id, "My Ring Manifesto Part Two", 10);
  // Volume matters: the ring rule only considers users with 20+ events in the window
  for (let daysAgo = 1; daysAgo <= 6; daysAgo++) {
    await read(ringo.id, ringaPost.id, 9, daysAgo);
    await read(ringa.id, ringoPost.id, 9, daysAgo);
    for (let n = 0; n < 3; n++) {
      await comment(ringo.id, ringaPost.id, `Brilliant as always, part ${daysAgo}.${n}!`, daysAgo);
      await comment(ringa.id, ringoPost.id, `Couldn't agree more, part ${daysAgo}.${n}!`, daysAgo);
    }
  }
  await like(ringo.id, ringaPost.id, 1);
  await like(ringa.id, ringoPost.id, 1);

  // --- Fixture 3: innocent friends (one-way, registered together) → low/quiet ---
  const frank = await user("frank", { createdDaysAgo: 5 });
  const fran = await user("fran", { createdDaysAgo: 5 });
  const franPost = await post(fran.id, "Letters to a Friend", 4);
  await read(frank.id, franPost.id, 6, 1);
  await read(frank.id, franPost.id, 5, 2);
  await comment(frank.id, franPost.id, "Proud of you for publishing this.", 1);

  console.log("Done. Demo users: admin, alice, bob (premium), carol, botfarmer, bot1-3, ringo, ringa, frank, fran");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
