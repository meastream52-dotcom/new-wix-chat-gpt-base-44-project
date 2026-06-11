import { z } from "zod";
import { authErrorResponse, requireAdmin } from "@/lib/auth";
import { confirmSignal, dismissSignal } from "@/lib/fraud/scan";

const schema = z.object({
  signalId: z.string(),
  action: z.enum(["confirm", "dismiss"]),
});

export async function POST(req: Request) {
  try {
    const admin = await requireAdmin();
    const parsed = schema.safeParse(await req.json());
    if (!parsed.success) {
      return Response.json({ error: parsed.error.flatten() }, { status: 400 });
    }
    const { signalId, action } = parsed.data;

    if (action === "confirm") await confirmSignal(admin.id, signalId);
    else await dismissSignal(admin.id, signalId);

    return Response.json({ ok: true });
  } catch (err) {
    return authErrorResponse(err) ?? new Response("Server error", { status: 500 });
  }
}
