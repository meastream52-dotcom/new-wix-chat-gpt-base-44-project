import { NextResponse } from "next/server";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";
import { runIntakeAgent } from "@/agents/intake";
import type { PrinterProfile } from "@/lib/types";

export const maxDuration = 300;

const bodySchema = z.object({
  email: z.string().email(),
  prompt: z.string().min(10).max(4000),
  intended_use: z.object({
    environment: z.enum(["indoor", "outdoor"]),
    heat_exposure: z.boolean(),
    flex_needed: z.boolean(),
    food_contact: z.boolean(),
    cosmetic_only: z.boolean(),
  }),
});

/** Public endpoint: customer submits a custom request; intake agent screens it. */
export async function POST(req: Request) {
  const parsed = bodySchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  const { email, prompt, intended_use } = parsed.data;

  const supabase = createAdminClient();
  const { data: request, error } = await supabase
    .from("custom_requests")
    .insert({ customer_email: email, raw_prompt: prompt, intended_use })
    .select()
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const { data: printers } = await supabase
    .from("printer_profiles")
    .select("*")
    .eq("active", true)
    .limit(1);
  const printer = printers?.[0] as PrinterProfile | undefined;
  if (!printer) {
    return NextResponse.json({ error: "no active printer profile configured" }, { status: 500 });
  }

  try {
    const verdict = await runIntakeAgent({
      requestId: request.id,
      rawPrompt: prompt,
      intendedUse: intended_use,
      printer,
    });

    const rejected = verdict.verdict === "rejected";
    await supabase
      .from("custom_requests")
      .update({
        intake_verdict: verdict,
        status: rejected ? "rejected" : "intake_review",
        rejection_reason: rejected ? verdict.reason : null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", request.id);

    return NextResponse.json({
      id: request.id,
      verdict: verdict.verdict,
      reason: verdict.reason,
      ip_warning: verdict.ip_warning,
    });
  } catch (err) {
    // Keep the request in 'submitted' so the operator can retry intake.
    console.error("intake failed:", err);
    return NextResponse.json(
      { id: request.id, error: "intake agent failed; request saved for manual review" },
      { status: 502 }
    );
  }
}
