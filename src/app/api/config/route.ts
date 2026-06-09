import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { encrypt, decrypt, mask } from '@/lib/keystore';

export async function GET() {
  try {
    const keys = await prisma.configKey.findMany({ orderBy: { createdAt: 'asc' } });
    return NextResponse.json({
      keys: keys.map(k => {
        let masked = '••••••••';
        try { masked = mask(decrypt(k.value)); } catch {}
        return { id: k.id, name: k.name, category: k.category, note: k.note, masked, createdAt: k.createdAt };
      }),
    });
  } catch (e) {
    return NextResponse.json({ error: 'Database unavailable' }, { status: 503 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { name, value, category = 'Other', note } = await req.json();
    if (!name || !value) return NextResponse.json({ error: 'name and value required' }, { status: 400 });
    const encrypted = encrypt(value);
    const key = await prisma.configKey.upsert({
      where: { name },
      create: { name, value: encrypted, category, note },
      update: { value: encrypted, category, note },
    });
    return NextResponse.json({
      key: { id: key.id, name: key.name, category: key.category, note: key.note, masked: mask(value), createdAt: key.createdAt },
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
