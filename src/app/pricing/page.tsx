import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getConfig } from "@/lib/config";
import { dollars } from "@/lib/format";
import { UpgradeButton } from "@/components/UpgradeButton";

export const dynamic = "force-dynamic";

export default async function PricingPage() {
  const user = await getCurrentUser();
  const priceCents = await getConfig<number>("premium_price_cents");
  const subscription = user
    ? await prisma.subscription.findUnique({ where: { userId: user.id } })
    : null;
  const isPremium =
    subscription?.status === "active" || subscription?.status === "trialing";

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="text-center text-3xl font-extrabold">Go Premium</h1>
      <p className="mt-2 text-center text-gray-600">
        Your subscription funds the writers and readers you love — 40% to the
        writer pool, 10% to the community pool.
      </p>
      <div className="mt-8 grid gap-6 sm:grid-cols-2">
        <div className="card">
          <h2 className="text-lg font-bold">Free</h2>
          <p className="mt-1 text-2xl font-extrabold">$0</p>
          <ul className="mt-4 space-y-2 text-sm text-gray-600">
            <li>✓ Read everything</li>
            <li>✓ Comment & like</li>
            <li>✓ Publish 2 stories per day</li>
            <li>✓ Earn from the community pool</li>
          </ul>
        </div>
        <div className="card border-accent">
          <h2 className="text-lg font-bold text-accent">Premium</h2>
          <p className="mt-1 text-2xl font-extrabold">
            {dollars(priceCents)}<span className="text-sm font-normal text-gray-500">/month</span>
          </p>
          <ul className="mt-4 space-y-2 text-sm text-gray-600">
            <li>✓ Everything in Free</li>
            <li>✓ Unlimited publishing</li>
            <li>✓ Enhanced analytics</li>
            <li>✓ Your reading counts 1.5× for writers</li>
          </ul>
          <div className="mt-5">
            {isPremium ? (
              <p className="badge bg-accent/10 text-accent">You're Premium 🎉</p>
            ) : (
              <UpgradeButton signedIn={!!user} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
