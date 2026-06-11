import { NextResponse } from "next/server";
import { getAdminUser } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";

/** Operator rejects a request at any stage. */
export async function POST(req: Request, { params }: { params: { id: string } }) {
  if (!(await getAdminUser())) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const { reason } = await req.json().catch(() => ({ reason: null }));

  const supabase = createAdminClient();
  const { error } = await supabase
    .from("custom_requests")
    .update({
      status: "rejected",
      rejection_reason: reason ?? "rejected by operator",
      updated_at: new Date().toISOString(),
    })
    .eq("id", params.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
