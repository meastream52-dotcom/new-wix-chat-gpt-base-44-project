import { NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "@/lib/db";

const TOKEN_TTL_MS = 60 * 60 * 1000; // 1 hour

export async function POST(req: Request) {
  const { email } = await req.json().catch(() => ({ email: undefined })) as { email?: string };

  // Always respond with success to prevent email enumeration attacks.
  // The caller can't tell whether the email exists.
  if (!email) {
    return NextResponse.json({ success: true });
  }

  const user = await prisma.user.findUnique({ where: { email } });

  if (user) {
    // Invalidate any existing reset tokens for this email.
    await prisma.passwordResetToken.deleteMany({ where: { email } });

    const token = crypto.randomBytes(32).toString("hex");
    await prisma.passwordResetToken.create({
      data: {
        email,
        token,
        expiresAt: new Date(Date.now() + TOKEN_TTL_MS),
      },
    });

    // In production: send an email with this link.
    // In development: the URL is logged so you can test without an email provider.
    const resetUrl = `${process.env.NEXTAUTH_URL}/reset-password?token=${token}`;
    console.log("\n[Password Reset] URL for", email, "→", resetUrl, "\n");
  }

  return NextResponse.json({ success: true });
}
