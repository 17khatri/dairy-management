import Link from "next/link"

import { EntryForm } from "@/components/entry-form"
import { prisma } from "@/lib/prisma"

export const dynamic = "force-dynamic"

export default async function AddEntryPage() {
  const suppliers = await prisma.supplier.findMany({
    orderBy: [{ createdAt: "desc" }],
  })

  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-4 rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium text-zinc-500">New entry</p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight text-zinc-950">
            Record a supplier collection for morning or evening.
          </h2>
        </div>
        <Link
          href="/entries"
          className="inline-flex items-center justify-center rounded-xl border border-zinc-300 px-4 py-2.5 text-sm font-medium text-zinc-700 transition hover:border-zinc-900 hover:text-zinc-900"
        >
          Back to entries
        </Link>
      </section>

      {suppliers.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-zinc-200 bg-white p-6 text-sm text-zinc-500 shadow-sm">
          Add at least one supplier before creating an entry.
          <div className="mt-4">
            <Link
              href="/suppliers/add"
              className="inline-flex items-center justify-center rounded-xl bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-zinc-700"
            >
              Add supplier
            </Link>
          </div>
        </div>
      ) : (
        <EntryForm
          suppliers={suppliers.map((supplier) => ({
            id: supplier.id,
            name: supplier.name,
            defaultPrice: supplier.defaultPrice,
            paymentSchedule: supplier.paymentSchedule,
          }))}
        />
      )}
    </div>
  )
}
