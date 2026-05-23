'use client';

import { useState } from 'react';

interface AdUnit {
  id: string;
  name: string;
  placement: string;
  code: string;
  active: boolean;
  createdAt: Date | string;
}

interface Props {
  adUnits: AdUnit[];
}

const PLACEMENTS = ['leaderboard', 'rectangle', 'sidebar', 'in-article', 'banner', 'header', 'footer'];

export default function AdsAdmin({ adUnits: initial }: Props) {
  const [adUnits, setAdUnits] = useState(initial);
  const [newName, setNewName] = useState('');
  const [newPlacement, setNewPlacement] = useState('leaderboard');
  const [newCode, setNewCode] = useState('');
  const [editId, setEditId] = useState<string | null>(null);
  const [editData, setEditData] = useState<Partial<AdUnit>>({});
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newCode.trim()) return;
    setSaving(true);
    setError('');
    try {
      const res = await fetch('/api/blog/ads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newName, placement: newPlacement, code: newCode }),
      });
      const data = await res.json();
      if (res.ok) {
        setAdUnits(prev => [data.adUnit, ...prev]);
        setNewName('');
        setNewCode('');
        setNewPlacement('leaderboard');
      } else {
        setError(data.error || 'Failed to create');
      }
    } catch {
      setError('Network error');
    } finally {
      setSaving(false);
    }
  };

  const handleUpdate = async (id: string) => {
    const res = await fetch(`/api/blog/ads/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(editData),
    });
    if (res.ok) {
      const data = await res.json();
      setAdUnits(prev => prev.map(a => a.id === id ? { ...a, ...data.adUnit } : a));
      setEditId(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this ad unit?')) return;
    const res = await fetch(`/api/blog/ads/${id}`, { method: 'DELETE' });
    if (res.ok) {
      setAdUnits(prev => prev.filter(a => a.id !== id));
    }
  };

  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded text-sm">{error}</div>
      )}

      {/* Add form */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="font-black text-gray-900 mb-4 border-l-4 border-[#CC0000] pl-3">Add New Ad Unit</h2>
        <form onSubmit={handleAdd} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">Name *</label>
              <input
                type="text"
                value={newName}
                onChange={e => setNewName(e.target.value)}
                placeholder="e.g. Header Leaderboard"
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-[#CC0000] text-gray-900"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">Placement</label>
              <select
                value={newPlacement}
                onChange={e => setNewPlacement(e.target.value)}
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-[#CC0000] text-gray-900"
              >
                {PLACEMENTS.map(p => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">
              Ad Code (HTML / Script) *
            </label>
            <textarea
              value={newCode}
              onChange={e => setNewCode(e.target.value)}
              placeholder="Paste your Google AdSense code or custom HTML here..."
              rows={4}
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm font-mono focus:outline-none focus:border-[#CC0000] text-gray-900 resize-y"
              required
            />
          </div>
          <button
            type="submit"
            disabled={saving}
            className="bg-[#CC0000] hover:bg-red-700 text-white font-bold px-5 py-2 rounded text-sm transition-colors disabled:opacity-50"
          >
            {saving ? 'Adding...' : '+ Add Ad Unit'}
          </button>
        </form>
      </div>

      {/* List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="font-black text-gray-900">Ad Units ({adUnits.length})</h2>
        </div>
        {adUnits.length === 0 ? (
          <div className="text-center py-10 text-gray-400">
            <p>No ad units yet. Add your first one above.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {adUnits.map(ad => (
              <div key={ad.id} className="p-5">
                {editId === ad.id ? (
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <input
                        type="text"
                        value={editData.name ?? ad.name}
                        onChange={e => setEditData(p => ({ ...p, name: e.target.value }))}
                        className="border border-gray-300 rounded px-3 py-2 text-sm text-gray-900"
                      />
                      <select
                        value={editData.placement ?? ad.placement}
                        onChange={e => setEditData(p => ({ ...p, placement: e.target.value }))}
                        className="border border-gray-300 rounded px-3 py-2 text-sm text-gray-900"
                      >
                        {PLACEMENTS.map(p => (
                          <option key={p} value={p}>{p}</option>
                        ))}
                      </select>
                    </div>
                    <textarea
                      value={editData.code ?? ad.code}
                      onChange={e => setEditData(p => ({ ...p, code: e.target.value }))}
                      rows={4}
                      className="w-full border border-gray-300 rounded px-3 py-2 text-sm font-mono text-gray-900"
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleUpdate(ad.id)}
                        className="bg-green-600 text-white text-sm font-bold px-4 py-1.5 rounded hover:bg-green-700"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => setEditId(null)}
                        className="text-sm text-gray-500 hover:underline"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-bold text-gray-900">{ad.name}</span>
                        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded font-mono">{ad.placement}</span>
                        <span className={`text-xs font-bold px-2 py-0.5 rounded ${ad.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                          {ad.active ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                      <pre className="text-xs text-gray-400 font-mono bg-gray-50 p-2 rounded max-w-xl overflow-hidden line-clamp-2">
                        {ad.code}
                      </pre>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button
                        onClick={() => { setEditId(ad.id); setEditData({}); }}
                        className="text-sm text-[#CC0000] hover:underline font-semibold"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(ad.id)}
                        className="text-sm text-gray-400 hover:text-red-600"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
