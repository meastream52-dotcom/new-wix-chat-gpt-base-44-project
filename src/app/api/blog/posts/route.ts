import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession } from '@/lib/blog-auth';
import { toSlug } from '@/lib/blog-utils';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category');
    const publishedParam = searchParams.get('published');
    const featured = searchParams.get('featured');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');

    const where: any = {};
    if (category) where.category = { slug: category };
    if (publishedParam === 'false') where.published = false;
    else if (publishedParam === 'all') { /* no filter */ }
    else where.published = true;
    if (featured === 'true') where.featured = true;

    const [posts, total] = await Promise.all([
      db.post.findMany({
        where,
        include: {
          category: true,
          author: { select: { id: true, name: true, image: true } },
          tags: true,
        },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
      }),
      db.post.count({ where }),
    ]);

    return NextResponse.json({ posts, total });
  } catch (err) {
    console.error('GET posts error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getSession();
    if (!user || (user.role !== 'ADMIN' && user.role !== 'EDITOR')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { title, excerpt, content, featuredImage, categoryId, published, featured, premium, tagNames } = body;

    if (!title || !content || !categoryId) {
      return NextResponse.json({ error: 'Title, content, and category are required' }, { status: 400 });
    }

    let slug = toSlug(title);
    const existing = await db.post.findUnique({ where: { slug } });
    if (existing) slug = `${slug}-${Date.now()}`;

    const tags: { id: string }[] = [];
    if (tagNames?.length) {
      for (const name of tagNames as string[]) {
        const tag = await db.tag.upsert({ where: { name }, update: {}, create: { name } });
        tags.push({ id: tag.id });
      }
    }

    const post = await db.post.create({
      data: {
        title,
        slug,
        excerpt: excerpt || '',
        content,
        featuredImage: featuredImage || null,
        categoryId,
        authorId: user.id,
        published: published ?? false,
        featured: featured ?? false,
        premium: premium ?? false,
        tags: tags.length ? { connect: tags } : undefined,
      },
      include: {
        category: true,
        author: { select: { id: true, name: true, image: true } },
        tags: true,
      },
    });

    return NextResponse.json({ post }, { status: 201 });
  } catch (err) {
    console.error('POST post error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
