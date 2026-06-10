'use client'

import { useState, useEffect } from 'react'
import type { Order } from '@/lib/types'

const FULFILLMENT_STEPS = ['pending', 'printing', 'printed', 'packed', 'shipped', 'delivered'] as const

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState<string | null>(null)
  const [trackingInputs, setTrackingInputs] = useState<Record<string, string>>({})

  async function load() {
    const res = await fetch('/api/orders')
    setOrders(await res.json())
  }

  useEffect(() => { load().finally(() => setLoading(false)) }, [])

  async function updateStatus(id: string, fulfillment_status: string, tracking_number?: string) {
    setUpdating(id)
    await fetch(`/api/orders/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fulfillment_status, ...(tracking_number ? { tracking_number } : {}) }),
    })
    await load()
    setUpdating(null)
  }

  const STATUS_COLORS: Record<string, string> = {
    pending: 'bg-gray-100 text-gray-700',
    printing: 'bg-blue-100 text-blue-700',
    printed: 'bg-indigo-100 text-indigo-700',
    packed: 'bg-purple-100 text-purple-700',
    shipped: 'bg-amber-100 text-amber-700',
    delivered: 'bg-green-100 text-green-700',
  }

  if (loading) return <div className="p-8 text-gray-400">Loading…</div>

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Orders</h1>

      {orders.length === 0 ? (
        <div className="text-gray-400 text-center py-16">No orders yet</div>
      ) : (
        <div className="space-y-4">
          {orders.map((o) => (
            <div key={o.id} className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <span className="font-mono font-bold text-gray-900">{o.order_number}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full capitalize ${STATUS_COLORS[o.fulfillment_status]}`}>
                      {o.fulfillment_status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500">{o.customer_email} · {o.customer_name}</p>
                  {o.shipping_address && (
                    <p className="text-xs text-gray-400 mt-0.5">
                      {o.shipping_address.line1}, {o.shipping_address.city}, {o.shipping_address.state} {o.shipping_address.postal_code}
                    </p>
                  )}
                </div>
                <div className="text-right">
                  <p className="font-bold text-gray-900">${o.total_usd.toFixed(2)}</p>
                  <p className="text-xs text-gray-400">{new Date(o.created_at).toLocaleDateString()}</p>
                </div>
              </div>

              {/* Status stepper */}
              <div className="flex gap-1 mb-4 overflow-x-auto">
                {FULFILLMENT_STEPS.map(step => {
                  const stepIdx = FULFILLMENT_STEPS.indexOf(step)
                  const curIdx = FULFILLMENT_STEPS.indexOf(o.fulfillment_status as typeof FULFILLMENT_STEPS[number])
                  return (
                    <button
                      key={step}
                      disabled={updating === o.id}
                      onClick={() => updateStatus(o.id, step)}
                      className={`text-xs px-3 py-1.5 rounded-full capitalize transition-colors whitespace-nowrap ${
                        stepIdx === curIdx
                          ? 'bg-orange-500 text-white'
                          : stepIdx < curIdx
                          ? 'bg-green-100 text-green-700'
                          : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                      }`}
                    >
                      {step}
                    </button>
                  )
                })}
              </div>

              {/* Tracking */}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={trackingInputs[o.id] ?? o.tracking_number ?? ''}
                  onChange={e => setTrackingInputs(t => ({ ...t, [o.id]: e.target.value }))}
                  placeholder="Tracking number"
                  className="flex-1 text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-400"
                />
                <button
                  disabled={updating === o.id}
                  onClick={() => updateStatus(o.id, 'shipped', trackingInputs[o.id] ?? '')}
                  className="text-sm px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors disabled:opacity-50"
                >
                  Mark Shipped
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
