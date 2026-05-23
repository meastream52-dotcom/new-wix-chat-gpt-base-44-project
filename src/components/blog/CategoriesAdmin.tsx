'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  image?: string | null;
  _count: { posts: number };
}

export default function CategoriesAdmin({ categories: initial }: { categories: Category[] }) {
  const router = useRouter();
  const [categories, setCategories] = useState(initial);
  const [newName, setNewName] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newImage, setNewImage] = useState('');
  const [error, setError] = useState('');
  const [adding, setAdding] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [editImage, setEditImage] = useState('');

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    setAdding(true);
    setError('');
    try {
      const res = await fetch('/api/blog/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newName, description: newDesc, image: newImage || null }),
      });
      const data = await res.json();
      if (res.ok) {
        setCategories((prev) => [...prev, { ...data.category, _count: { posts: 0 } }]);
        setNewName('');
        setNewDesc('');
        setNewImage('');
        router.refresh();
      } else {
        setError(data.error || 'Failed to add');
      }
    } catch {
      setError('Network error');
    } finally {
      setAdding(false);
    }
  };

  const handleUpdate = async (id: string) => {
    const res = await fetch(`/api/blog/categories/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: editName, description: editDesc, image: editImage || null }),
    });
    if (res.ok) {
      const data = await res.json();
      setCategories((prev) => prev.map((c) => (c.id === id ? { ...c, ...data.category } : c)));
      setEditId(null);
      router.refresh();
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete category "${name}"?`)) return;
    const res = await fetch(`/api/blog/categories/${id}`, { method: 'DELETE' });
    if (res.ok) setCategories((prev) => prev.filter((c) => c.id !== id));
  };

  const startEdit = (cat: Category) => {
    setEditId(cat.id);
    setEditName(cat.name);
    setEditDesc(cat.description || '');
    setEditImage(cat.image || '');
  };

  return (
    <div className="space-y-6">
      {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded text-sm">{error}</div>}

      {/* Add new */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="font-black text-gray-900 mb-4 border-l-4 border-red-600 pl-3">Add New Category</h2>
        <form onSubmit={handleAdd} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">Name *</label>
            <input type="text" value={newName} onChange={(e) => setNewName(e.target.value)}
              placeholder="e.g. Marvel, K-Pop, NBA..." required
              className="w-full border border-gray-300 rounded px-3 py-2.5 text-sm focus:outline-none focus:border-red-600" />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">Description</label>
            <input type="text" value={newDesc} onChange={(e) => setNewDesc(e.target.value)}
              placeholder="Optional short description"
              className="w-full border border-gray-300 rounded px-3 py-2.5 text-sm focus:outline-none focus:border-red-600" />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">Image URL (optional)</label>
            <input type="url" value={newImage} onChange={(e) => setNewImage(e.target.value)}
              placeholder="https://..."
              className="w-full border border-gray-300 rounded px-3 py-2.5 text-sm focus:outline-none focus:border-red-600" />
          </div>
          <div className="flex items-end">
            <button type="submit" disabled={adding}
              className="bg-red-600 hover:bg-red-700 text-white font-bold px-6 py-2.5 rounded text-sm transition-colors disabled:opacity-50 w-full md:w-auto">
              {adding ? 'Adding...' : '+ Add Category'}
            </button>
          </div>
        </form>
      </div>

      {/* List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="font-black text-gray-900">All Categories ({categories.length})</h2>
          <p className="text-xs text-gray-400 mt-0.5">Add unlimited categories. Slug is auto-generated from name.</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-6 py-3 text-xs font-bold text-gray-500 uppercase">Name</th>
                <th className="text-left px-4 py-3 text-xs font-bold text-gray-500 uppercase">Slug</th>
                <th className="text-left px-4 py-3 text-xs font-bold text-gray-500 uppercase">Description</th>
                <th className="text-left px-4 py-3 text-xs font-bold text-gray-500 uppercase">Posts</th>
                <th className="text-left px-4 py-3 text-xs font-bold text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {categories.map((cat) => (
                <tr key={cat.id} className="hover:bg-gray-50">
                  <td className="px-6 py-3">
                    {editId === cat.id
                      ? <input type="text" value={editName} onChange={(e) => setEditName(e.target.value)}
                          className="border border-gray-300 rounded px-2 py-1 text-sm w-40 focus:outline-none focus:border-red-600" />
                      : <span className="font-semibold text-gray-900">{cat.name}</span>
                    }
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-xs font-mono">{cat.slug}</td>
                  <td className="px-4 py-3 text-gray-500 text-xs">
                    {editId === cat.id
                      ? <input type="text" value={editDesc} onChange={(e) => setEditDesc(e.target.value)}
                          className="border border-gray-300 rounded px-2 py-1 text-sm w-48 focus:outline-none" />
                      : cat.description || <span className="text-gray-300">—</span>
                    }
                  </td>
                  <td className="px-4 py-3 font-semibold text-gray-700">{cat._count.posts}</td>
                  <td className="px-4 py-3">
                    {editId === cat.id
                      ? <div className="flex gap-2">
                          <button onClick={() => handleUpdate(cat.id)} className="text-xs bg-green-600 text-white px-2 py-1 rounded hover:bg-green-700">Save</button>
                          <button onClick={() => setEditId(null)} className="text-xs text-gray-500 hover:underline">Cancel</button>
                        </div>
                      : <div className="flex gap-3">
                          <button onClick={() => startEdit(cat)} className="text-xs text-red-600 hover:underline font-semibold">Edit</button>
                          <a href={`/category/${cat.slug}`} target="_blank" className="text-xs text-blue-500 hover:underline">View</a>
                          <button onClick={() => handleDelete(cat.id, cat.name)} className="text-xs text-gray-400 hover:text-red-600">Delete</button>
                        </div>
                    }
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
