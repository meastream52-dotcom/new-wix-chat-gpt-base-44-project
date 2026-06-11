import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { clerkEnabled } from "@/lib/auth";

/**
 * Dev-auth mode only: switch between seeded demo users via cookie.
 * Hard-disabled when Clerk is configured.
 */
export async function POST(req: Request) {
  if (clerkEnabled) return new Response("Not found", { status: 404 });

  const { username } = await req.json().catch(() => ({}));
  const store = await cookies();

  if (!username) {
    store.delete("dev_user");
    return Response.json({ ok: true, user: null });
  }

  const user = await prisma.user.findUnique({ where: { username } });
  if (!user) return Response.json({ error: "Unknown demo user" }, { status: 404 });

  store.set("dev_user", user.username, { httpOnly: true, sameSite: "lax", path: "/" });
  return Response.json({ ok: true, user: { username: user.username, role: user.role } });
}

export async function GET() {
  if (clerkEnabled) return new Response("Not found", { status: 404 });
  const users = await prisma.user.findMany({
    select: { username: true, name: true, role: true },
    orderBy: { username: "asc" },
    take: 50,
  });
  return Response.json({ users });
}
