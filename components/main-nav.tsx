"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

const navItems = [
  { href: "/", label: "Dashboard" },
  { href: "/suppliers", label: "Suppliers" },
  { href: "/entries", label: "Entries" },
  { href: "/payments", label: "Payments" },
]

export function MainNav() {
  const pathname = usePathname()

  return (
    <nav className="grid grid-cols-2 gap-2 text-sm font-medium sm:flex sm:flex-wrap">
      {navItems.map((item) => {
        const isActive =
          item.href === "/"
            ? pathname === "/"
            : pathname === item.href || pathname.startsWith(`${item.href}/`)

        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={isActive ? "page" : undefined}
            className={`rounded-full px-4 py-2 text-center transition ${
              isActive
                ? "border border-zinc-900 bg-zinc-900 text-white"
                : "border border-zinc-300 text-zinc-700 hover:border-zinc-900 hover:text-zinc-900"
            }`}
          >
            {item.label}
          </Link>
        )
      })}
    </nav>
  )
}
