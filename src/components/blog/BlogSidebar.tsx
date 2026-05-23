import Link from 'next/link';
import AdBanner from './AdBanner';
import SubscribeBox from './SubscribeBox';
import { formatViews } from '@/lib/blog-utils';

interface TrendingPost {
  id: string;
  title: string;
  slug: string;
  views: number;
  category: { name: string; slug: string };
}

export default function BlogSidebar({ trending }: { trending: TrendingPost[] }) {
  return (
    <aside className="space-y-6">
      <div className="bg-white rounded shadow-sm overflow-hidden">
        <div className="bg-black px-4 py-3">
          <h2 className="text-white font-black uppercase tracking-wider text-sm flex items-center gap-2">
            <span className="text-red-600">▶</span> Trending Now
          </h2>
        </div>
        <div className="divide-y divide-gray-100">
          {trending.map((post, i) => (
            <div key={post.id} className="flex items-start gap-3 p-3 hover:bg-gray-50 transition-colors">
              <span className="text-2xl font-black text-gray-200 leading-none w-7 text-center flex-shrink-0">{i + 1}</span>
              <div className="min-w-0">
                <Link href={`/category/${post.category.slug}`} className="text-xs font-bold uppercase text-red-600 hover:underline">
                  {post.category.name}
                </Link>
                <Link href={`/article/${post.slug}`}
                  className="block text-sm font-bold text-gray-900 leading-snug hover:text-red-600 transition-colors mt-0.5 line-clamp-2">
                  {post.title}
                </Link>
                <p className="text-xs text-gray-400 mt-1">{formatViews(post.views)} views</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <AdBanner placement="sidebar" />
      <SubscribeBox />

      <div className="bg-[#1a1a1a] rounded p-5 text-white">
        <h3 className="font-black text-base mb-1">Daily Newsletter</h3>
        <p className="text-gray-400 text-sm mb-4">Top entertainment news every morning.</p>
        <div className="space-y-2">
          <input type="email" placeholder="Your email address"
            className="w-full bg-gray-800 border border-gray-700 text-white placeholder-gray-500 px-3 py-2 rounded text-sm focus:outline-none focus:border-red-500" />
          <button className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-2 rounded text-sm transition-colors">
            Subscribe Free
          </button>
        </div>
      </div>
    </aside>
  );
}
