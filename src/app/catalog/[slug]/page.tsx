'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { TierSelector } from '@/components/TierSelector'
import type { Product, ProductTier } from '@/lib/types'

export default function ProductPage({ params }: { params: { slug: string } }) {
  const [product, setProduct] = useState<Product | null>(null)
  const [selectedTier, setSelectedTier] = useState<ProductTier | null>(null)
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(true)
  const [checkoutLoading, setCheckoutLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch(`/api/products?status=published`)
      .then(r => r.json())
      .then((products: Product[]) => {
        const p = products.find(p => p.slug === params.slug) ?? null
        setProduct(p)
        if (p?.tiers?.length) {
          const standard = p.tiers.find(t => t.tier === 'standard' && t.is_available)
          setSelectedTier(standard ?? p.tiers.find(t => t.is_available) ?? null)
        }
      })
      .finally(() => setLoading(false))
  }, [params.slug])

  async function handleBuy() {
    if (!selectedTier || !email) return
    setCheckoutLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ product_tier_id: selectedTier.id, customer_email: email }),
      })
      const data = await res.json()
      if (data.url) window.location.href = data.url
      else setError(data.error ?? 'Checkout failed')
    } catch {
      setError('Something went wrong')
    } finally {
      setCheckoutLoading(false)
    }
  }

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-gray-400">Loading…</div>
  }

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <p className="text-gray-500">Product not found</p>
        <Link href="/catalog" className="text-orange-500 hover:underline">Back to catalog</Link>
      </div>
    )
  }

  const tiers = product.tiers ?? []

  return (
    <div className="min-h-screen bg-white">
      <header className="border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/" className="font-bold text-xl">
            Print<span className="text-orange-500">Forge</span>
          </Link>
          <Link href="/catalog" className="text-sm text-gray-600 hover:text-gray-900">← Catalog</Link>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* Image */}
          <div>
            <div className="aspect-square bg-gray-100 rounded-2xl overflow-hidden">
              {product.render_paths?.length > 0 ? (
                <img
                  src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/renders/${product.render_paths[0]}`}
                  alt={product.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-300">
                  <svg className="w-24 h-24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                </div>
              )}
            </div>
          </div>

          {/* Details */}
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-3">{product.title}</h1>
            <p className="text-gray-600 leading-relaxed mb-6 whitespace-pre-line">{product.description}</p>

            {tiers.length > 0 && (
              <div className="mb-6">
                <h2 className="text-sm font-semibold text-gray-700 mb-3">Select a tier</h2>
                <TierSelector tiers={tiers} onSelect={setSelectedTier} />
              </div>
            )}

            {selectedTier && (
              <div className="space-y-3">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="Your email address"
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                />
                {error && <p className="text-red-600 text-sm">{error}</p>}
                <button
                  onClick={handleBuy}
                  disabled={!email || checkoutLoading}
                  className="w-full bg-orange-500 text-white py-3 rounded-xl font-semibold hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {checkoutLoading ? 'Redirecting…' : `Buy Now — $${selectedTier.price_usd.toFixed(2)}`}
                </button>
              </div>
            )}

            {product.spec_sheet && (
              <div className="mt-8 border-t pt-6">
                <h2 className="text-sm font-semibold text-gray-700 mb-3">Specs</h2>
                <dl className="space-y-2 text-sm">
                  {Object.entries(product.spec_sheet).map(([k, v]) => (
                    <div key={k} className="flex gap-4">
                      <dt className="text-gray-500 capitalize min-w-32">{k.replace(/_/g, ' ')}</dt>
                      <dd className="text-gray-900">{String(v)}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
