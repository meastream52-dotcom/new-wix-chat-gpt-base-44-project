import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { encrypt, decrypt, mask } from '@/lib/keystore';

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const k = await prisma.configKey.findUnique({ where: { id: params.id } });
    if (!k) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    const value = decrypt(k.value);
    return NextResponse.json({ value });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { value, category, note } = await req.json();
    const existing = await prisma.configKey.findUnique({ where: { id: params.id } });
    if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    const updated = await prisma.configKey.update({
      where: { id: params.id },
      data: {
        ...(value !== undefined && { value: encrypt(value) }),
        ...(category !== undefined && { category }),
        ...(note !== undefined && { note }),
      },
    });
    const plain = decrypt(updated.value);
    return NextResponse.json({
      key: { id: updated.id, name: updated.name, category: updated.category, note: updated.note, masked: mask(plain), createdAt: updated.createdAt },
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await prisma.configKey.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
