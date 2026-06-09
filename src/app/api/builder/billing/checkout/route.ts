import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { createCheckoutSession, STRIPE_PRICES } from "@/lib/stripe";

const checkoutSchema = z.object({ plan: z.enum(["PRO", "ENTERPRISE"]) });

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await request.json();
    const { plan } = checkoutSchema.parse(body);

    const priceId = plan === "PRO" ? STRIPE_PRICES.PRO_MONTHLY : STRIPE_PRICES.ENTERPRISE_MONTHLY;
    const origin = request.headers.get("origin") ?? process.env.NEXTAUTH_URL ?? "http://localhost:3000";

    const url = await createCheckoutSession(
      session.user.id,
      session.user.email,
      priceId,
      `${origin}/settings?upgraded=true`,
      `${origin}/settings`
    );

    return NextResponse.json({ data: { url } });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.errors[0].message }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to create checkout session" }, { status: 500 });
  }
}
