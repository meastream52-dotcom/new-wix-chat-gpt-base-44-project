import { redirect } from 'next/navigation';
import { getSession } from '@/lib/blog-auth';
import { db } from '@/lib/db';
import Link from 'next/link';
import { formatDate, formatViews } from '@/lib/blog-utils';

export default async function AdminPage() {
  const user = await getSession();
  if (!user || user.role !== 'ADMIN') redirect('/signin');

  const [posts, totalPosts, totalUsers, totalCategories, publishedCount, draftCount, viewsAgg] = await Promise.all([
    db.post.findMany({
      include: { category: true, author: { select: { id: true, name: true } } },
      orderBy: { createdAt: 'desc' },
      take: 30,
    }),
    db.post.count(),
    db.user.count(),
    db.category.count(),
    db.post.count({ where: { published: true } }),
    db.post.count({ where: { published: false } }),
    db.post.aggregate({ _sum: { views: true } }),
  ]);

  return (
    <div className="min-h-screen bg-[#f4f4f4]">
      <div className="bg-black text-white py-5 px-4">
        <div className="max-w-[1300px] mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black">Admin Dashboard</h1>
            <p className="text-gray-400 text-sm">Welcome back, {user.name}</p>
          </div>
          <Link href="/admin/posts/new" className="bg-red-600 hover:bg-red-700 text-white font-bold px-4 py-2 rounded text-sm">
            + New Post
          </Link>
        </div>
      </div>

      <div className="bg-[#1a1a1a] border-b border-gray-700">
        <div className="max-w-[1300px] mx-auto px-4 flex gap-1">
          {[
            { label: 'Dashboard', href: '/admin' },
            { label: 'Categories', href: '/admin/categories' },
            { label: 'Ad Units', href: '/admin/ads' },
            { label: '← View Site', href: '/' },
          ].map((item) => (
            <Link key={item.label} href={item.href}
              className="text-gray-300 hover:text-white text-sm font-semibold px-4 py-3 hover:bg-red-600 transition-colors whitespace-nowrap">
              {item.label}
            </Link>
          ))}
        </div>
      </div>

      <div className="max-w-[1300px] mx-auto px-4 py-6">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-8">
          {[
            { label: 'Total Posts', value: totalPosts, color: '#CC0000' },
            { label: 'Published', value: publishedCount, color: '#16a34a' },
            { label: 'Drafts', value: draftCount, color: '#d97706' },
            { label: 'Total Views', value: formatViews(viewsAgg._sum.views || 0), color: '#2563eb' },
            { label: 'Members', value: totalUsers, color: '#7c3aed' },
            { label: 'Categories', value: totalCategories, color: '#0891b2' },
          ].map((stat) => (
            <div key={stat.label} className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{stat.label}</p>
              <p className="text-3xl font-black mt-1" style={{ color: stat.color }}>{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Posts table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="font-black text-gray-900 text-lg">All Posts</h2>
            <Link href="/admin/posts/new" className="text-sm text-red-600 font-semibold hover:underline">+ New Post</Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-6 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Title</th>
                  <th className="text-left px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Category</th>
                  <th className="text-left px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="text-left px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Views</th>
                  <th className="text-left px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="text-left px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {posts.map((post) => (
                  <tr key={post.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-3">
                      <div className="flex items-center gap-2">
                        {post.featured && <span className="text-xs bg-yellow-100 text-yellow-700 px-1.5 py-0.5 rounded font-bold">★</span>}
                        {post.premium && <span className="text-xs bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded font-bold">PRO</span>}
                        <span className="font-medium text-gray-900 line-clamp-1 max-w-xs">{post.title}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs font-bold px-2 py-1 rounded-sm text-white bg-red-600">{post.category.name}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-bold px-2 py-1 rounded-full ${post.published ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                        {post.published ? 'Published' : 'Draft'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{formatViews(post.views)}</td>
                    <td className="px-4 py-3 text-gray-500">{formatDate(post.createdAt)}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {post.published && (
                          <Link href={`/article/${post.slug}`} className="text-xs text-blue-600 hover:underline">View</Link>
                        )}
                        <Link href={`/admin/posts/${post.id}/edit`} className="text-xs text-red-600 hover:underline font-semibold">Edit</Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
