// Wallet balance endpoint — implemented in Prompt 3
import { NextResponse } from 'next/server'

export async function GET() {
  // TODO: auth check + supabase query in Prompt 3
  return NextResponse.json({ balance: 0, message: 'Auth coming in Prompt 3' }, { status: 501 })
}
