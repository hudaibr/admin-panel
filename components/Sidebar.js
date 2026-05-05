'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const links = [
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/users', label: 'Users' },
  { href: '/admin-activation', label: 'Activation Codes' },
  { href: '/settings', label: 'Settings' },
  ],


export default function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="border-b border-[#d8dee6] bg-white md:min-h-screen md:w-64 md:border-b-0 md:border-r">
      <div className="hidden h-16 items-center border-b border-[#d8dee6] px-6 md:flex">
        <span className="text-lg font-bold">SaaS Admin</span>
      </div>
      <nav className="flex gap-2 overflow-x-auto p-3 md:flex-col md:p-4">
        {links.map((link) => {
          const active = pathname === link.href
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`whitespace-nowrap rounded-md px-3 py-2 text-sm font-medium ${
                active
                  ? 'bg-[#ccfbf1] text-[#0f766e]'
                  : 'text-[#475467] hover:bg-[#f2f4f7] hover:text-[#1f2933]'
              }`}
            >
              {link.label}
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}
