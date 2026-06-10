import Link from 'next/link'
import { createAdminClient } from '@/lib/supabase/admin'
import { ProductCard } from '@/components/ProductCard'
import type { Product } from '@/lib/types'

async function getFeaturedProducts(): Promise<Product[]> {
  try {
    const db = createAdminClient()
    const { data } = await db
      .from('products')
      .select('*, tiers:product_tiers(*, material:materials(*), printer_profile:printer_profiles(*))')
      .eq('status', 'published')
      .order('approved_at', { ascending: false })
      .limit(6)
    return (data ?? []) as Product[]
  } catch {
    return []
  }
}

export default async function HomePage() {
  const products = await getFeaturedProducts()

  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <header className="border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/" className="font-bold text-xl">
            Print<span className="text-orange-500">Forge</span>
          </Link>
          <nav className="flex items-center gap-6 text-sm">
            <Link href="/catalog" className="text-gray-600 hover:text-gray-900 transition-colors">Catalog</Link>
            <Link href="/request" className="bg-orange-500 text-white px-4 py-1.5 rounded-lg hover:bg-orange-600 transition-colors font-medium">
              Request a Part
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-4 py-20 text-center">
        <p className="text-orange-500 font-medium mb-3 text-sm uppercase tracking-wide">Custom 3D Printing</p>
        <h1 className="text-5xl font-bold text-gray-900 mb-5 leading-tight">
          That part doesn&apos;t exist.<br />
          <span className="text-orange-500">It does now.</span>
        </h1>
        <p className="text-xl text-gray-500 mb-8 max-w-xl mx-auto">
          Discontinued trim pieces, overpriced dealer parts, one-of-a-kind brackets.
          Describe it, we print it.
        </p>
        <div className="flex gap-3 justify-center">
          <Link
            href="/request"
            className="bg-orange-500 text-white px-6 py-3 rounded-xl font-semibold hover:bg-orange-600 transition-colors"
          >
            Request a Custom Part
          </Link>
          <Link
            href="/catalog"
            className="border border-gray-200 text-gray-700 px-6 py-3 rounded-xl font-semibold hover:border-gray-300 hover:bg-gray-50 transition-colors"
          >
            Browse Catalog
          </Link>
        </div>
      </section>

      {/* How it works */}
      <section className="bg-gray-50 py-16">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-center mb-10">How it works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { step: '1', title: 'Describe your part', body: 'Tell us what you need in plain English. Include the vehicle year/make/model, dimensions if you have them, and how it will be used.' },
              { step: '2', title: 'We design & price it', body: 'Our AI pipeline evaluates feasibility, generates a design, and produces three pricing tiers — Premium, Standard, and Budget.' },
              { step: '3', title: 'We print & ship', body: 'Once you approve a quote, we print your part and ship it directly to you, usually within a few days.' },
            ].map(({ step, title, body }) => (
              <div key={step} className="bg-white rounded-xl p-6 shadow-sm">
                <div className="w-8 h-8 bg-orange-100 text-orange-600 rounded-lg flex items-center justify-center font-bold text-sm mb-4">
                  {step}
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured products */}
      {products.length > 0 && (
        <section className="max-w-6xl mx-auto px-4 py-16">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold">Ready to ship</h2>
            <Link href="/catalog" className="text-sm text-orange-500 hover:text-orange-600 font-medium">
              View all →
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {products.map(p => <ProductCard key={p.id} product={p} />)}
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="bg-gray-900 text-white py-16">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Have a part in mind?</h2>
          <p className="text-gray-400 mb-6">Tell us what you need and we&apos;ll handle the rest — design, material selection, pricing, and delivery.</p>
          <Link
            href="/request"
            className="inline-block bg-orange-500 text-white px-8 py-3 rounded-xl font-semibold hover:bg-orange-600 transition-colors"
          >
            Start your request
          </Link>
        </div>
      </section>

      <footer className="border-t border-gray-100 py-6">
        <div className="max-w-6xl mx-auto px-4 flex items-center justify-between text-sm text-gray-400">
          <span>© {new Date().getFullYear()} PrintForge</span>
          <div className="flex gap-4">
            <Link href="/catalog" className="hover:text-gray-600">Catalog</Link>
            <Link href="/request" className="hover:text-gray-600">Custom Request</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
