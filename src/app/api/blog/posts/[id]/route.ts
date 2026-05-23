import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession } from '@/lib/blog-auth';
import { toSlug } from '@/lib/blog-utils';

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const post = await db.post.findUnique({
      where: { id },
      include: {
        category: true,
        author: { select: { id: true, name: true, image: true } },
        tags: true,
      },
    });
    if (!post) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json({ post });
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getSession();
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();
    const { title, excerpt, content, featuredImage, categoryId, published, featured, premium, tagNames } = body;

    const existing = await db.post.findUnique({ where: { id } });
    if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    let slug = existing.slug;
    if (title && title !== existing.title) {
      slug = toSlug(title);
      const conflict = await db.post.findFirst({ where: { slug, NOT: { id } } });
      if (conflict) slug = `${slug}-${Date.now()}`;
    }

    const tags: { id: string }[] = [];
    if (tagNames?.length) {
      for (const name of tagNames as string[]) {
        const tag = await db.tag.upsert({ where: { name }, update: {}, create: { name } });
        tags.push({ id: tag.id });
      }
    }

    const post = await db.post.update({
      where: { id },
      data: {
        title: title ?? existing.title,
        slug,
        excerpt: excerpt ?? existing.excerpt,
        content: content ?? existing.content,
        featuredImage: featuredImage ?? existing.featuredImage,
        categoryId: categoryId ?? existing.categoryId,
        published: published ?? existing.published,
        featured: featured ?? existing.featured,
        premium: premium ?? existing.premium,
        tags: tagNames !== undefined ? { set: [], connect: tags } : undefined,
      },
      include: {
        category: true,
        author: { select: { id: true, name: true, image: true } },
        tags: true,
      },
    });

    return NextResponse.json({ post });
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getSession();
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const { id } = await params;
    await db.post.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
