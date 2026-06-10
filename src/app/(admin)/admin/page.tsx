import { createAdminClient } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic'

async function getStats() {
  const db = createAdminClient()
  const [requests, products, orders, agentRuns] = await Promise.all([
    db.from('custom_requests').select('id', { count: 'exact', head: true }).eq('pipeline_status', 'submitted'),
    db.from('products').select('id', { count: 'exact', head: true }).eq('status', 'draft'),
    db.from('orders').select('id', { count: 'exact', head: true }).eq('payment_status', 'paid'),
    db.from('agent_runs').select('cost_usd').gte('created_at', new Date(Date.now() - 86400000).toISOString()),
  ])
  const todayCost = (agentRuns.data ?? []).reduce((s, r) => s + (r.cost_usd ?? 0), 0)
  return {
    pendingRequests: requests.count ?? 0,
    draftProducts: products.count ?? 0,
    paidOrders: orders.count ?? 0,
    agentCostToday: todayCost,
  }
}

export default async function AdminDashboard() {
  const stats = await getStats()

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Dashboard</h1>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        {[
          { label: 'Pending requests', value: stats.pendingRequests, href: '/admin/requests' },
          { label: 'Draft products', value: stats.draftProducts, href: '/admin/products' },
          { label: 'Paid orders', value: stats.paidOrders, href: '/admin/orders' },
          { label: "Agent cost (24h)", value: `$${stats.agentCostToday.toFixed(4)}`, href: '/admin/agent-runs' },
        ].map(s => (
          <a key={s.label} href={s.href} className="bg-white rounded-xl border border-gray-200 p-5 hover:border-orange-300 transition-colors">
            <p className="text-sm text-gray-500 mb-1">{s.label}</p>
            <p className="text-2xl font-bold text-gray-900">{s.value}</p>
          </a>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="font-semibold text-gray-700 mb-3">Quick actions</h2>
        <div className="flex flex-wrap gap-3">
          <a href="/admin/requests" className="text-sm px-4 py-2 bg-orange-50 text-orange-700 rounded-lg hover:bg-orange-100 transition-colors">
            Review requests
          </a>
          <a href="/admin/products" className="text-sm px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors">
            Approve products
          </a>
          <a href="/admin/orders" className="text-sm px-4 py-2 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors">
            Manage orders
          </a>
          <a href="/admin/settings" className="text-sm px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
            Add a printer
          </a>
        </div>
      </div>
    </div>
  )
}
