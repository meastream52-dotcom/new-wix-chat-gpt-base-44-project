import Link from 'next/link'
import { createAdminClient } from '@/lib/supabase/admin'
import { ProductCard } from '@/components/ProductCard'
import type { Product } from '@/lib/types'

export const dynamic = 'force-dynamic'

async function getProducts(): Promise<Product[]> {
  try {
    const db = createAdminClient()
    const { data } = await db
      .from('products')
      .select('*, tiers:product_tiers(*, material:materials(*), printer_profile:printer_profiles(*))')
      .eq('status', 'published')
      .order('approved_at', { ascending: false })
    return (data ?? []) as Product[]
  } catch {
    return []
  }
}

export default async function CatalogPage() {
  const products = await getProducts()

  return (
    <div className="min-h-screen bg-white">
      <header className="border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/" className="font-bold text-xl">
            Print<span className="text-orange-500">Forge</span>
          </Link>
          <nav className="flex items-center gap-6 text-sm">
            <Link href="/catalog" className="text-gray-900 font-medium">Catalog</Link>
            <Link href="/request" className="bg-orange-500 text-white px-4 py-1.5 rounded-lg hover:bg-orange-600 transition-colors font-medium">
              Request a Part
            </Link>
          </nav>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-10">
        <h1 className="text-3xl font-bold mb-2">Catalog</h1>
        <p className="text-gray-500 mb-8">Ready-to-order 3D printed parts</p>

        {products.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <p className="text-lg mb-2">No products yet</p>
            <p className="text-sm mb-6">Be the first — request a custom part and we&apos;ll add it to the catalog.</p>
            <Link href="/request" className="bg-orange-500 text-white px-5 py-2 rounded-lg font-medium hover:bg-orange-600 transition-colors">
              Request a Part
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {products.map(p => <ProductCard key={p.id} product={p} />)}
          </div>
        )}
      </main>
    </div>
  )
}
