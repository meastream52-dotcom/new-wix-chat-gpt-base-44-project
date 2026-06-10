'use client'

import { useState } from 'react'
import Link from 'next/link'
import type { IntakeVerdict } from '@/lib/types'

const INTENDED_USES = [
  { value: 'indoor-cosmetic', label: 'Indoor / Cosmetic' },
  { value: 'indoor-functional', label: 'Indoor / Functional' },
  { value: 'outdoor', label: 'Outdoor / UV exposure' },
  { value: 'high-heat', label: 'High heat environment (>60°C)' },
  { value: 'flexible', label: 'Needs to flex / bend' },
  { value: 'food-contact', label: 'Food contact' },
]

export default function RequestPage() {
  const [form, setForm] = useState({
    raw_prompt: '',
    customer_email: '',
    intended_use: 'indoor-cosmetic',
    ref_x: '', ref_y: '', ref_z: '',
  })
  const [submitting, setSubmitting] = useState(false)
  const [result, setResult] = useState<{ id: string; verdict: IntakeVerdict } | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    setError(null)
    setResult(null)

    try {
      const refDims = form.ref_x && form.ref_y && form.ref_z
        ? { x: parseFloat(form.ref_x), y: parseFloat(form.ref_y), z: parseFloat(form.ref_z), unit: 'mm' }
        : null

      // Create the request
      const createRes = await fetch('/api/requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          raw_prompt: form.raw_prompt,
          customer_email: form.customer_email,
          intended_use: form.intended_use,
          reference_dimensions: refDims,
        }),
      })
      if (!createRes.ok) throw new Error('Failed to submit request')
      const request = await createRes.json()

      // Run intake immediately
      const intakeRes = await fetch('/api/intake', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ custom_request_id: request.id }),
      })
      if (!intakeRes.ok) throw new Error('Failed to run intake check')
      const intake = await intakeRes.json()

      setResult({ id: request.id, verdict: intake.verdict })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-white">
      <header className="border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/" className="font-bold text-xl">
            Print<span className="text-orange-500">Forge</span>
          </Link>
          <Link href="/catalog" className="text-sm text-gray-600 hover:text-gray-900">Browse Catalog</Link>
        </div>
      </header>

      <main className="max-w-xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold mb-2">Request a Custom Part</h1>
        <p className="text-gray-500 mb-8">Describe what you need. Our AI will check feasibility and get back to you instantly.</p>

        {!result ? (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Describe the part <span className="text-red-500">*</span>
              </label>
              <textarea
                required
                rows={4}
                value={form.raw_prompt}
                onChange={e => setForm(f => ({ ...f, raw_prompt: e.target.value }))}
                placeholder="e.g. Dashboard gauge bezel for a 1970 Chevelle, round gauge cluster, the 5-gauge version with the woodgrain trim surround"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent resize-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Your email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                required
                value={form.customer_email}
                onChange={e => setForm(f => ({ ...f, customer_email: e.target.value }))}
                placeholder="you@example.com"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Intended use</label>
              <select
                value={form.intended_use}
                onChange={e => setForm(f => ({ ...f, intended_use: e.target.value }))}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 bg-white"
              >
                {INTENDED_USES.map(u => (
                  <option key={u.value} value={u.value}>{u.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Reference dimensions (optional, in mm)
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['ref_x', 'ref_y', 'ref_z'] as const).map((dim, i) => (
                  <input
                    key={dim}
                    type="number"
                    min="1"
                    step="0.1"
                    value={form[dim]}
                    onChange={e => setForm(f => ({ ...f, [dim]: e.target.value }))}
                    placeholder={['Width', 'Depth', 'Height'][i]}
                    className="border border-gray-200 rounded-xl px-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent"
                  />
                ))}
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-orange-500 text-white py-3 rounded-xl font-semibold hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? 'Checking feasibility…' : 'Submit Request'}
            </button>
          </form>
        ) : (
          <div className="space-y-4">
            {result.verdict.verdict === 'feasible' && (
              <div className="bg-green-50 border border-green-200 rounded-xl p-5">
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-5 h-5 bg-green-500 text-white rounded-full flex items-center justify-center text-xs">✓</span>
                  <h2 className="font-semibold text-green-800">Your part is feasible!</h2>
                </div>
                <p className="text-green-700 text-sm">{result.verdict.reason}</p>
                {result.verdict.ip_warning && (
                  <p className="mt-2 text-amber-700 text-xs bg-amber-50 rounded-lg p-2">
                    Note: {result.verdict.ip_warning}
                  </p>
                )}
                <p className="mt-3 text-green-600 text-sm">
                  We&apos;ll design your part and send pricing to your email shortly.
                  Reference ID: <span className="font-mono font-bold">{result.id.slice(0, 8)}</span>
                </p>
              </div>
            )}

            {result.verdict.verdict === 'needs_splitting' && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-5">
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-5 h-5 bg-amber-500 text-white rounded-full flex items-center justify-center text-xs">!</span>
                  <h2 className="font-semibold text-amber-800">Part needs to be split</h2>
                </div>
                <p className="text-amber-700 text-sm mb-2">{result.verdict.reason}</p>
                {result.verdict.split_suggestion && (
                  <p className="text-amber-600 text-sm">{result.verdict.split_suggestion}</p>
                )}
                <p className="mt-3 text-amber-600 text-sm">
                  We&apos;ll proceed with a split design. Reference ID: <span className="font-mono font-bold">{result.id.slice(0, 8)}</span>
                </p>
              </div>
            )}

            {result.verdict.verdict === 'rejected' && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-5">
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center text-xs">✗</span>
                  <h2 className="font-semibold text-red-800">We can&apos;t print this part</h2>
                </div>
                <p className="text-red-700 text-sm">{result.verdict.reason}</p>
                {result.verdict.safety_flags.length > 0 && (
                  <ul className="mt-2 text-red-600 text-xs space-y-1">
                    {result.verdict.safety_flags.map((f, i) => <li key={i}>• {f}</li>)}
                  </ul>
                )}
              </div>
            )}

            <button
              onClick={() => setResult(null)}
              className="text-sm text-gray-500 hover:text-gray-700 underline"
            >
              Submit another request
            </button>
          </div>
        )}
      </main>
    </div>
  )
}
