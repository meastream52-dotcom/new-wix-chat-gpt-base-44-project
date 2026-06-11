"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { MarkdownView } from "@/components/MarkdownView";

interface Tag {
  id: string;
  name: string;
}

interface EditablePost {
  id: string;
  title: string;
  contentMarkdown: string;
  excerpt: string | null;
  coverImage: string | null;
  status: string;
}

export function EditorForm({ post }: { post?: EditablePost }) {
  const router = useRouter();
  const [title, setTitle] = useState(post?.title ?? "");
  const [content, setContent] = useState(post?.contentMarkdown ?? "");
  const [excerpt, setExcerpt] = useState(post?.excerpt ?? "");
  const [coverImage, setCoverImage] = useState(post?.coverImage ?? "");
  const [tags, setTags] = useState<Tag[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState("");
  const [preview, setPreview] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/tags").then((r) => r.json()).then((d) => setTags(d.tags ?? []));
  }, []);

  async function addTag() {
    if (!newTag.trim()) return;
    const res = await fetch("/api/tags", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newTag.trim() }),
    });
    if (res.ok) {
      const tag = await res.json();
      setTags((t) => (t.some((x) => x.id === tag.id) ? t : [...t, tag]));
      setSelectedTags((s) => (s.includes(tag.id) ? s : [...s, tag.id]));
      setNewTag("");
    }
  }

  async function save(publish: boolean) {
    setBusy(true);
    setError(null);
    const payload = {
      title,
      contentMarkdown: content,
      excerpt: excerpt || undefined,
      coverImage: coverImage || undefined,
      publish,
    };
    const res = post
      ? await fetch(`/api/posts/${post.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        })
      : await fetch("/api/posts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...payload, tagIds: selectedTags }),
        });
    setBusy(false);
    if (res.ok) {
      const data = await res.json();
      router.push(publish ? `/posts/${data.slug}` : "/dashboard");
      router.refresh();
    } else {
      const data = await res.json().catch(() => ({}));
      setError(typeof data.error === "string" ? data.error : "Could not save the post");
    }
  }

  return (
    <div className="mx-auto max-w-3xl">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{post ? "Edit story" : "New story"}</h1>
        <button onClick={() => setPreview(!preview)} className="btn-ghost">
          {preview ? "Edit" : "Preview"}
        </button>
      </div>

      {preview ? (
        <article className="card mt-4">
          <h1 className="text-3xl font-bold">{title || "Untitled"}</h1>
          <MarkdownView markdown={content} />
        </article>
      ) : (
        <div className="mt-4 space-y-4">
          <input
            className="input text-xl font-bold"
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <textarea
            className="input min-h-[50vh] font-mono text-sm"
            placeholder="Write in Markdown…"
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
          <input
            className="input"
            placeholder="One-line excerpt (optional)"
            value={excerpt}
            onChange={(e) => setExcerpt(e.target.value)}
          />
          <input
            className="input"
            placeholder="Cover image URL (optional)"
            value={coverImage}
            onChange={(e) => setCoverImage(e.target.value)}
          />
          {!post && (
            <div>
              <p className="mb-2 text-sm font-medium">Tags</p>
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <button
                    key={tag.id}
                    onClick={() =>
                      setSelectedTags((s) =>
                        s.includes(tag.id) ? s.filter((x) => x !== tag.id) : [...s, tag.id]
                      )
                    }
                    className={`badge border ${selectedTags.includes(tag.id) ? "border-accent bg-accent/10 text-accent" : "border-gray-300 bg-white"}`}
                  >
                    {tag.name}
                  </button>
                ))}
              </div>
              <div className="mt-2 flex gap-2">
                <input
                  className="input max-w-48"
                  placeholder="New tag"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && addTag()}
                />
                <button onClick={addTag} className="btn-ghost">Add</button>
              </div>
            </div>
          )}
        </div>
      )}

      {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
      <div className="mt-6 flex gap-3">
        <button onClick={() => save(true)} disabled={busy || !title || !content} className="btn-primary disabled:opacity-50">
          Publish
        </button>
        <button onClick={() => save(false)} disabled={busy || !title || !content} className="btn-ghost disabled:opacity-50">
          Save draft
        </button>
      </div>
      <p className="mt-3 text-xs text-gray-500">
        Free accounts can publish 2 stories per day. Premium is unlimited.
      </p>
    </div>
  );
}
