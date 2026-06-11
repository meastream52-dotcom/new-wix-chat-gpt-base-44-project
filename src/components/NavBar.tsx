import Link from "next/link";
import { clerkEnabled, getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { DevUserSwitcher } from "@/components/DevUserSwitcher";
import { NotificationBell } from "@/components/NotificationBell";

export async function NavBar() {
  const user = await getCurrentUser();
  const unread = user
    ? await prisma.notification.count({ where: { userId: user.id, readAt: null } })
    : 0;

  return (
    <header className="sticky top-0 z-20 border-b border-gray-200 bg-paper/90 backdrop-blur">
      <div className="mx-auto flex w-full max-w-5xl items-center gap-4 px-4 py-3">
        <Link href="/" className="text-xl font-extrabold tracking-tight">
          Echo<span className="text-accent">Blog</span>
        </Link>
        <nav className="flex items-center gap-4 text-sm text-gray-600">
          <Link href="/" className="hover:text-ink">Read</Link>
          {user && <Link href="/write" className="hover:text-ink">Write</Link>}
          {user && <Link href="/dashboard" className="hover:text-ink">Dashboard</Link>}
          <Link href="/pricing" className="hover:text-ink">Premium</Link>
          {user && (user.role === "ADMIN" || user.role === "MODERATOR") && (
            <Link href="/admin/revenue" className="font-medium text-accent">Admin</Link>
          )}
        </nav>
        <div className="ml-auto flex items-center gap-3">
          {user && <NotificationBell initialUnread={unread} />}
          {user && (
            <Link
              href={`/u/${user.username}`}
              className="text-sm font-medium text-gray-700 hover:text-ink"
            >
              @{user.username}
            </Link>
          )}
          {!clerkEnabled && <DevUserSwitcher current={user?.username ?? null} />}
          {clerkEnabled && !user && (
            <Link href="/sign-in" className="btn-primary">Sign in</Link>
          )}
        </div>
      </div>
    </header>
  );
}
