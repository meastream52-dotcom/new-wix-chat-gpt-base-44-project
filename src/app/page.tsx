import { db } from '@/lib/db';
import HeroSection from '@/components/blog/HeroSection';
import ArticleCard from '@/components/blog/ArticleCard';
import AdBanner from '@/components/blog/AdBanner';
import BlogSidebar from '@/components/blog/BlogSidebar';
import Link from 'next/link';

async function getFeatured() {
  return db.post.findFirst({
    where: { published: true, featured: true },
    include: { category: true, author: { select: { id: true, name: true, image: true } } },
    orderBy: { createdAt: 'desc' },
  });
}

async function getLatest(take = 12) {
  return db.post.findMany({
    where: { published: true },
    include: { category: true, author: { select: { id: true, name: true, image: true } } },
    orderBy: { createdAt: 'desc' },
    take,
  });
}

async function getTrending() {
  return db.post.findMany({
    where: { published: true },
    include: { category: true, author: { select: { id: true, name: true, image: true } } },
    orderBy: { views: 'desc' },
    take: 8,
  });
}

async function getCategorySections() {
  const cats = await db.category.findMany({
    orderBy: { name: 'asc' },
    take: 6,
    include: {
      posts: {
        where: { published: true },
        take: 3,
        orderBy: { createdAt: 'desc' },
        include: { category: true, author: { select: { id: true, name: true, image: true } } },
      },
    },
  });
  return cats.filter((c) => c.posts.length > 0);
}

export const revalidate = 60;

export default async function HomePage() {
  const [featured, latest, trending, categorySections] = await Promise.all([
    getFeatured(),
    getLatest(12),
    getTrending(),
    getCategorySections(),
  ]);

  const gridPosts = latest.filter((p) => p.id !== featured?.id).slice(0, 9);

  return (
    <div className="min-h-screen bg-[#f4f4f4]">
      {featured && <HeroSection post={featured} />}

      <div className="max-w-[1300px] mx-auto px-4 pt-4">
        <AdBanner placement="leaderboard" />
      </div>

      <div className="max-w-[1300px] mx-auto px-4 py-6 flex gap-8">
        <main className="flex-1 min-w-0 space-y-10">
          {gridPosts.length > 0 && (
            <section>
              <SectionHeader title="Latest Stories" href="/category/movies" />
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {gridPosts.slice(0, 3).map((p) => <ArticleCard key={p.id} post={p} size="large" />)}
              </div>
            </section>
          )}

          <AdBanner placement="leaderboard" />

          {gridPosts.length > 3 && (
            <section>
              <SectionHeader title="More Stories" />
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {gridPosts.slice(3, 9).map((p) => <ArticleCard key={p.id} post={p} />)}
              </div>
            </section>
          )}

          {categorySections.map((cat) => (
            <section key={cat.id}>
              <SectionHeader title={cat.name} href={`/category/${cat.slug}`} moreLabel={`More ${cat.name}`} />
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {cat.posts[0] && <ArticleCard post={cat.posts[0]} size="large" />}
                <div className="md:col-span-2 bg-white rounded shadow-sm divide-y divide-gray-100">
                  {cat.posts.slice(1).map((p) => <ArticleCard key={p.id} post={p} size="small" />)}
                </div>
              </div>
            </section>
          ))}

          <AdBanner placement="leaderboard" />
        </main>

        <aside className="w-72 flex-shrink-0 hidden lg:block">
          <div className="sticky top-4">
            <BlogSidebar trending={trending} />
          </div>
        </aside>
      </div>

      {/* Subscribe banner */}
      <div className="bg-black py-14 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl font-black text-white mb-2 uppercase tracking-tight">Never Miss a Story</h2>
          <p className="text-gray-400 mb-6 text-sm">Daily movie, TV, gaming, and celebrity news delivered to your inbox.</p>
          <div className="flex gap-3 max-w-md mx-auto">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 bg-gray-800 border border-gray-700 text-white placeholder-gray-500 px-4 py-3 rounded text-sm focus:outline-none focus:border-red-600"
            />
            <button className="bg-red-600 hover:bg-red-700 text-white font-bold px-5 py-3 rounded text-sm transition-colors">
              Subscribe
            </button>
          </div>
          <p className="text-gray-600 text-xs mt-3">Free. No spam. Unsubscribe anytime.</p>
        </div>
      </div>
    </div>
  );
}

function SectionHeader({ title, href, moreLabel }: { title: string; href?: string; moreLabel?: string }) {
  return (
    <div className="flex items-center justify-between mb-4">
      <h2 className="text-lg font-black text-gray-900 uppercase tracking-wide border-l-4 border-red-600 pl-3">{title}</h2>
      {href && (
        <Link href={href} className="text-sm text-red-600 font-semibold hover:underline">
          {moreLabel ?? 'See All'} →
        </Link>
      )}
    </div>
  );
}
