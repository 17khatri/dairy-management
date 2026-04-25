import Link from "next/link"

import { prisma } from "@/lib/prisma"
import { calculateAppliedPrice, calculateTotalAmount, formatAmount, formatDate } from "@/lib/dairy"

export const dynamic = "force-dynamic"

export default async function HomePage() {
  const [supplierCount, entryCount, suppliers, entries] = await Promise.all([
    prisma.supplier.count(),
    prisma.milkEntry.count(),
    prisma.supplier.findMany({
      orderBy: [{ createdAt: "desc" }],
      take: 5,
    }),
    prisma.milkEntry.findMany({
      orderBy: [{ date: "desc" }, { session: "asc" }, { createdAt: "desc" }],
      take: 5,
      include: {
        supplier: true,
      },
    }),
  ])

  const totalAmount = entries.reduce((sum, entry) => {
    const appliedPrice = calculateAppliedPrice(entry.price, entry.supplier.defaultPrice)
    return sum + calculateTotalAmount(entry.quantity, appliedPrice)
  }, 0)

  return (
    <div className="space-y-8">
      <section className="grid gap-4 lg:grid-cols-[1.4fr,0.9fr]">
        <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-medium text-zinc-500">Overview</p>
          <h2 className="mt-2 text-3xl font-semibold tracking-tight text-zinc-950">
            Keep supplier pricing and daily milk collection in one place.
          </h2>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-600">
            Add suppliers, record morning and evening collection, and review applied prices and totals without manually recalculating anything.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/suppliers/add"
              className="rounded-xl bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-zinc-700"
            >
              Add supplier
            </Link>
            <Link
              href="/entries/add"
              className="rounded-xl border border-zinc-300 px-4 py-2.5 text-sm font-medium text-zinc-700 transition hover:border-zinc-900 hover:text-zinc-900"
            >
              Add entry
            </Link>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1">
          <div className="rounded-3xl border border-zinc-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-zinc-500">Suppliers</p>
            <p className="mt-2 text-3xl font-semibold text-zinc-950">{supplierCount}</p>
          </div>
          <div className="rounded-3xl border border-zinc-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-zinc-500">Entries</p>
            <p className="mt-2 text-3xl font-semibold text-zinc-950">{entryCount}</p>
          </div>
          <div className="rounded-3xl border border-zinc-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-zinc-500">Recent total</p>
            <p className="mt-2 text-3xl font-semibold text-zinc-950">₹{formatAmount(totalAmount)}</p>
          </div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-zinc-950">Recent suppliers</h3>
            <Link href="/suppliers" className="text-sm font-medium text-zinc-600 hover:text-zinc-900">
              View all
            </Link>
          </div>
          <div className="mt-4 space-y-3">
            {suppliers.length === 0 ? (
              <p className="rounded-2xl border border-dashed border-zinc-200 px-4 py-6 text-sm text-zinc-500">
                No suppliers yet. Add the first one to start collecting milk.
              </p>
            ) : (
              suppliers.map((supplier) => (
                <div
                  key={supplier.id}
                  className="flex items-center justify-between rounded-2xl border border-zinc-200 px-4 py-3"
                >
                  <div>
                    <p className="font-medium text-zinc-950">{supplier.name}</p>
                    <p className="text-sm text-zinc-500">
                      Default price ₹{formatAmount(supplier.defaultPrice)}
                    </p>
                  </div>
                  <p className="text-sm text-zinc-500">Added {formatDate(supplier.createdAt)}</p>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-zinc-950">Recent entries</h3>
            <Link href="/entries" className="text-sm font-medium text-zinc-600 hover:text-zinc-900">
              View all
            </Link>
          </div>
          <div className="mt-4 space-y-3">
            {entries.length === 0 ? (
              <p className="rounded-2xl border border-dashed border-zinc-200 px-4 py-6 text-sm text-zinc-500">
                No entries yet. Record a collection to see totals here.
              </p>
            ) : (
              entries.map((entry) => {
                const appliedPrice = calculateAppliedPrice(entry.price, entry.supplier.defaultPrice)
                const total = calculateTotalAmount(entry.quantity, appliedPrice)

                return (
                  <div
                    key={entry.id}
                    className="rounded-2xl border border-zinc-200 px-4 py-3"
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="font-medium text-zinc-950">{entry.supplier.name}</p>
                        <p className="text-sm text-zinc-500">
                          {formatDate(entry.date)} · {entry.session}
                        </p>
                      </div>
                      <p className="text-sm font-medium text-zinc-900">₹{formatAmount(total)}</p>
                    </div>
                    <p className="mt-2 text-sm text-zinc-500">
                      {entry.quantity} L at ₹{formatAmount(appliedPrice)} per liter, fat {entry.fat}%
                    </p>
                  </div>
                )
              })
            )}
          </div>
        </div>
      </section>
    </div>
  )
}
