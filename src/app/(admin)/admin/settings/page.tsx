'use client'

import { useState, useEffect } from 'react'
import type { PrinterProfile } from '@/lib/types'

const MATERIAL_OPTIONS = ['PLA', 'PETG', 'ABS', 'ASA', 'TPU', 'PA-CF', 'Resin']

const EMPTY_FORM = {
  name: '',
  build_volume_x_mm: '',
  build_volume_y_mm: '',
  build_volume_z_mm: '',
  nozzle_diameter_mm: '0.4',
  supported_materials: [] as string[],
  hourly_rate_usd: '',
  notes: '',
}

export default function PrinterSettingsPage() {
  const [printers, setPrinters] = useState<PrinterProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [editing, setEditing] = useState<string | null>(null)

  async function load() {
    const res = await fetch('/api/printer-profiles')
    setPrinters(await res.json())
  }

  useEffect(() => { load().finally(() => setLoading(false)) }, [])

  function toggleMaterial(mat: string) {
    setForm(f => ({
      ...f,
      supported_materials: f.supported_materials.includes(mat)
        ? f.supported_materials.filter(m => m !== mat)
        : [...f.supported_materials, mat],
    }))
  }

  async function save() {
    setSaving(true)
    const payload = {
      ...form,
      build_volume_x_mm: parseInt(form.build_volume_x_mm),
      build_volume_y_mm: parseInt(form.build_volume_y_mm),
      build_volume_z_mm: parseInt(form.build_volume_z_mm),
      nozzle_diameter_mm: parseFloat(form.nozzle_diameter_mm),
      hourly_rate_usd: parseFloat(form.hourly_rate_usd),
    }

    if (editing) {
      await fetch(`/api/printer-profiles/${editing}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
    } else {
      await fetch('/api/printer-profiles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
    }
    setForm(EMPTY_FORM)
    setEditing(null)
    await load()
    setSaving(false)
  }

  function startEdit(p: PrinterProfile) {
    setEditing(p.id)
    setForm({
      name: p.name,
      build_volume_x_mm: String(p.build_volume_x_mm),
      build_volume_y_mm: String(p.build_volume_y_mm),
      build_volume_z_mm: String(p.build_volume_z_mm),
      nozzle_diameter_mm: String(p.nozzle_diameter_mm),
      supported_materials: p.supported_materials,
      hourly_rate_usd: String(p.hourly_rate_usd),
      notes: p.notes ?? '',
    })
  }

  async function remove(id: string) {
    if (!confirm('Delete this printer?')) return
    await fetch(`/api/printer-profiles/${id}`, { method: 'DELETE' })
    await load()
  }

  return (
    <div className="p-8 max-w-3xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Printer Profiles</h1>

      {/* Existing printers */}
      {!loading && printers.length > 0 && (
        <div className="space-y-3 mb-8">
          {printers.map(p => (
            <div key={p.id} className="bg-white rounded-xl border border-gray-200 p-4 flex items-center justify-between">
              <div>
                <p className="font-semibold text-gray-900">{p.name}</p>
                <p className="text-sm text-gray-500">
                  {p.build_volume_x_mm}×{p.build_volume_y_mm}×{p.build_volume_z_mm}mm ·
                  {p.nozzle_diameter_mm}mm nozzle ·
                  ${p.hourly_rate_usd}/hr
                </p>
                <p className="text-xs text-gray-400 mt-0.5">{p.supported_materials.join(', ')}</p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => startEdit(p)} className="text-sm text-gray-600 hover:text-gray-900 px-3 py-1.5 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                  Edit
                </button>
                <button onClick={() => remove(p.id)} className="text-sm text-red-500 hover:text-red-700 px-3 py-1.5 border border-red-200 rounded-lg hover:bg-red-50 transition-colors">
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit form */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="font-semibold text-gray-900 mb-5">{editing ? 'Edit Printer' : 'Add Printer'}</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Printer name</label>
            <input
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              placeholder="e.g. Bambu X1C #1"
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Build volume (mm)</label>
            <div className="grid grid-cols-3 gap-2">
              {(['build_volume_x_mm', 'build_volume_y_mm', 'build_volume_z_mm'] as const).map((dim, i) => (
                <input
                  key={dim}
                  type="number"
                  min="1"
                  value={form[dim]}
                  onChange={e => setForm(f => ({ ...f, [dim]: e.target.value }))}
                  placeholder={['X', 'Y', 'Z'][i]}
                  className="border border-gray-200 rounded-xl px-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                />
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nozzle diameter (mm)</label>
              <input
                type="number"
                step="0.05"
                value={form.nozzle_diameter_mm}
                onChange={e => setForm(f => ({ ...f, nozzle_diameter_mm: e.target.value }))}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Machine cost ($/hr)</label>
              <input
                type="number"
                step="0.01"
                value={form.hourly_rate_usd}
                onChange={e => setForm(f => ({ ...f, hourly_rate_usd: e.target.value }))}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Supported materials</label>
            <div className="flex flex-wrap gap-2">
              {MATERIAL_OPTIONS.map(mat => (
                <button
                  key={mat}
                  type="button"
                  onClick={() => toggleMaterial(mat)}
                  className={`text-sm px-3 py-1.5 rounded-full border transition-colors ${
                    form.supported_materials.includes(mat)
                      ? 'bg-orange-500 text-white border-orange-500'
                      : 'border-gray-200 text-gray-600 hover:border-gray-300'
                  }`}
                >
                  {mat}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes (optional)</label>
            <input
              value={form.notes}
              onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
              placeholder="Enclosure, special profiles, etc."
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
            />
          </div>
          <div className="flex gap-3 pt-2">
            <button
              onClick={save}
              disabled={saving || !form.name || !form.build_volume_x_mm}
              className="bg-orange-500 text-white px-5 py-2.5 rounded-xl font-medium hover:bg-orange-600 transition-colors disabled:opacity-50"
            >
              {saving ? 'Saving…' : editing ? 'Update' : 'Add Printer'}
            </button>
            {editing && (
              <button
                onClick={() => { setEditing(null); setForm(EMPTY_FORM) }}
                className="border border-gray-200 text-gray-600 px-5 py-2.5 rounded-xl font-medium hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
