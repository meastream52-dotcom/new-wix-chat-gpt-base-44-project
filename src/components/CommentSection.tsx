"use client";

import { useEffect, useState } from "react";

interface CommentNode {
  id: string;
  content: string;
  parentId: string | null;
  createdAt: string;
  author: { username: string; name: string | null };
}

export function CommentSection({ postId, signedIn }: { postId: string; signedIn: boolean }) {
  const [comments, setComments] = useState<CommentNode[]>([]);
  const [text, setText] = useState("");
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = () =>
    fetch(`/api/posts/${postId}/comments`)
      .then((r) => r.json())
      .then((d) => setComments(d.comments ?? []))
      .catch(() => {});

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [postId]);

  async function submit() {
    setError(null);
    const res = await fetch(`/api/posts/${postId}/comments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: text, parentId: replyTo ?? undefined }),
    });
    if (res.ok) {
      setText("");
      setReplyTo(null);
      load();
    } else {
      const data = await res.json().catch(() => ({}));
      setError(typeof data.error === "string" ? data.error : "Could not post comment");
    }
  }

  async function report(commentId: string) {
    const reason = window.prompt("Why are you reporting this comment?");
    if (!reason) return;
    await fetch("/api/reports", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ targetType: "comment", targetId: commentId, reason }),
    });
    alert("Thanks — a moderator will take a look.");
  }

  const topLevel = comments.filter((c) => !c.parentId);
  const repliesOf = (id: string) => comments.filter((c) => c.parentId === id);

  const renderComment = (c: CommentNode, depth: number) => (
    <div key={c.id} className={depth > 0 ? "ml-6 border-l border-gray-200 pl-4" : ""}>
      <div className="py-3">
        <p className="text-xs text-gray-500">
          <span className="font-medium text-gray-700">@{c.author.username}</span> ·{" "}
          {new Date(c.createdAt).toLocaleDateString()}
        </p>
        <p className="mt-1 text-sm">{c.content}</p>
        <div className="mt-1 flex gap-3 text-xs text-gray-400">
          {signedIn && depth < 4 && (
            <button onClick={() => setReplyTo(c.id)} className="hover:text-ink">Reply</button>
          )}
          {signedIn && (
            <button onClick={() => report(c.id)} className="hover:text-red-600">Report</button>
          )}
        </div>
      </div>
      {repliesOf(c.id).map((r) => renderComment(r, depth + 1))}
    </div>
  );

  return (
    <section className="mt-10">
      <h2 className="text-lg font-bold">Responses ({comments.length})</h2>
      {signedIn ? (
        <div className="mt-4">
          {replyTo && (
            <p className="mb-1 text-xs text-gray-500">
              Replying to a comment —{" "}
              <button className="underline" onClick={() => setReplyTo(null)}>cancel</button>
            </p>
          )}
          <textarea
            className="input min-h-20"
            placeholder="What did you think?"
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
          {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
          <button onClick={submit} disabled={!text.trim()} className="btn-primary mt-2 disabled:opacity-50">
            Respond
          </button>
        </div>
      ) : (
        <p className="mt-3 text-sm text-gray-500">Sign in to join the conversation.</p>
      )}
      <div className="mt-4 divide-y divide-gray-100">
        {topLevel.map((c) => renderComment(c, 0))}
      </div>
    </section>
  );
}
