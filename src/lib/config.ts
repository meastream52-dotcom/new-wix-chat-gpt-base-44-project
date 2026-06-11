import { prisma } from "@/lib/prisma";

/**
 * Platform tunables live in the platform_config table (values are JSON
 * strings), never hardcoded. Defaults below apply until an admin sets a value.
 */
const DEFAULTS: Record<string, unknown> = {
  revenue_split: { ownerPct: 50, writerPct: 40, userPct: 10 },
  premium_price_cents: 500,
  minimum_payout_cents: 1000,
  banned_comment_patterns: [],
  // Used as the revenue source in dev/demo when Stripe is not configured
  demo_monthly_revenue_cents: 0,
};

export async function getConfig<T>(key: string): Promise<T> {
  const row = await prisma.platformConfig.findUnique({ where: { key } });
  if (row) {
    try {
      return JSON.parse(row.value) as T;
    } catch {
      return row.value as unknown as T;
    }
  }
  return DEFAULTS[key] as T;
}

export async function setConfig(key: string, value: unknown): Promise<void> {
  const serialized = JSON.stringify(value);
  await prisma.platformConfig.upsert({
    where: { key },
    create: { key, value: serialized },
    update: { value: serialized },
  });
}

export interface RevenueSplit {
  ownerPct: number;
  writerPct: number;
  userPct: number;
}

export async function getRevenueSplit(): Promise<RevenueSplit> {
  const split = await getConfig<RevenueSplit>("revenue_split");
  const { ownerPct, writerPct, userPct } = split;
  if (ownerPct + writerPct + userPct !== 100) {
    throw new Error(
      `Invalid revenue split ${ownerPct}/${writerPct}/${userPct} — must total 100`
    );
  }
  return split;
}
