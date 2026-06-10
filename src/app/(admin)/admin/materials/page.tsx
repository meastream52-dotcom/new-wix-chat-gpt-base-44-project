'use client'

import { useState, useEffect } from 'react'
import type { Material } from '@/lib/types'

export default function MaterialsPage() {
  const [materials, setMaterials] = useState<Material[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState<string | null>(null)
  const [costInputs, setCostInputs] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState<string | null>(null)

  async function load() {
    const res = await fetch('/api/materials-config')
    const data = await res.json()
    setMaterials(data)
    const costs: Record<string, string> = {}
    data.forEach((m: Material) => { costs[m.id] = String(m.cost_per_kg_usd) })
    setCostInputs(costs)
  }

  useEffect(() => { load().finally(() => setLoading(false)) }, [])

  async function saveCost(id: string) {
    setSaving(id)
    await fetch(`/api/materials-config/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cost_per_kg_usd: parseFloat(costInputs[id]) }),
    })
    await load()
    setEditing(null)
    setSaving(null)
  }

  if (loading) return <div className="p-8 text-gray-400">Loading…</div>

  return (
    <div className="p-8 max-w-3xl">
      <div className="flex items-start justify-between mb-2">
        <h1 className="text-2xl font-bold text-gray-900">Materials</h1>
      </div>
      <p className="text-gray-500 text-sm mb-6">Update filament costs to keep pricing accurate. Properties and restrictions are managed via SQL migration.</p>

      <div className="space-y-3">
        {materials.map(m => (
          <div key={m.id} className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {m.color_hex && (
                  <div className="w-4 h-4 rounded-full flex-shrink-0" style={{ backgroundColor: m.color_hex }} />
                )}
                <div>
                  <p className="font-semibold text-gray-900">{m.display_name}</p>
                  <div className="flex gap-2 mt-0.5 flex-wrap">
                    {m.properties.uv_resistant && <span className="text-xs bg-green-50 text-green-700 px-1.5 py-0.5 rounded">UV-resistant</span>}
                    {m.properties.is_flexible && <span className="text-xs bg-purple-50 text-purple-700 px-1.5 py-0.5 rounded">Flexible</span>}
                    {m.restrictions.requires_enclosure && <span className="text-xs bg-amber-50 text-amber-700 px-1.5 py-0.5 rounded">Enclosure req'd</span>}
                    {m.restrictions.no_outdoor && <span className="text-xs bg-red-50 text-red-700 px-1.5 py-0.5 rounded">No outdoor</span>}
                    <span className="text-xs text-gray-400">Heat: {m.properties.heat_deflection_c}°C</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {editing === m.id ? (
                  <>
                    <span className="text-sm text-gray-500">$</span>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={costInputs[m.id] ?? ''}
                      onChange={e => setCostInputs(c => ({ ...c, [m.id]: e.target.value }))}
                      className="w-20 border border-gray-200 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                    />
                    <span className="text-sm text-gray-500">/kg</span>
                    <button
                      onClick={() => saveCost(m.id)}
                      disabled={saving === m.id}
                      className="text-sm px-3 py-1.5 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-50"
                    >
                      {saving === m.id ? '…' : 'Save'}
                    </button>
                    <button
                      onClick={() => setEditing(null)}
                      className="text-sm text-gray-500 hover:text-gray-700"
                    >
                      Cancel
                    </button>
                  </>
                ) : (
                  <>
                    <span className="font-semibold text-gray-900">${m.cost_per_kg_usd}/kg</span>
                    <button
                      onClick={() => setEditing(m.id)}
                      className="text-sm text-gray-500 hover:text-gray-700 px-3 py-1.5 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Edit
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
