import { redirect } from 'next/navigation';
import { getSession } from '@/lib/blog-auth';
import { db } from '@/lib/db';
import AdsAdmin from '@/components/blog/AdsAdmin';

export default async function AdminAdsPage() {
  const user = await getSession();
  if (!user || user.role !== 'ADMIN') redirect('/signin');

  const adUnits = await db.adUnit.findMany({
    orderBy: { createdAt: 'desc' },
  });

  return (
    <div className="min-h-screen bg-[#f7f7f7]">
      <div className="bg-black text-white py-4 px-4">
        <div className="max-w-5xl mx-auto flex items-center gap-4">
          <a href="/admin" className="text-gray-400 hover:text-white text-sm">← Admin</a>
          <span className="text-gray-600">/</span>
          <h1 className="text-lg font-black">Manage Ad Units</h1>
        </div>
      </div>
      <div className="max-w-5xl mx-auto px-4 py-8">
        <AdsAdmin adUnits={adUnits} />
      </div>
    </div>
  );
}
