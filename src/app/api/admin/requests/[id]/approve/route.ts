import { NextResponse } from "next/server";
import { getAdminUser } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { runDesignAgent } from "@/agents/design";
import type { IntakeVerdict } from "@/lib/types";

export const maxDuration = 300;

/**
 * Gate 1: operator approves the intake verdict.
 * Runs the Design Agent and creates the draft product shell.
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
  if (request.status !== "intake_review") {
    return NextResponse.json(
      { error: `request is '${request.status}', expected 'intake_review'` },
      { status: 409 }
    );
  }

  const verdict = request.intake_verdict as IntakeVerdict;

  try {
    const design = await runDesignAgent({
      requestId: request.id,
      rawPrompt: request.raw_prompt,
      verdict,
    });

    const { data: product, error } = await supabase
      .from("products")
      .insert({
        request_id: request.id,
        status: "draft",
        title: request.raw_prompt.slice(0, 80),
        slug: `pending-${request.id.slice(0, 8)}`,
        spec_sheet: { dimensions_mm: design.dimensions_mm, notes: design.design_notes },
        stl_paths: design.stl_path ? [design.stl_path] : [],
      })
      .select()
      .single();
    if (error) throw new Error(error.message);

    await supabase
      .from("custom_requests")
      .update({
        status: "design",
        design_result: design,
        product_id: product.id,
        updated_at: new Date().toISOString(),
      })
      .eq("id", request.id);

    return NextResponse.json({ design, product_id: product.id });
  } catch (err) {
    console.error("design failed:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "design agent failed" },
      { status: 502 }
    );
  }
}
