import { redirect } from 'next/navigation';
import { getSession } from '@/lib/blog-auth';
import { db } from '@/lib/db';
import Link from 'next/link';
import { formatDate } from '@/lib/blog-utils';

export default async function AccountPage() {
  const user = await getSession();
  if (!user) redirect('/signin');

  const subscription = await db.subscription.findFirst({
    where: { userId: user.id },
  });

  const recentPosts = await db.post.findMany({
    where: { published: true },
    include: {
      category: true,
      author: { select: { id: true, name: true } },
    },
    orderBy: { createdAt: 'desc' },
    take: 5,
  });

  return (
    <div className="min-h-screen bg-[#f7f7f7]">
      {/* Header */}
      <div className="bg-black text-white py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-[#CC0000] flex items-center justify-center text-2xl font-black text-white">
              {user.name?.[0] ?? 'U'}
            </div>
            <div>
              <h1 className="text-2xl font-black">{user.name}</h1>
              <p className="text-gray-400">{user.email}</p>
              <span className={`text-xs px-2 py-0.5 rounded font-bold mt-1 inline-block ${
                user.role === 'ADMIN' ? 'bg-yellow-500 text-black' :
                subscription ? 'bg-red-600 text-white' :
                'bg-gray-700 text-gray-300'
              }`}>
                {user.role === 'ADMIN' ? 'ADMIN' : subscription ? 'SUBSCRIBER' : 'FREE MEMBER'}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        {/* Profile card */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-black text-gray-900 mb-4 border-l-4 border-[#CC0000] pl-3">
            Profile Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <label className="font-semibold text-gray-500 uppercase text-xs tracking-wide">Name</label>
              <p className="text-gray-900 mt-0.5">{user.name}</p>
            </div>
            <div>
              <label className="font-semibold text-gray-500 uppercase text-xs tracking-wide">Email</label>
              <p className="text-gray-900 mt-0.5">{user.email}</p>
            </div>
            <div>
              <label className="font-semibold text-gray-500 uppercase text-xs tracking-wide">Member Since</label>
              <p className="text-gray-900 mt-0.5">{formatDate(user.createdAt)}</p>
            </div>
            <div>
              <label className="font-semibold text-gray-500 uppercase text-xs tracking-wide">Role</label>
              <p className="text-gray-900 mt-0.5 capitalize">{user.role.toLowerCase()}</p>
            </div>
          </div>
        </div>

        {/* Subscription card */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-black text-gray-900 mb-4 border-l-4 border-[#CC0000] pl-3">
            Subscription
          </h2>
          {subscription ? (
            <div className="flex items-center justify-between">
              <div>
                <p className="font-bold text-gray-900">Subscriber Plan</p>
                <p className={`text-sm mt-1 ${subscription.status === 'active' ? 'text-green-600' : 'text-gray-500'}`}>
                  Status: {subscription.status}
                </p>
              </div>
              <Link
                href="/subscribe"
                className="bg-[#CC0000] text-white text-sm font-bold px-4 py-2 rounded hover:bg-red-700 transition-colors"
              >
                Manage
              </Link>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <div>
                <p className="font-bold text-gray-900">Free Plan</p>
                <p className="text-sm text-gray-500 mt-1">Upgrade to access premium content</p>
              </div>
              <Link
                href="/subscribe"
                className="bg-[#CC0000] text-white text-sm font-bold px-4 py-2 rounded hover:bg-red-700 transition-colors"
              >
                Upgrade
              </Link>
            </div>
          )}
        </div>

        {/* Recent reading */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-black text-gray-900 mb-4 border-l-4 border-[#CC0000] pl-3">
            Latest Articles
          </h2>
          <div className="space-y-3">
            {recentPosts.map(post => (
              <Link
                key={post.id}
                href={`/article/${post.slug}`}
                className="flex items-center justify-between p-3 rounded hover:bg-gray-50 transition-colors group"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-gray-900 group-hover:text-[#CC0000] transition-colors truncate">
                    {post.title}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {post.category.name} · {formatDate(post.createdAt)}
                  </p>
                </div>
                <svg className="w-4 h-4 text-gray-400 group-hover:text-[#CC0000] flex-shrink-0 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            ))}
          </div>
        </div>

        {/* Admin link */}
        {user.role === 'ADMIN' && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-center justify-between">
            <div>
              <p className="font-bold text-yellow-800">Admin Access</p>
              <p className="text-sm text-yellow-700">You have administrative privileges.</p>
            </div>
            <Link
              href="/admin"
              className="bg-yellow-500 text-black font-bold text-sm px-4 py-2 rounded hover:bg-yellow-400 transition-colors"
            >
              Go to Admin →
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
