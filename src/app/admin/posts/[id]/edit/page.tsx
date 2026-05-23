import { redirect } from 'next/navigation';
import { getSession } from '@/lib/blog-auth';
import { db } from '@/lib/db';
import PostForm from '@/components/blog/PostForm';
import { notFound } from 'next/navigation';

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EditPostPage({ params }: Props) {
  const user = await getSession();
  if (!user || user.role !== 'ADMIN') redirect('/signin');

  const { id } = await params;
  const [post, categories] = await Promise.all([
    db.post.findUnique({ where: { id }, include: { tags: true } }),
    db.category.findMany({ orderBy: { name: 'asc' } }),
  ]);

  if (!post) notFound();

  return (
    <div className="min-h-screen bg-[#f7f7f7]">
      <div className="bg-black text-white py-4 px-4">
        <div className="max-w-5xl mx-auto flex items-center gap-4">
          <a href="/admin" className="text-gray-400 hover:text-white text-sm">← Admin</a>
          <span className="text-gray-600">/</span>
          <h1 className="text-lg font-black">Edit Post</h1>
        </div>
      </div>
      <div className="max-w-5xl mx-auto px-4 py-8">
        <PostForm
          categories={categories}
          post={{
            id: post.id,
            title: post.title,
            slug: post.slug,
            excerpt: post.excerpt || '',
            content: post.content,
            featuredImage: post.featuredImage || '',
            categoryId: post.categoryId,
            published: post.published,
            featured: post.featured,
            premium: post.premium,
            tags: post.tags,
          }}
        />
      </div>
    </div>
  );
}
