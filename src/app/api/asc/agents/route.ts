import { NextResponse } from "next/server";
import { AGENT_CATALOG } from "@/lib/asc-types";

export async function GET() {
  return NextResponse.json({ data: AGENT_CATALOG });
}
