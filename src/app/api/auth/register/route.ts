import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import bcrypt from "bcryptjs";

export async function POST(req: NextRequest) {
  try {
    const { name, email, password } = await req.json();
    if (!email || !password) {
      return NextResponse.json({ error: "Email and password required" }, { status: 400 });
    }
    if (password.length < 6) {
      return NextResponse.json({ error: "Password must be at least 6 characters" }, { status: 400 });
    }

    const existing = await prisma.osUser.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: "An account with this email already exists" }, { status: 409 });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const business = await prisma.osBusiness.create({
      data: { name: `${name ?? email.split("@")[0]}'s Business` },
    });

    const agentTypes = ["RECEPTIONIST", "SALES_FOLLOWUP", "SUPPORT", "DOCUMENT", "TRAINING"] as const;
    for (const agentType of agentTypes) {
      await prisma.businessAgent.create({ data: { businessId: business.id, agentType, enabled: true } });
    }

    await prisma.osSubscription.create({
      data: { businessId: business.id, tier: "STARTER", status: "ACTIVE" },
    });

    const user = await prisma.osUser.create({
      data: { email, name: name ?? null, passwordHash, role: "OWNER", businessId: business.id },
    });

    return NextResponse.json({ userId: user.id, businessId: business.id }, { status: 201 });
  } catch (err) {
    console.error("[api/auth/register]", err);
    return NextResponse.json({ error: "Registration failed" }, { status: 500 });
  }
}
