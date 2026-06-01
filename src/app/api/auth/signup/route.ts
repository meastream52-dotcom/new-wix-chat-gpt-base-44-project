import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);

  if (!body) {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const { name, email, password } = body as {
    name?: string;
    email?: string;
    password?: string;
  };

  if (!email || !password) {
    return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
  }

  if (password.length < 8) {
    return NextResponse.json({ error: "Password must be at least 8 characters" }, { status: 400 });
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    // Return the same status whether or not the account uses OAuth —
    // never reveal how a user authenticated.
    return NextResponse.json({ error: "An account with this email already exists" }, { status: 409 });
  }

  const hashed = await bcrypt.hash(password, 12);

  await prisma.user.create({
    data: {
      name: name?.trim() || null,
      email: email.trim().toLowerCase(),
      password: hashed,
    },
  });

  return NextResponse.json({ success: true }, { status: 201 });
}
