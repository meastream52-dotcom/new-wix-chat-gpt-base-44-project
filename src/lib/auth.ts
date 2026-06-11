import { cookies } from "next/headers";
import type { User } from "@prisma/client";
import { prisma } from "@/lib/prisma";

/**
 * Clerk is the production auth provider. When Clerk keys are absent the app
 * runs in dev-auth mode: a `dev_user` cookie selects one of the seeded demo
 * users so the whole pipeline can be exercised without external services.
 */
export const clerkEnabled =
  !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY && !!process.env.CLERK_SECRET_KEY;

export async function getCurrentUser(): Promise<User | null> {
  if (clerkEnabled) {
    const { auth, currentUser } = await import("@clerk/nextjs/server");
    const { userId: clerkId } = await auth();
    if (!clerkId) return null;

    const existing = await prisma.user.findUnique({ where: { clerkId } });
    if (existing) return existing;

    // First sign-in: provision a local user from the Clerk profile
    const cu = await currentUser();
    const email = cu?.emailAddresses[0]?.emailAddress ?? `${clerkId}@placeholder.local`;
    const base = (cu?.username ?? email.split("@")[0] ?? "user")
      .toLowerCase()
      .replace(/[^a-z0-9_-]+/g, "")
      .slice(0, 24) || "user";

    for (let attempt = 0; attempt < 5; attempt++) {
      const username = attempt === 0 ? base : `${base}-${Math.random().toString(36).slice(2, 6)}`;
      try {
        return await prisma.user.create({
          data: {
            clerkId,
            email,
            username,
            name: cu ? [cu.firstName, cu.lastName].filter(Boolean).join(" ") || null : null,
            avatar: cu?.imageUrl ?? null,
          },
        });
      } catch {
        // unique collision on username/email — retry with suffix
      }
    }
    return null;
  }

  const store = await cookies();
  const username = store.get("dev_user")?.value;
  if (!username) return null;
  return prisma.user.findUnique({ where: { username } });
}

export async function requireUser(): Promise<User> {
  const user = await getCurrentUser();
  if (!user) throw new AuthError("Unauthorized");
  return user;
}

export async function requireAdmin(): Promise<User> {
  const user = await requireUser();
  if (user.role !== "ADMIN") throw new AuthError("Forbidden", 403);
  return user;
}

export class AuthError extends Error {
  constructor(message: string, public status: number = 401) {
    super(message);
  }
}

export function authErrorResponse(err: unknown): Response | null {
  if (err instanceof AuthError) return new Response(err.message, { status: err.status });
  return null;
}
