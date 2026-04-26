import Link from "next/link"

import { DeleteButton } from "@/components/delete-button"
import { prisma } from "@/lib/prisma"
import {
  calculateAppliedPrice,
  calculateTotalAmount,
  formatAmount,
  formatDate,
  getDateRangeForInput,
} from "@/lib/dairy"

export const dynamic = "force-dynamic"

export default async function EntriesPage({
  searchParams,
}: {
  searchParams?: Promise<{
    supplierId?: string
    date?: string
  }>
}) {
  const resolvedSearchParams = (await searchParams) ?? {}
  const supplierId =
    typeof resolvedSearchParams.supplierId === "string" ? resolvedSearchParams.supplierId : ""
  const dateFilter =
    typeof resolvedSearchParams.date === "string" ? resolvedSearchParams.date : ""
  const dateRange = dateFilter ? getDateRangeForInput(dateFilter) : null
  const suppliers = await prisma.supplier.findMany({
    orderBy: [{ name: "asc" }],
  })
  const entries = await prisma.milkEntry.findMany({
    where: {
      ...(supplierId ? { supplierId } : {}),
      ...(dateRange
        ? {
            date: {
              gte: dateRange.startDate,
              lt: dateRange.endDate,
            },
          }
        : {}),
    },
    orderBy: [
      { supplier: { name: "asc" } },
      { date: "desc" },
      { session: "asc" },
      { createdAt: "desc" },
    ],
    include: {
      supplier: true,
    },
  })

  const supplierGroups = entries.reduce<
    Array<{
      supplierId: string
      supplierName: string
      totalAmount: number
      entries: typeof entries
    }>
  >((groups, entry) => {
    const appliedPrice = calculateAppliedPrice(entry.price, entry.supplier.defaultPrice)
    const totalAmount = calculateTotalAmount(entry.quantity, appliedPrice)
    const lastGroup = groups.at(-1)

    if (lastGroup && lastGroup.supplierId === entry.supplierId) {
      lastGroup.entries.push(entry)
      lastGroup.totalAmount += totalAmount
      return groups
    }

    groups.push({
      supplierId: entry.supplierId,
      supplierName: entry.supplier.name,
      totalAmount,
      entries: [entry],
    })

    return groups
  }, [])

  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-4 rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium text-zinc-500">Milk entries</p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight text-zinc-950">
            Review supplier-wise milk collection entries.
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
        <form className="mb-6 grid gap-4 rounded-2xl border border-zinc-200 bg-zinc-50 p-4 sm:grid-cols-[1fr,220px] lg:grid-cols-[1fr,220px,auto]">
          <div className="space-y-2">
            <label htmlFor="supplierId" className="block text-sm font-medium text-zinc-900">
              Supplier
            </label>
            <select
              id="supplierId"
              name="supplierId"
              defaultValue={supplierId}
              className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-sm text-zinc-900 outline-none transition focus:border-zinc-900"
            >
              <option value="">All suppliers</option>
              {suppliers.map((supplier) => (
                <option key={supplier.id} value={supplier.id}>
                  {supplier.name}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label htmlFor="date" className="block text-sm font-medium text-zinc-900">
              Date
            </label>
            <input
              id="date"
              name="date"
              type="date"
              defaultValue={dateFilter}
              className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-sm text-zinc-900 outline-none transition focus:border-zinc-900"
            />
          </div>

          <div className="flex flex-wrap items-end gap-3 lg:flex-nowrap">
            <button
              type="submit"
              className="inline-flex items-center justify-center rounded-xl bg-zinc-900 px-4 py-3 text-sm font-medium text-white transition hover:bg-zinc-700"
            >
              Filter
            </button>
            <Link
              href="/entries"
              className="inline-flex items-center justify-center rounded-xl border border-zinc-300 px-4 py-3 text-sm font-medium text-zinc-700 transition hover:border-zinc-900 hover:text-zinc-900"
            >
              Clear
            </Link>
          </div>
        </form>

        {entries.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-zinc-200 px-4 py-8 text-sm text-zinc-500">
            No entries yet. Add the first milk collection record.
          </div>
        ) : (
          <div className="space-y-6">
            {supplierGroups.map((group) => (
              <div key={group.supplierId} className="rounded-2xl border border-zinc-200">
                <div className="flex flex-col gap-4 border-b border-zinc-200 px-5 py-4 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-zinc-950">{group.supplierName}</h3>
                  </div>
                  <div className="grid gap-3 text-sm sm:grid-cols-1">
                    <div className="rounded-xl bg-zinc-50 px-4 py-3">
                      <p className="text-zinc-500">Total amount</p>
                      <p className="mt-1 font-semibold text-zinc-950">
                        ₹{formatAmount(group.totalAmount)}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-3 p-4 md:hidden">
                  {group.entries.map((entry) => {
                    const appliedPrice = calculateAppliedPrice(
                      entry.price,
                      entry.supplier.defaultPrice,
                    )
                    const totalAmount = calculateTotalAmount(entry.quantity, appliedPrice)

                    return (
                      <div key={entry.id} className="rounded-2xl border border-zinc-200 p-4">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <p className="font-medium text-zinc-950">{formatDate(entry.date)}</p>
                            <p className="mt-1 text-sm text-zinc-500">{entry.session}</p>
                          </div>
                          <p className="text-sm font-semibold text-zinc-950">
                            ₹{formatAmount(totalAmount)}
                          </p>
                        </div>

                        <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                          <div className="rounded-xl bg-zinc-50 px-3 py-3">
                            <p className="text-zinc-500">Quantity</p>
                            <p className="mt-1 font-medium text-zinc-950">{entry.quantity} L</p>
                          </div>
                          <div className="rounded-xl bg-zinc-50 px-3 py-3">
                            <p className="text-zinc-500">Fat</p>
                            <p className="mt-1 font-medium text-zinc-950">{entry.fat}%</p>
                          </div>
                          <div className="rounded-xl bg-zinc-50 px-3 py-3">
                            <p className="text-zinc-500">Price</p>
                            <p className="mt-1 font-medium text-zinc-950">
                              ₹{formatAmount(appliedPrice)}
                            </p>
                          </div>
                          <div className="rounded-xl bg-zinc-50 px-3 py-3">
                            <p className="text-zinc-500">Total</p>
                            <p className="mt-1 font-medium text-zinc-950">
                              ₹{formatAmount(totalAmount)}
                            </p>
                          </div>
                        </div>

                        <div className="mt-4">
                          <DeleteButton
                            endpoint={`/api/entries/${entry.id}`}
                            confirmMessage="Are you sure you want to delete this entry?"
                          />
                        </div>
                      </div>
                    )
                  })}
                </div>

                <div className="hidden overflow-x-auto md:block">
                  <table className="min-w-full border-separate border-spacing-0">
                    <thead>
                      <tr className="text-left text-xs uppercase tracking-[0.18em] text-zinc-500">
                        <th className="border-b border-zinc-200 px-4 py-3 font-medium">Date</th>
                        <th className="border-b border-zinc-200 px-4 py-3 font-medium">Session</th>
                        <th className="border-b border-zinc-200 px-4 py-3 font-medium">Quantity</th>
                        <th className="border-b border-zinc-200 px-4 py-3 font-medium">Fat</th>
                        <th className="border-b border-zinc-200 px-4 py-3 font-medium">Price</th>
                        <th className="border-b border-zinc-200 px-4 py-3 font-medium">Total</th>
                        <th className="border-b border-zinc-200 px-4 py-3 font-medium">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {group.entries.map((entry) => {
                        const appliedPrice = calculateAppliedPrice(
                          entry.price,
                          entry.supplier.defaultPrice,
                        )
                        const totalAmount = calculateTotalAmount(entry.quantity, appliedPrice)

                        return (
                          <tr key={entry.id} className="text-sm text-zinc-700">
                            <td className="border-b border-zinc-100 px-4 py-4">
                              {formatDate(entry.date)}
                            </td>
                            <td className="border-b border-zinc-100 px-4 py-4">{entry.session}</td>
                            <td className="border-b border-zinc-100 px-4 py-4">{entry.quantity} L</td>
                            <td className="border-b border-zinc-100 px-4 py-4">{entry.fat}%</td>
                            <td className="border-b border-zinc-100 px-4 py-4">
                              ₹{formatAmount(appliedPrice)}
                            </td>
                            <td className="border-b border-zinc-100 px-4 py-4 font-medium text-zinc-950">
                              ₹{formatAmount(totalAmount)}
                            </td>
                            <td className="border-b border-zinc-100 px-4 py-4">
                              <DeleteButton
                                endpoint={`/api/entries/${entry.id}`}
                                confirmMessage="Are you sure you want to delete this entry?"
                              />
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
