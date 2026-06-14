import { NextResponse } from 'next/server'
export async function POST() {
  return NextResponse.json({ message: 'Limbo game coming in Prompt 8' }, { status: 501 })
}
