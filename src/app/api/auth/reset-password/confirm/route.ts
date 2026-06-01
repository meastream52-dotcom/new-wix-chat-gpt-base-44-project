import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";

export async function POST(req: Request) {
  const { token, password } = await req.json().catch(() => ({
    token: undefined,
    password: undefined,
  })) as { token?: string; password?: string };

  if (!token || !password) {
    return NextResponse.json({ error: "Token and password are required" }, { status: 400 });
  }

  if (password.length < 8) {
    return NextResponse.json({ error: "Password must be at least 8 characters" }, { status: 400 });
  }

  const record = await prisma.passwordResetToken.findUnique({ where: { token } });

  if (!record || record.expiresAt < new Date()) {
    return NextResponse.json(
      { error: "This reset link is invalid or has expired" },
      { status: 400 },
    );
  }

  const hashed = await bcrypt.hash(password, 12);

  // Update the user's password; also works to SET a password for OAuth-only users.
  await prisma.user.update({
    where: { email: record.email },
    data: { password: hashed },
  });

  // Invalidate the token immediately — single use.
  await prisma.passwordResetToken.delete({ where: { token } });

  return NextResponse.json({ success: true });
}
