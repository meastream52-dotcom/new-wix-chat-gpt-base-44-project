"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

/** Dev-auth mode only: pick a seeded demo user. Hidden when Clerk is configured. */
export function DevUserSwitcher({ current }: { current: string | null }) {
  const router = useRouter();
  const [users, setUsers] = useState<Array<{ username: string; role: string }>>([]);

  useEffect(() => {
    fetch("/api/dev/login")
      .then((r) => (r.ok ? r.json() : { users: [] }))
      .then((d) => setUsers(d.users ?? []))
      .catch(() => {});
  }, []);

  async function switchTo(username: string) {
    await fetch("/api/dev/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: username || null }),
    });
    router.refresh();
  }

  return (
    <select
      className="rounded-lg border border-amber-300 bg-amber-50 px-2 py-1 text-xs"
      value={current ?? ""}
      onChange={(e) => switchTo(e.target.value)}
      title="Dev mode: switch demo user"
    >
      <option value="">— signed out —</option>
      {users.map((u) => (
        <option key={u.username} value={u.username}>
          {u.username} ({u.role.toLowerCase()})
        </option>
      ))}
    </select>
  );
}
