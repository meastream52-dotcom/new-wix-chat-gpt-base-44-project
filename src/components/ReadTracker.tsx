"use client";

import { useEffect, useRef } from "react";

const HEARTBEAT_MS = 30_000;

/**
 * Invisible reading tracker. Heartbeats fire only while the tab is visible
 * AND the article is in the viewport; scroll depth rides along for fraud
 * detection. A final sendBeacon closes the session on pagehide.
 */
export function ReadTracker({ postId, articleSelector = "article" }: {
  postId: string;
  articleSelector?: string;
}) {
  const sessionId = useRef<string | null>(null);
  const inView = useRef(false);
  const maxScrollPct = useRef(0);

  useEffect(() => {
    const article = document.querySelector(articleSelector);
    if (!article) return;

    const observer = new IntersectionObserver(
      (entries) => { inView.current = entries[0]?.isIntersecting ?? false; },
      { threshold: 0.1 }
    );
    observer.observe(article);

    const onScroll = () => {
      const rect = article.getBoundingClientRect();
      const total = rect.height - window.innerHeight;
      if (total <= 0) {
        maxScrollPct.current = 100;
        return;
      }
      const pct = Math.min(100, Math.max(0, Math.round((-rect.top / total) * 100)));
      maxScrollPct.current = Math.max(maxScrollPct.current, pct);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    const beat = async () => {
      if (document.visibilityState !== "visible" || !inView.current) return;
      try {
        const res = await fetch("/api/read/heartbeat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            postId,
            sessionId: sessionId.current ?? undefined,
            maxScrollPct: maxScrollPct.current,
          }),
        });
        if (res.ok) {
          const data = await res.json();
          if (data.sessionId) sessionId.current = data.sessionId;
        }
      } catch {
        // network blips are fine — the session closer cron cleans up
      }
    };

    beat();
    const interval = setInterval(beat, HEARTBEAT_MS);

    const onPageHide = () => {
      if (sessionId.current) {
        navigator.sendBeacon(
          "/api/read/close",
          JSON.stringify({ sessionId: sessionId.current })
        );
      }
    };
    window.addEventListener("pagehide", onPageHide);

    return () => {
      clearInterval(interval);
      observer.disconnect();
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("pagehide", onPageHide);
      onPageHide();
    };
  }, [postId, articleSelector]);

  return null;
}
