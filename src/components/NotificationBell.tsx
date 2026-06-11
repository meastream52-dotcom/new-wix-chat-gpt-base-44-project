"use client";

import { useState } from "react";

interface Notification {
  id: string;
  body: string;
  href: string | null;
  readAt: string | null;
  createdAt: string;
}

export function NotificationBell({ initialUnread }: { initialUnread: number }) {
  const [open, setOpen] = useState(false);
  const [unread, setUnread] = useState(initialUnread);
  const [items, setItems] = useState<Notification[]>([]);

  async function toggle() {
    if (!open) {
      const res = await fetch("/api/notifications");
      if (res.ok) {
        const data = await res.json();
        setItems(data.notifications);
        setUnread(data.unread);
        if (data.unread > 0) {
          fetch("/api/notifications", { method: "POST" }).then(() => setUnread(0));
        }
      }
    }
    setOpen(!open);
  }

  return (
    <div className="relative">
      <button onClick={toggle} className="relative text-lg" aria-label="Notifications">
        🔔
        {unread > 0 && (
          <span className="absolute -right-2 -top-1 rounded-full bg-red-600 px-1.5 text-[10px] font-bold text-white">
            {unread}
          </span>
        )}
      </button>
      {open && (
        <div className="absolute right-0 z-30 mt-2 w-80 rounded-xl border border-gray-200 bg-white p-2 shadow-lg">
          {items.length === 0 && (
            <p className="p-3 text-sm text-gray-500">Nothing yet.</p>
          )}
          {items.map((n) => (
            <a
              key={n.id}
              href={n.href ?? "#"}
              className={`block rounded-lg p-3 text-sm hover:bg-gray-50 ${n.readAt ? "text-gray-500" : "font-medium"}`}
            >
              {n.body}
              <span className="mt-1 block text-xs text-gray-400">
                {new Date(n.createdAt).toLocaleString()}
              </span>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
