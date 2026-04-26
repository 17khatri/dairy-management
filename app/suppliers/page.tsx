import Link from "next/link"

import { DeleteButton } from "@/components/delete-button"
import { prisma } from "@/lib/prisma"
import { formatAmount, formatDate, formatPaymentSchedule } from "@/lib/dairy"

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
          <>
            <div className="space-y-4 md:hidden">
              {suppliers.map((supplier) => (
                <div key={supplier.id} className="rounded-2xl border border-zinc-200 p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="font-semibold text-zinc-950">{supplier.name}</h3>
                      <p className="mt-1 text-sm text-zinc-500">
                        {formatPaymentSchedule(supplier.paymentSchedule)}
                      </p>
                    </div>
                    <p className="text-sm font-medium text-zinc-950">
                      ₹{formatAmount(supplier.defaultPrice)}
                    </p>
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                    <div className="rounded-xl bg-zinc-50 px-3 py-3">
                      <p className="text-zinc-500">Entries</p>
                      <p className="mt-1 font-medium text-zinc-950">{supplier._count.entries}</p>
                    </div>
                    <div className="rounded-xl bg-zinc-50 px-3 py-3">
                      <p className="text-zinc-500">Created</p>
                      <p className="mt-1 font-medium text-zinc-950">{formatDate(supplier.createdAt)}</p>
                    </div>
                  </div>

                  <div className="mt-4 flex items-center gap-4">
                    <Link
                      href={`/suppliers/${supplier.id}/edit`}
                      className="text-sm font-medium text-zinc-700 transition hover:text-zinc-950"
                    >
                      Edit
                    </Link>
                    <DeleteButton
                      endpoint={`/api/suppliers/${supplier.id}`}
                      confirmMessage={`Are you sure you want to delete supplier ${supplier.name}?`}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="hidden overflow-x-auto md:block">
            <table className="min-w-full border-separate border-spacing-0">
              <thead>
                <tr className="text-left text-xs uppercase tracking-[0.18em] text-zinc-500">
                  <th className="border-b border-zinc-200 px-4 py-3 font-medium">Supplier</th>
                  <th className="border-b border-zinc-200 px-4 py-3 font-medium">Default price</th>
                  <th className="border-b border-zinc-200 px-4 py-3 font-medium">Payment cycle</th>
                  <th className="border-b border-zinc-200 px-4 py-3 font-medium">Entries</th>
                  <th className="border-b border-zinc-200 px-4 py-3 font-medium">Created</th>
                  <th className="border-b border-zinc-200 px-4 py-3 font-medium">Action</th>
                </tr>
              </thead>
              <tbody>
                {suppliers.map((supplier) => (
                  <tr key={supplier.id} className="text-sm text-zinc-700">
                    <td className="border-b border-zinc-100 px-4 py-4 font-medium text-zinc-950">
                      {supplier.name}
                    </td>
                    <td className="border-b border-zinc-100 px-4 py-4">₹{formatAmount(supplier.defaultPrice)}</td>
                    <td className="border-b border-zinc-100 px-4 py-4">
                      {formatPaymentSchedule(supplier.paymentSchedule)}
                    </td>
                    <td className="border-b border-zinc-100 px-4 py-4">{supplier._count.entries}</td>
                    <td className="border-b border-zinc-100 px-4 py-4">{formatDate(supplier.createdAt)}</td>
                    <td className="border-b border-zinc-100 px-4 py-4">
                      <div className="flex items-center gap-4">
                        <Link
                          href={`/suppliers/${supplier.id}/edit`}
                          className="text-sm font-medium text-zinc-700 transition hover:text-zinc-950"
                        >
                          Edit
                        </Link>
                        <DeleteButton
                          endpoint={`/api/suppliers/${supplier.id}`}
                          confirmMessage={`Are you sure you want to delete supplier ${supplier.name}?`}
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            </div>
          </>
        )}
      </section>
    </div>
  )
}
