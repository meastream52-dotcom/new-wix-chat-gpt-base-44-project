import { NextResponse } from "next/server";
import { z } from "zod";
import { getAdminUser } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";

const bodySchema = z.discriminatedUnion("kind", [
  z.object({
    kind: z.literal("material"),
    id: z.string().uuid(),
    cost_per_kg_cents: z.number().int().positive().optional(),
    in_stock: z.boolean().optional(),
  }),
  z.object({
    kind: z.literal("printer"),
    id: z.string().uuid(),
    hourly_rate_cents: z.number().int().positive().optional(),
    build_x_mm: z.number().int().positive().optional(),
    build_y_mm: z.number().int().positive().optional(),
    build_z_mm: z.number().int().positive().optional(),
    active: z.boolean().optional(),
  }),
]);

/** Updates printer/material config from the admin Config page. */
export async function PATCH(req: Request) {
  if (!(await getAdminUser())) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const parsed = bodySchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  const { kind, id, ...fields } = parsed.data;

  const supabase = createAdminClient();
  const table = kind === "material" ? "materials" : "printer_profiles";
  const { error } = await supabase.from(table).update(fields).eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
