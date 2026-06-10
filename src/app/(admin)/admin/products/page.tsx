'use client'

import { useState, useEffect } from 'react'
import type { Product } from '@/lib/types'

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [tab, setTab] = useState<'draft' | 'published'>('draft')
  const [loading, setLoading] = useState(true)
  const [approving, setApproving] = useState<string | null>(null)

  async function load(status: string) {
    setLoading(true)
    const res = await fetch(`/api/products?status=${status}`)
    setProducts(await res.json())
    setLoading(false)
  }

  useEffect(() => { load(tab) }, [tab])

  async function approve(id: string) {
    setApproving(id)
    await fetch(`/api/products/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'published' }),
    })
    await load(tab)
    setApproving(null)
  }

  async function reject(id: string) {
    await fetch(`/api/products/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'archived' }),
    })
    await load(tab)
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Products</h1>

      <div className="flex gap-2 mb-6">
        {(['draft', 'published'] as const).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-colors ${
              tab === t ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-gray-400">Loading…</div>
      ) : products.length === 0 ? (
        <div className="text-gray-400 text-center py-16">No {tab} products</div>
      ) : (
        <div className="space-y-4">
          {products.map(p => (
            <div key={p.id} className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <h2 className="font-semibold text-gray-900 text-lg mb-1">{p.title}</h2>
                  <p className="text-sm text-gray-500 line-clamp-3 mb-3">{p.description}</p>
                  {p.tiers && p.tiers.length > 0 && (
                    <div className="flex gap-3 text-sm">
                      {p.tiers.filter(t => t.is_available).map(t => (
                        <span key={t.tier} className="bg-gray-100 px-2 py-0.5 rounded text-xs capitalize">
                          {t.tier}: ${t.price_usd.toFixed(2)}
                        </span>
                      ))}
                    </div>
                  )}
                  {p.marketing_notes && (
                    <details className="mt-3">
                      <summary className="text-xs text-orange-600 cursor-pointer hover:text-orange-700">
                        Marketing notes
                      </summary>
                      <p className="mt-2 text-xs text-gray-500 bg-orange-50 rounded-lg p-3">{p.marketing_notes}</p>
                    </details>
                  )}
                </div>
                {tab === 'draft' && (
                  <div className="flex gap-2 flex-shrink-0">
                    <button
                      onClick={() => reject(p.id)}
                      className="text-sm px-4 py-2 border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Archive
                    </button>
                    <button
                      onClick={() => approve(p.id)}
                      disabled={approving === p.id}
                      className="text-sm px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50"
                    >
                      {approving === p.id ? 'Publishing…' : 'Publish'}
                    </button>
                  </div>
                )}
                {tab === 'published' && (
                  <button
                    onClick={() => reject(p.id)}
                    className="text-sm px-4 py-2 border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50 transition-colors flex-shrink-0"
                  >
                    Archive
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
