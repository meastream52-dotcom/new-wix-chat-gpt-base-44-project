import { NextResponse } from "next/server";
import { getAdminUser } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";

/** Final gate: one-click publish of a drafted listing to the storefront. */
export async function POST(_req: Request, { params }: { params: { id: string } }) {
  if (!(await getAdminUser())) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const supabase = createAdminClient();
  const { data: product, error } = await supabase
    .from("products")
    .update({ status: "published", updated_at: new Date().toISOString() })
    .eq("id", params.id)
    .eq("status", "draft")
    .select()
    .single();
  if (error || !product) {
    return NextResponse.json({ error: error?.message ?? "not a draft" }, { status: 409 });
  }

  await supabase
    .from("custom_requests")
    .update({ status: "published", updated_at: new Date().toISOString() })
    .eq("product_id", params.id);

  return NextResponse.json({ ok: true, slug: product.slug });
}
