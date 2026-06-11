import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { authErrorResponse, requireUser } from "@/lib/auth";
import { getStripe, stripeEnabled } from "@/lib/stripe";

const schema = z.object({
  // Country is collected up-front — it can't be changed on the account later
  country: z.string().length(2).toUpperCase().default("US"),
});

export async function POST(req: Request) {
  try {
    const user = await requireUser();
    if (!stripeEnabled) {
      return Response.json({ error: "Payouts are not configured" }, { status: 503 });
    }
    const stripe = getStripe();
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

    const parsed = schema.safeParse(await req.json().catch(() => ({})));
    if (!parsed.success) {
      return Response.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    let account = await prisma.payoutAccount.findUnique({ where: { userId: user.id } });

    if (!account?.stripeConnectedAccountId) {
      const stripeAccount = await stripe.accounts.create({
        type: "express",
        country: parsed.data.country,
        email: user.email,
        metadata: { userId: user.id },
      });
      account = await prisma.payoutAccount.upsert({
        where: { userId: user.id },
        create: {
          userId: user.id,
          stripeConnectedAccountId: stripeAccount.id,
          onboardingStatus: "in_progress",
        },
        update: {
          stripeConnectedAccountId: stripeAccount.id,
          onboardingStatus: "in_progress",
        },
      });
    }

    // Existing-but-incomplete onboarding just gets a fresh Account Link
    const link = await stripe.accountLinks.create({
      account: account.stripeConnectedAccountId!,
      type: "account_onboarding",
      refresh_url: `${appUrl}/settings/payouts?refresh=true`,
      return_url: `${appUrl}/settings/payouts?complete=true`,
    });

    // The connected account ID itself is never returned to the client
    return Response.json({ url: link.url });
  } catch (err) {
    return authErrorResponse(err) ?? new Response("Server error", { status: 500 });
  }
}
