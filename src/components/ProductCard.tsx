'use client'

import Link from 'next/link'
import type { Product } from '@/lib/types'

interface Props {
  product: Product
}

export function ProductCard({ product }: Props) {
  const availableTiers = product.tiers?.filter(t => t.is_available) ?? []
  const lowestPrice = availableTiers.length
    ? Math.min(...availableTiers.map(t => t.price_usd))
    : null

  return (
    <Link
      href={`/catalog/${product.slug}`}
      className="group block bg-white rounded-xl border border-gray-200 hover:border-orange-400 hover:shadow-md transition-all"
    >
      <div className="aspect-square bg-gray-100 rounded-t-xl overflow-hidden">
        {product.render_paths?.length > 0 ? (
          <img
            src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/renders/${product.render_paths[0]}`}
            alt={product.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            <svg className="w-16 h-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          </div>
        )}
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-gray-900 group-hover:text-orange-600 line-clamp-2 leading-snug">
          {product.title}
        </h3>
        {lowestPrice !== null && (
          <p className="mt-2 text-sm text-gray-500">
            From <span className="font-semibold text-gray-900">${lowestPrice.toFixed(2)}</span>
          </p>
        )}
        {availableTiers.length > 0 && (
          <div className="mt-2 flex gap-1 flex-wrap">
            {availableTiers.map(t => (
              <span
                key={t.tier}
                className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 capitalize"
              >
                {t.material?.display_name ?? t.tier}
              </span>
            ))}
          </div>
        )}
      </div>
    </Link>
  )
}
