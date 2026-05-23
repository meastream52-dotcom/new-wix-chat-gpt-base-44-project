import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession } from '@/lib/blog-auth';
import { toSlug } from '@/lib/blog-utils';

export async function GET() {
  try {
    const categories = await db.category.findMany({
      orderBy: { name: 'asc' },
      include: {
        _count: { select: { posts: { where: { published: true } } } },
      },
    });
    return NextResponse.json({ categories });
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getSession();
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { name, description, image } = await req.json();
    if (!name) return NextResponse.json({ error: 'Name required' }, { status: 400 });

    const slug = toSlug(name);
    const existing = await db.category.findUnique({ where: { slug } });
    if (existing) return NextResponse.json({ error: 'Category already exists' }, { status: 409 });

    const category = await db.category.create({
      data: { name, slug, description: description || null, image: image || null },
    });
    return NextResponse.json({ category }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
