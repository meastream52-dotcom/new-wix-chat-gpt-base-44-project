'use client'

import { useState, useEffect, useCallback } from 'react'
import { PipelineStatus } from '@/components/PipelineStatus'
import type { CustomRequest } from '@/lib/types'

const STATUS_COLORS: Record<string, string> = {
  submitted: 'bg-gray-100 text-gray-700',
  intake: 'bg-blue-100 text-blue-700',
  design: 'bg-purple-100 text-purple-700',
  pricing: 'bg-amber-100 text-amber-700',
  listing: 'bg-orange-100 text-orange-700',
  approved: 'bg-green-100 text-green-700',
  rejected: 'bg-red-100 text-red-700',
  fulfilled: 'bg-teal-100 text-teal-700',
}

export default function RequestsPage() {
  const [requests, setRequests] = useState<CustomRequest[]>([])
  const [selected, setSelected] = useState<CustomRequest | null>(null)
  const [loading, setLoading] = useState(true)
  const [runningStep, setRunningStep] = useState<string | null>(null)

  const load = useCallback(async () => {
    const res = await fetch('/api/requests')
    setRequests(await res.json())
  }, [])

  useEffect(() => { load().finally(() => setLoading(false)) }, [load])

  async function runStep(step: string) {
    if (!selected) return
    setRunningStep(step)
    const endpoints: Record<string, string> = {
      intake: '/api/intake',
      design: '/api/design',
      pricing: '/api/materials',
      listing: '/api/listing',
    }
    try {
      const res = await fetch(endpoints[step], {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ custom_request_id: selected.id }),
      })
      if (!res.ok) {
        const err = await res.json()
        alert(err.error ?? 'Step failed')
      }
      await load()
      const updated = await fetch('/api/requests').then(r => r.json())
      const fresh = (updated as CustomRequest[]).find(r => r.id === selected.id) ?? null
      setSelected(fresh)
    } finally {
      setRunningStep(null)
    }
  }

  if (loading) return <div className="p-8 text-gray-400">Loading…</div>

  return (
    <div className="flex h-full">
      {/* List */}
      <div className="w-80 border-r border-gray-200 bg-white flex flex-col">
        <div className="p-4 border-b">
          <h1 className="font-semibold text-gray-900">Custom Requests</h1>
          <p className="text-xs text-gray-400 mt-0.5">{requests.length} total</p>
        </div>
        <ul className="flex-1 overflow-y-auto divide-y divide-gray-100">
          {requests.map(r => (
            <li key={r.id}>
              <button
                onClick={() => setSelected(r)}
                className={`w-full text-left p-4 hover:bg-gray-50 transition-colors ${selected?.id === r.id ? 'bg-orange-50' : ''}`}
              >
                <p className="text-sm font-medium text-gray-900 line-clamp-2 leading-snug">{r.raw_prompt}</p>
                <div className="flex items-center gap-2 mt-1.5">
                  <span className={`text-xs px-2 py-0.5 rounded-full capitalize ${STATUS_COLORS[r.pipeline_status] ?? 'bg-gray-100 text-gray-600'}`}>
                    {r.pipeline_status}
                  </span>
                  <span className="text-xs text-gray-400">{r.customer_email}</span>
                </div>
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* Detail */}
      <div className="flex-1 overflow-y-auto p-8">
        {!selected ? (
          <div className="text-gray-400 text-center mt-20">Select a request</div>
        ) : (
          <div className="max-w-2xl space-y-6">
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-1">{selected.raw_prompt}</h2>
              <p className="text-sm text-gray-500">{selected.customer_email} · {new Date(selected.created_at).toLocaleDateString()}</p>
              {selected.intended_use && <p className="text-sm text-gray-500 mt-0.5">Use: {selected.intended_use}</p>}
            </div>

            <div className="bg-white rounded-xl border p-5">
              <h3 className="font-semibold text-gray-700 mb-4">Pipeline</h3>
              <PipelineStatus request={selected} onRunStep={runStep} loading={runningStep} />
            </div>

            {selected.intake_verdict && (
              <div className={`rounded-xl border p-5 ${
                selected.intake_verdict.verdict === 'rejected' ? 'bg-red-50 border-red-200' :
                selected.intake_verdict.verdict === 'needs_splitting' ? 'bg-amber-50 border-amber-200' :
                'bg-green-50 border-green-200'
              }`}>
                <h3 className="font-semibold text-gray-700 mb-2">Intake Verdict</h3>
                <p className="text-sm font-medium capitalize mb-1">{selected.intake_verdict.verdict}</p>
                <p className="text-sm text-gray-600">{selected.intake_verdict.reason}</p>
                {selected.intake_verdict.reference_specs && (
                  <div className="mt-3 text-xs text-gray-500">
                    <p>{selected.intake_verdict.reference_specs.description}</p>
                    <p className="mt-1">Est. dims: {JSON.stringify(selected.intake_verdict.reference_specs.estimated_dimensions_mm)}</p>
                  </div>
                )}
              </div>
            )}

            {selected.openscad_script && (
              <div className="bg-gray-900 rounded-xl p-5">
                <h3 className="font-semibold text-gray-100 mb-3 text-sm">OpenSCAD Script</h3>
                <pre className="text-xs text-green-300 overflow-x-auto whitespace-pre-wrap">{selected.openscad_script}</pre>
              </div>
            )}

            {selected.pricing_data && (
              <div className="bg-white rounded-xl border p-5">
                <h3 className="font-semibold text-gray-700 mb-3">Pricing Tiers</h3>
                <div className="space-y-2">
                  {selected.pricing_data.tiers.map(t => (
                    <div key={t.tier} className={`p-3 rounded-lg text-sm ${t.is_available ? 'bg-gray-50' : 'bg-gray-100 opacity-60'}`}>
                      <div className="flex justify-between font-medium capitalize">
                        <span>{t.tier} — {t.material_name}</span>
                        <span>${t.price_usd.toFixed(2)}</span>
                      </div>
                      <p className="text-gray-500 text-xs mt-0.5">
                        {t.print_time_hours.toFixed(1)}h · {t.filament_grams.toFixed(0)}g · {t.finishing_notes}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {selected.product_id && (
              <div className="bg-white rounded-xl border p-5 flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-gray-700">Listing created</h3>
                  <p className="text-sm text-gray-500 mt-0.5">Draft product ready for review</p>
                </div>
                <a href="/admin/products" className="text-sm bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors">
                  Review listing →
                </a>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
