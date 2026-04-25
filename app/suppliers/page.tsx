import Link from "next/link"

import { prisma } from "@/lib/prisma"
import { formatAmount, formatDate } from "@/lib/dairy"

export const dynamic = "force-dynamic"

export default async function SuppliersPage() {
  const suppliers = await prisma.supplier.findMany({
    orderBy: [{ createdAt: "desc" }],
    include: {
      _count: {
        select: {
          entries: true,
        },
      },
    },
  })

  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-4 rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium text-zinc-500">Suppliers</p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight text-zinc-950">
            Manage milk providers and their default price.
          </h2>
        </div>
        <Link
          href="/suppliers/add"
          className="inline-flex items-center justify-center rounded-xl bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-zinc-700"
        >
          Add supplier
        </Link>
      </section>

      <section className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm">
        {suppliers.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-zinc-200 px-4 py-8 text-sm text-zinc-500">
            No suppliers yet. Create one to start recording entries.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full border-separate border-spacing-0">
              <thead>
                <tr className="text-left text-xs uppercase tracking-[0.18em] text-zinc-500">
                  <th className="border-b border-zinc-200 px-4 py-3 font-medium">Supplier</th>
                  <th className="border-b border-zinc-200 px-4 py-3 font-medium">Default price</th>
                  <th className="border-b border-zinc-200 px-4 py-3 font-medium">Entries</th>
                  <th className="border-b border-zinc-200 px-4 py-3 font-medium">Created</th>
                </tr>
              </thead>
              <tbody>
                {suppliers.map((supplier) => (
                  <tr key={supplier.id} className="text-sm text-zinc-700">
                    <td className="border-b border-zinc-100 px-4 py-4 font-medium text-zinc-950">
                      {supplier.name}
                    </td>
                    <td className="border-b border-zinc-100 px-4 py-4">₹{formatAmount(supplier.defaultPrice)}</td>
                    <td className="border-b border-zinc-100 px-4 py-4">{supplier._count.entries}</td>
                    <td className="border-b border-zinc-100 px-4 py-4">{formatDate(supplier.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  )
}
