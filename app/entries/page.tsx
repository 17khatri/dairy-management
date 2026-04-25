import Link from "next/link"

import { prisma } from "@/lib/prisma"
import {
  calculateAppliedPrice,
  calculateTotalAmount,
  formatAmount,
  formatDate,
} from "@/lib/dairy"

export const dynamic = "force-dynamic"

export default async function EntriesPage() {
  const entries = await prisma.milkEntry.findMany({
    orderBy: [{ date: "desc" }, { session: "asc" }, { createdAt: "desc" }],
    include: {
      supplier: true,
    },
  })

  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-4 rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium text-zinc-500">Milk entries</p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight text-zinc-950">
            Review collection records, applied price, and total amount.
          </h2>
        </div>
        <Link
          href="/entries/add"
          className="inline-flex items-center justify-center rounded-xl bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-zinc-700"
        >
          Add entry
        </Link>
      </section>

      <section className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm">
        {entries.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-zinc-200 px-4 py-8 text-sm text-zinc-500">
            No entries yet. Add the first milk collection record.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full border-separate border-spacing-0">
              <thead>
                <tr className="text-left text-xs uppercase tracking-[0.18em] text-zinc-500">
                  <th className="border-b border-zinc-200 px-4 py-3 font-medium">Date</th>
                  <th className="border-b border-zinc-200 px-4 py-3 font-medium">Session</th>
                  <th className="border-b border-zinc-200 px-4 py-3 font-medium">Supplier</th>
                  <th className="border-b border-zinc-200 px-4 py-3 font-medium">Quantity</th>
                  <th className="border-b border-zinc-200 px-4 py-3 font-medium">Fat</th>
                  <th className="border-b border-zinc-200 px-4 py-3 font-medium">Price</th>
                  <th className="border-b border-zinc-200 px-4 py-3 font-medium">Total</th>
                </tr>
              </thead>
              <tbody>
                {entries.map((entry) => {
                  const appliedPrice = calculateAppliedPrice(entry.price, entry.supplier.defaultPrice)
                  const totalAmount = calculateTotalAmount(entry.quantity, appliedPrice)

                  return (
                    <tr key={entry.id} className="text-sm text-zinc-700">
                      <td className="border-b border-zinc-100 px-4 py-4">{formatDate(entry.date)}</td>
                      <td className="border-b border-zinc-100 px-4 py-4">{entry.session}</td>
                      <td className="border-b border-zinc-100 px-4 py-4 font-medium text-zinc-950">
                        {entry.supplier.name}
                      </td>
                      <td className="border-b border-zinc-100 px-4 py-4">{entry.quantity} L</td>
                      <td className="border-b border-zinc-100 px-4 py-4">{entry.fat}%</td>
                      <td className="border-b border-zinc-100 px-4 py-4">₹{formatAmount(appliedPrice)}</td>
                      <td className="border-b border-zinc-100 px-4 py-4 font-medium text-zinc-950">
                        ₹{formatAmount(totalAmount)}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  )
}
