import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession } from '@/lib/blog-auth';

export async function GET() {
  try {
    const adUnits = await db.adUnit.findMany({
      where: { active: true },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json({ adUnits });
  } catch (err) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getSession();
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const { name, placement, code } = await req.json();
    if (!name || !placement || !code) {
      return NextResponse.json({ error: 'All fields required' }, { status: 400 });
    }
    const adUnit = await db.adUnit.create({
      data: { name, placement, code, active: true },
    });
    return NextResponse.json({ adUnit }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
