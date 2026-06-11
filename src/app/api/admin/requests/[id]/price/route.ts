import { NextResponse } from "next/server";
import { getAdminUser } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { runMaterialPricingAgent } from "@/agents/materialPricing";
import type { DesignResult, IntakeVerdict, IntendedUse } from "@/lib/types";

export const maxDuration = 300;

/**
 * Gate 2: operator approved the design (reviewed the .scad/STL).
 * Runs the Material & Pricing Agent -> three tiers on the draft product.
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
  if (request.status !== "design" || !request.product_id) {
    return NextResponse.json(
      { error: `request is '${request.status}', expected 'design' with a product` },
      { status: 409 }
    );
  }

  const design = request.design_result as DesignResult;
  const verdict = request.intake_verdict as IntakeVerdict;

  // Download the STL if the design agent rendered one.
  let stl: Buffer | null = null;
  if (design.stl_path) {
    const { data } = await supabase.storage.from("models").download(design.stl_path);
    if (data) stl = Buffer.from(await data.arrayBuffer());
  }

  // No STL yet: estimate from bounding box (assume the part fills ~30% of it).
  const dims = design.dimensions_mm ?? verdict.estimated_dimensions_mm;
  const fallbackVolumeCm3 = dims
    ? ((dims[0] * dims[1] * dims[2]) / 1000) * 0.3
    : null;

  try {
    const quotes = await runMaterialPricingAgent({
      productId: request.product_id,
      requestId: request.id,
      stl,
      fallbackVolumeCm3,
      intendedUse: request.intended_use as IntendedUse,
      partSummary: request.raw_prompt,
    });

    await supabase
      .from("custom_requests")
      .update({ status: "pricing", updated_at: new Date().toISOString() })
      .eq("id", request.id);

    return NextResponse.json({ quotes });
  } catch (err) {
    console.error("pricing failed:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "pricing agent failed" },
      { status: 502 }
    );
  }
}
