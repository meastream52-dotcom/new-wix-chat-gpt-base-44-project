import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getConfig } from "@/lib/config";
import { dollars, shortDate } from "@/lib/format";
import { PayoutOnboardButton } from "@/components/PayoutOnboardButton";

export const dynamic = "force-dynamic";

export default async function PayoutSettingsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/");

  const [account, approved, paid, minimumCents] = await Promise.all([
    prisma.payoutAccount.findUnique({ where: { userId: user.id } }),
    prisma.ledgerEntry.aggregate({
      where: { userId: user.id, status: "approved" },
      _sum: { amountCents: true },
    }),
    prisma.ledgerEntry.findMany({
      where: { userId: user.id, status: "paid" },
      include: { batch: true },
      orderBy: { createdAt: "desc" },
      take: 50,
    }),
    getConfig<number>("minimum_payout_cents"),
  ]);

  const balance = approved._sum.amountCents ?? 0n;
  const hasEarnings = balance > 0n || paid.length > 0;
  const onboarding = account?.onboardingStatus ?? "not_started";

  // Paid entries grouped by payout batch
  const batches = new Map<string, { date: Date; totalCents: bigint }>();
  for (const entry of paid) {
    const key = entry.payoutBatchId ?? "manual";
    const existing = batches.get(key) ?? {
      date: entry.batch?.completedAt ?? entry.createdAt,
      totalCents: 0n,
    };
    existing.totalCents += entry.amountCents;
    batches.set(key, existing);
  }

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="text-2xl font-bold">Payout settings</h1>

      {!hasEarnings && (
        <div className="card mt-6 text-sm text-gray-600">
          <p className="font-medium text-ink">You don't have earnings yet.</p>
          <p className="mt-2">
            Write stories people spend time reading, and engage with the
            community — 40% of subscription revenue goes to writers and 10% to
            readers every month.
          </p>
          <Link href="/dashboard/earnings" className="mt-3 inline-block text-accent underline">
            See how earnings work →
          </Link>
        </div>
      )}

      {hasEarnings && (
        <div className="card mt-6">
          <p className="text-xs text-gray-500">Approved balance</p>
          <p className="mt-1 text-3xl font-extrabold text-accent">{dollars(balance)}</p>
          <p className="mt-1 text-xs text-gray-500">
            Minimum payout: {dollars(minimumCents)}. Balances below the minimum
            roll into the next payout run.
          </p>

          <div className="mt-4">
            {onboarding === "complete" ? (
              <p className="badge bg-emerald-100 text-emerald-800">Payouts enabled ✓</p>
            ) : onboarding === "in_progress" ? (
              <PayoutOnboardButton label="Finish setting up payouts" />
            ) : (
              <PayoutOnboardButton label="Set up payouts" askCountry />
            )}
          </div>
          <p className="mt-3 text-xs text-gray-500">
            Identity verification and tax forms are handled by Stripe during
            onboarding — EchoBlog never stores your tax documents.
          </p>
        </div>
      )}

      {batches.size > 0 && (
        <div className="card mt-6">
          <h2 className="text-sm font-semibold text-gray-700">Payout history</h2>
          <table className="mt-3 w-full text-sm">
            <thead className="text-left text-xs text-gray-500">
              <tr><th className="py-2">Date</th><th className="text-right">Amount</th></tr>
            </thead>
            <tbody>
              {[...batches.entries()].map(([key, batch]) => (
                <tr key={key} className="border-t border-gray-100">
                  <td className="py-2">{shortDate(batch.date)}</td>
                  <td className="text-right font-medium">{dollars(batch.totalCents)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <p className="mt-6 text-xs text-gray-500">
        Why payouts can be held and how reviews work:{" "}
        <Link href="/earnings-policy" className="text-accent underline">earnings policy</Link>.
      </p>
    </div>
  );
}
