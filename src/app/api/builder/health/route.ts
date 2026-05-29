import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  const checks: Record<string, string> = {
    app: "ok",
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version ?? "1.0.0",
    node: process.version,
  };

  // DB ping
  try {
    await prisma.$queryRaw`SELECT 1`;
    checks.database = "ok";
  } catch {
    checks.database = "error";
  }

  // Anthropic API key present
  checks.anthropic = process.env.ANTHROPIC_API_KEY ? "configured" : "missing";
  checks.auth      = process.env.NEXTAUTH_SECRET    ? "configured" : "missing";
  checks.stripe    = process.env.STRIPE_SECRET_KEY  ? "configured" : "missing";

  const allOk = checks.database === "ok" && checks.anthropic === "configured" && checks.auth === "configured";
  const status = allOk ? 200 : 503;

  return NextResponse.json({ status: allOk ? "healthy" : "degraded", checks }, { status });
}
