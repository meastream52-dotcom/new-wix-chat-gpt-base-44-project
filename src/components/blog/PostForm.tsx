'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toSlug } from '@/lib/blog-utils';

interface Category { id: string; name: string; slug: string }

interface PostFormProps {
  categories: Category[];
  post?: {
    id: string;
    title: string;
    slug: string;
    excerpt: string;
    content: string;
    featuredImage: string;
    categoryId: string;
    published: boolean;
    featured: boolean;
    premium: boolean;
    tags: { name: string }[];
  };
}

export default function PostForm({ categories, post }: PostFormProps) {
  const router = useRouter();
  const isEdit = !!post;

  const [title, setTitle] = useState(post?.title || '');
  const [slug, setSlug] = useState(post?.slug || '');
  const [excerpt, setExcerpt] = useState(post?.excerpt || '');
  const [content, setContent] = useState(post?.content || '');
  const [featuredImage, setFeaturedImage] = useState(post?.featuredImage || '');
  const [categoryId, setCategoryId] = useState(post?.categoryId || categories[0]?.id || '');
  const [published, setPublished] = useState(post?.published ?? false);
  const [featured, setFeatured] = useState(post?.featured ?? false);
  const [premium, setPremium] = useState(post?.premium ?? false);
  const [tagsInput, setTagsInput] = useState(post?.tags?.map((t) => t.name).join(', ') || '');
  const [slugLocked, setSlugLocked] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (!slugLocked && title) setSlug(toSlug(title));
  }, [title, slugLocked]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSaving(true);

    const tagNames = tagsInput.split(',').map((t) => t.trim()).filter(Boolean);
    const payload = { title, slug, excerpt, content, featuredImage, categoryId, published, featured, premium, tagNames };

    try {
      const url = isEdit ? `/api/blog/posts/${post!.id}` : '/api/blog/posts';
      const method = isEdit ? 'PUT' : 'POST';
      const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Failed to save post');
      } else {
        setSuccess(isEdit ? 'Post updated!' : 'Post created!');
        if (!isEdit) router.push('/admin');
      }
    } catch {
      setError('Network error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!post || !confirm('Delete this post? This cannot be undone.')) return;
    const res = await fetch(`/api/blog/posts/${post.id}`, { method: 'DELETE' });
    if (res.ok) router.push('/admin');
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded text-sm">{error}</div>}
      {success && <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded text-sm">{success}</div>}

      <div className="bg-white rounded-lg shadow-sm p-6 space-y-4">
        <h2 className="font-black text-gray-900 text-lg border-l-4 border-red-600 pl-3">Post Content</h2>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Title *</label>
          <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} required
            className="w-full border border-gray-300 rounded px-3 py-2.5 text-sm focus:outline-none focus:border-red-600"
            placeholder="Enter article title..." />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            Slug *
            <button type="button" onClick={() => setSlugLocked(!slugLocked)}
              className="ml-2 text-xs text-red-600 hover:underline font-normal">
              {slugLocked ? '(unlock to edit)' : '(auto-generating)'}
            </button>
          </label>
          <input type="text" value={slug} onChange={(e) => setSlug(e.target.value)} required disabled={!slugLocked && !!title}
            className="w-full border border-gray-300 rounded px-3 py-2.5 text-sm focus:outline-none focus:border-red-600 font-mono disabled:bg-gray-50" />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Excerpt (summary)</label>
          <textarea value={excerpt} onChange={(e) => setExcerpt(e.target.value)} rows={2}
            className="w-full border border-gray-300 rounded px-3 py-2.5 text-sm focus:outline-none focus:border-red-600 resize-none"
            placeholder="Brief summary shown in article cards..." />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Content (HTML) *</label>
          <div className="border border-gray-300 rounded overflow-hidden">
            <div className="bg-gray-50 border-b border-gray-200 px-3 py-2 flex gap-2 flex-wrap">
              {[
                { label: 'H2', html: '\n<h2>Heading</h2>\n' },
                { label: 'P', html: '\n<p>Paragraph text here.</p>\n' },
                { label: 'Bold', html: '<strong>bold text</strong>' },
                { label: 'Link', html: '<a href="URL">link text</a>' },
                { label: 'Image', html: '\n<img src="URL" alt="description" class="w-full rounded-lg" />\n' },
                { label: 'Quote', html: '\n<blockquote>Quote text here.</blockquote>\n' },
              ].map((btn) => (
                <button key={btn.label} type="button"
                  onClick={() => setContent((prev) => prev + btn.html)}
                  className="text-xs bg-white border border-gray-300 px-2 py-1 rounded hover:bg-gray-100 font-mono">
                  {btn.label}
                </button>
              ))}
            </div>
            <textarea value={content} onChange={(e) => setContent(e.target.value)} required rows={20}
              className="w-full px-3 py-2.5 text-sm focus:outline-none font-mono resize-y"
              placeholder="<p>Write your article content here using HTML...</p>" />
          </div>
          <p className="text-xs text-gray-400 mt-1">Write content as HTML. Use the buttons above to insert elements.</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-6 space-y-4">
        <h2 className="font-black text-gray-900 text-lg border-l-4 border-red-600 pl-3">Post Settings</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Category *</label>
            <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} required
              className="w-full border border-gray-300 rounded px-3 py-2.5 text-sm focus:outline-none focus:border-red-600">
              {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Featured Image URL</label>
            <input type="url" value={featuredImage} onChange={(e) => setFeaturedImage(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2.5 text-sm focus:outline-none focus:border-red-600"
              placeholder="https://..." />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Tags (comma-separated)</label>
            <input type="text" value={tagsInput} onChange={(e) => setTagsInput(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2.5 text-sm focus:outline-none focus:border-red-600"
              placeholder="AI, Technology, Review" />
          </div>
        </div>

        {featuredImage && (
          <div>
            <p className="text-xs text-gray-500 mb-1">Image preview:</p>
            <img src={featuredImage} alt="Preview" className="w-full max-h-48 object-cover rounded border" onError={(e) => (e.currentTarget.style.display = 'none')} />
          </div>
        )}

        <div className="flex flex-wrap gap-6">
          {[
            { label: 'Publish', checked: published, onChange: setPublished, desc: 'Make visible to readers' },
            { label: '⭐ Featured', checked: featured, onChange: setFeatured, desc: 'Show in hero section' },
            { label: '🔒 Premium', checked: premium, onChange: setPremium, desc: 'Subscribers only' },
          ].map((toggle) => (
            <label key={toggle.label} className="flex items-start gap-3 cursor-pointer">
              <input type="checkbox" checked={toggle.checked} onChange={(e) => toggle.onChange(e.target.checked)}
                className="mt-0.5 w-4 h-4 accent-red-600" />
              <div>
                <span className="text-sm font-semibold text-gray-900">{toggle.label}</span>
                <p className="text-xs text-gray-500">{toggle.desc}</p>
              </div>
            </label>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex gap-3">
          <button type="submit" disabled={saving}
            className="bg-red-600 hover:bg-red-700 text-white font-bold px-6 py-2.5 rounded text-sm transition-colors disabled:opacity-50">
            {saving ? 'Saving...' : isEdit ? 'Update Post' : 'Create Post'}
          </button>
          <a href="/admin" className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold px-6 py-2.5 rounded text-sm transition-colors">
            Cancel
          </a>
        </div>
        {isEdit && (
          <button type="button" onClick={handleDelete}
            className="text-sm text-red-600 hover:underline font-semibold">
            Delete Post
          </button>
        )}
      </div>
    </form>
  );
}
