import Link from 'next/link';

export default function SubscribeBox() {
  return (
    <div className="bg-gradient-to-br from-[#CC0000] to-red-800 rounded p-5 text-white">
      <div className="text-center">
        <div className="text-3xl mb-2">🎬</div>
        <h3 className="font-black text-lg mb-1">Go Premium</h3>
        <p className="text-red-100 text-sm mb-4">
          Unlock exclusive content, early access, and an ad-free experience.
        </p>
        <div className="space-y-2">
          <Link
            href="/subscribe"
            className="block w-full bg-white text-[#CC0000] font-black text-sm py-2.5 rounded hover:bg-gray-100 transition-colors text-center"
          >
            Subscribe — $5/month
          </Link>
          <Link
            href="/subscribe"
            className="block w-full bg-transparent border border-red-300 text-white font-semibold text-sm py-2 rounded hover:bg-red-700 transition-colors text-center"
          >
            Annual Plan — $40/year
          </Link>
        </div>
        <p className="text-red-200 text-xs mt-3">Cancel anytime</p>
      </div>
    </div>
  );
}
