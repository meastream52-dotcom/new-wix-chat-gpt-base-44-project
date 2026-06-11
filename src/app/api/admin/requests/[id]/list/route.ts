import { NextResponse } from "next/server";
import { getAdminUser } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { runListingAgent } from "@/agents/listing";
import type { DesignResult, IntakeVerdict, TierQuote } from "@/lib/types";

export const maxDuration = 300;

/**
 * Gate 3: operator approved the tier pricing.
 * Runs the Listing Agent -> draft storefront copy awaiting final publish.
 * Blocked for IP-flagged requests (one-off personal-use only, never resale).
 */
export async function POST(_req: Request, { params }: { params: { id: string } }) {
  if (!(await getAdminUser())) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const supabase = createAdminClient();
  const { data: request } = await supabase
    .from("custom_requests")
    .select("*")
    .eq("id", params.id)
    .single();
  if (!request) return NextResponse.json({ error: "not found" }, { status: 404 });
  if (request.status !== "pricing" || !request.product_id) {
    return NextResponse.json(
      { error: `request is '${request.status}', expected 'pricing'` },
      { status: 409 }
    );
  }

  const { data: tierRows } = await supabase
    .from("product_tiers")
    .select("*, materials(name)")
    .eq("product_id", request.product_id);

  const tiers: TierQuote[] = (tierRows ?? []).map((t) => ({
    tier: t.tier,
    material_name: t.materials?.name ?? "",
    available: t.available,
    unavailable_reason: t.available ? null : "unavailable",
    finishing: t.finishing,
    filament_g: Number(t.filament_g),
    print_time_min: t.print_time_min,
    price_cents: t.price_cents,
  }));

  const design = request.design_result as DesignResult;
  const verdict = request.intake_verdict as IntakeVerdict;

  try {
    const listing = await runListingAgent({
      productId: request.product_id,
      partSummary: request.raw_prompt,
      designNotes: design.design_notes,
      dimensionsMm: design.dimensions_mm,
      tiers,
      ipFlags: verdict.ip_flags ?? [],
    });

    await supabase
      .from("custom_requests")
      .update({ status: "listing", updated_at: new Date().toISOString() })
      .eq("id", request.id);

    return NextResponse.json({ listing });
  } catch (err) {
    console.error("listing failed:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "listing agent failed" },
      { status: 502 }
    );
  }
}
