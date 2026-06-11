"use client";

import { useEffect, useState } from "react";

export function LikeButton({ postId, disabled }: { postId: string; disabled?: boolean }) {
  const [liked, setLiked] = useState(false);
  const [count, setCount] = useState(0);

  useEffect(() => {
    fetch(`/api/posts/${postId}/reactions/me`)
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (d) {
          setLiked(d.liked);
          setCount(d.count);
        }
      })
      .catch(() => {});
  }, [postId]);

  async function toggle() {
    if (disabled) return;
    // Optimistic
    setLiked(!liked);
    setCount((c) => c + (liked ? -1 : 1));
    const res = await fetch(`/api/posts/${postId}/reactions`, { method: "POST" });
    if (res.ok) {
      const data = await res.json();
      setLiked(data.liked);
      setCount(data.count);
    } else {
      setLiked(liked);
      setCount((c) => c + (liked ? 1 : -1));
    }
  }

  return (
    <button
      onClick={toggle}
      disabled={disabled}
      className={`btn-ghost ${liked ? "border-accent text-accent" : ""} disabled:opacity-50`}
      title={disabled ? "You can't like your own post" : "Like"}
    >
      👏 {count}
    </button>
  );
}
