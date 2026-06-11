/**
 * Dev verification: runs the fraud scan and the month-end calculation
 * against the seeded database and asserts the core invariants.
 *
 *   npx tsx scripts/verify-pipeline.ts
 */
import { startOfMonth, subDays } from "date-fns";
import { prisma } from "@/lib/prisma";
import { runFraudScan } from "@/lib/fraud/scan";
import { calculatePeriod } from "@/lib/revenue/calculatePeriod";

function assert(cond: boolean, label: string) {
  console.log(`${cond ? "✓" : "✗ FAIL"}  ${label}`);
  if (!cond) process.exitCode = 1;
}

async function main() {
  // --- Fraud scan over the trailing 7 days ---
  const scan = await runFraudScan(subDays(new Date(), 7), new Date());
  console.log("fraud scan:", scan);

  const signals = await prisma.fraudSignal.findMany({ include: { user: true } });
  const types = (u: string) =>
    signals.filter((s) => s.user.username === u).map((s) => `${s.signalType}/${s.severity}`);

  assert(
    types("botfarmer").some((t) => t === "same_ip_same_author/high"),
    "bot farm author flagged high (same_ip_same_author)"
  );
  assert(
    types("bot1").some((t) => t.startsWith("read_without_scroll")),
    "zero-scroll bot reader flagged (read_without_scroll)"
  );
  assert(
    types("ringo").some((t) => t === "engagement_ring/high") &&
      types("ringa").some((t) => t === "engagement_ring/high"),
    "engagement ring flagged high on both sides"
  );
  assert(
    !signals.some((s) => s.user.username === "frank" && s.severity === "high") &&
      !signals.some((s) => s.user.username === "fran" && s.severity === "high"),
    "innocent friends produce no HIGH severity signal"
  );
  assert(
    types("alice").length === 0 && types("bob").length === 0,
    "organic users (alice, bob) are clean"
  );

  const suspicious = await prisma.readingSession.count({ where: { isSuspicious: true } });
  assert(suspicious > 0, `high signals marked sessions suspicious (${suspicious})`);

  // --- Month-end calculation (month-to-date window for the test) ---
  const periodStart = startOfMonth(new Date());
  const periodEnd = new Date();
  periodEnd.setHours(0, 0, 0, 0);

  const period = await calculatePeriod(periodStart, periodEnd);
  console.log("period:", period.status, {
    total: period.totalRevenueCents,
    writer: period.writerPoolCents,
    user: period.userPoolCents,
  });
  assert(period.status === "pending_review", "period lands in pending_review");
  assert(period.totalRevenueCents === 50000n, "demo revenue $500 read from config");

  const entries = await prisma.ledgerEntry.findMany({
    where: { revenuePeriodId: period.id },
    include: { user: true },
  });
  const sum = (src: string) =>
    entries.filter((e) => e.sourceType === src).reduce((s, e) => s + e.amountCents, 0n);
  assert(sum("writer_pool") === period.writerPoolCents, "writer entries sum EXACTLY to the writer pool");
  assert(sum("user_pool") === period.userPoolCents, "user entries sum EXACTLY to the user pool");

  const farmEarnings = entries.filter(
    (e) => e.user.username === "botfarmer" && e.sourceType === "writer_pool"
  );
  assert(
    farmEarnings.length === 0 || farmEarnings.every((e) => e.status === "held_for_review"),
    "bot-farm author earns nothing from suspicious sessions (or is held)"
  );
  assert(
    entries.some((e) => e.user.username === "alice" && e.amountCents > 0n),
    "alice (organic writer) has a positive entry"
  );

  // --- Idempotency: rerun must change nothing ---
  const before = await prisma.ledgerEntry.count();
  await calculatePeriod(periodStart, periodEnd);
  const after = await prisma.ledgerEntry.count();
  assert(before === after, "re-running the period creates zero new entries");

  console.log(`\nentries: ${entries.length}, top:`, entries
    .sort((a, b) => Number(b.amountCents - a.amountCents))
    .slice(0, 5)
    .map((e) => `@${e.user.username} ${e.sourceType} $${(Number(e.amountCents) / 100).toFixed(2)} [${e.status}]`));
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
