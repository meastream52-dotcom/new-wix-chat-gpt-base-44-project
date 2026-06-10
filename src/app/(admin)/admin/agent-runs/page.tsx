'use client'

import { useState, useEffect } from 'react'
import type { AgentRun } from '@/lib/types'

const AGENT_COLORS: Record<string, string> = {
  intake: 'bg-blue-100 text-blue-700',
  design: 'bg-purple-100 text-purple-700',
  material_pricing: 'bg-amber-100 text-amber-700',
  listing: 'bg-orange-100 text-orange-700',
}

const STATUS_COLORS: Record<string, string> = {
  complete: 'text-green-600',
  failed: 'text-red-600',
  running: 'text-blue-600',
  pending: 'text-gray-400',
}

export default function AgentRunsPage() {
  const [runs, setRuns] = useState<AgentRun[]>([])
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/agent-runs?limit=100')
      .then(r => r.json())
      .then(setRuns)
      .finally(() => setLoading(false))
  }, [])

  const totalCost = runs.reduce((s, r) => s + (r.cost_usd ?? 0), 0)
  const totalTokens = runs.reduce((s, r) => s + (r.input_tokens ?? 0) + (r.output_tokens ?? 0), 0)

  if (loading) return <div className="p-8 text-gray-400">Loading…</div>

  return (
    <div className="p-8">
      <div className="flex items-start justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Agent Runs</h1>
        <div className="text-right text-sm text-gray-500">
          <p>Total cost: <span className="font-semibold text-gray-900">${totalCost.toFixed(4)}</span></p>
          <p>Total tokens: <span className="font-semibold text-gray-900">{totalTokens.toLocaleString()}</span></p>
        </div>
      </div>

      <div className="space-y-2">
        {runs.map(r => (
          <div key={r.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <button
              onClick={() => setExpanded(expanded === r.id ? null : r.id)}
              className="w-full flex items-center gap-3 p-4 text-left hover:bg-gray-50 transition-colors"
            >
              <span className={`text-xs px-2 py-0.5 rounded-full capitalize flex-shrink-0 ${AGENT_COLORS[r.agent] ?? 'bg-gray-100 text-gray-700'}`}>
                {r.agent.replace('_', ' ')}
              </span>
              <span className="flex-1 text-sm text-gray-600 truncate font-mono text-xs">
                {r.custom_request_id?.slice(0, 8) ?? r.product_id?.slice(0, 8) ?? '—'}
              </span>
              <span className={`text-xs flex-shrink-0 ${STATUS_COLORS[r.status]}`}>{r.status}</span>
              <span className="text-xs text-gray-400 flex-shrink-0">
                {r.cost_usd ? `$${r.cost_usd.toFixed(5)}` : '—'}
              </span>
              <span className="text-xs text-gray-400 flex-shrink-0">
                {(r.input_tokens ?? 0) + (r.output_tokens ?? 0)} tok
              </span>
              <span className="text-xs text-gray-400 flex-shrink-0">
                {new Date(r.created_at).toLocaleString()}
              </span>
              <svg className={`w-4 h-4 text-gray-400 flex-shrink-0 transition-transform ${expanded === r.id ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {expanded === r.id && (
              <div className="border-t border-gray-100 p-4 space-y-3 bg-gray-50">
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <p className="text-gray-500 mb-1">Model</p>
                    <p className="font-mono text-gray-900">{r.model}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 mb-1">Tokens (in/out)</p>
                    <p className="font-mono text-gray-900">{r.input_tokens ?? 0} / {r.output_tokens ?? 0}</p>
                  </div>
                </div>
                {r.error && (
                  <div className="bg-red-50 rounded-lg p-3 text-xs text-red-700">{r.error}</div>
                )}
                {r.output && (
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Output</p>
                    <pre className="bg-gray-900 text-green-300 text-xs p-3 rounded-lg overflow-x-auto whitespace-pre-wrap max-h-48">
                      {JSON.stringify(r.output, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
