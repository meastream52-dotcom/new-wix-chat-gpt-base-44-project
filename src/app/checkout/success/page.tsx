import Link from 'next/link'

export default function CheckoutSuccessPage() {
  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-8 h-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-3">Order placed!</h1>
        <p className="text-gray-500 mb-8">
          Your order is confirmed. We&apos;ll start printing and send you a shipping notification when it&apos;s on the way.
        </p>
        <div className="flex gap-3 justify-center">
          <Link href="/" className="border border-gray-200 text-gray-700 px-5 py-2 rounded-xl font-medium hover:bg-gray-50 transition-colors">
            Back to home
          </Link>
          <Link href="/catalog" className="bg-orange-500 text-white px-5 py-2 rounded-xl font-medium hover:bg-orange-600 transition-colors">
            Browse more parts
          </Link>
        </div>
      </div>
    </div>
  )
}
