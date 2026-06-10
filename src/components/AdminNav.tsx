'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import clsx from 'clsx'

const NAV_ITEMS = [
  { href: '/admin', label: 'Dashboard', exact: true },
  { href: '/admin/requests', label: 'Requests' },
  { href: '/admin/products', label: 'Products' },
  { href: '/admin/orders', label: 'Orders' },
  { href: '/admin/materials', label: 'Materials' },
  { href: '/admin/settings', label: 'Printers' },
  { href: '/admin/agent-runs', label: 'Agent Log' },
]

export function AdminNav() {
  const pathname = usePathname()

  return (
    <nav className="w-56 bg-gray-900 min-h-screen flex flex-col">
      <div className="p-4 border-b border-gray-700">
        <Link href="/" className="text-white font-bold text-lg">
          Print<span className="text-orange-400">Forge</span>
        </Link>
        <p className="text-gray-400 text-xs mt-0.5">Admin</p>
      </div>
      <ul className="flex-1 p-2 space-y-0.5">
        {NAV_ITEMS.map(item => {
          const active = item.exact ? pathname === item.href : pathname.startsWith(item.href)
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                className={clsx(
                  'block px-3 py-2 rounded-lg text-sm transition-colors',
                  active
                    ? 'bg-orange-500 text-white font-medium'
                    : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                )}
              >
                {item.label}
              </Link>
            </li>
          )
        })}
      </ul>
      <div className="p-4 border-t border-gray-700">
        <Link href="/" className="text-gray-400 text-xs hover:text-white transition-colors">
          ← View storefront
        </Link>
      </div>
    </nav>
  )
}
