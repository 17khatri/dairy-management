import Link from "next/link"

import { DeleteButton } from "@/components/delete-button"
import { PaymentGroupToggle } from "@/components/payment-group-toggle"
import {
  formatAmount,
  formatDate,
  formatPaymentSchedule,
  groupEntriesForPayments,
} from "@/lib/dairy"
import { prisma } from "@/lib/prisma"

export const dynamic = "force-dynamic"

export default async function PaymentsPage() {
  const entries = await prisma.milkEntry.findMany({
    orderBy: [{ supplier: { name: "asc" } }, { date: "asc" }, { session: "asc" }],
    include: {
      supplier: true,
    },
  })

  const paymentGroups = groupEntriesForPayments(entries)

  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-4 rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium text-zinc-500">Payments</p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight text-zinc-950">
            Review supplier payments by daily or 10 day settlement.
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
        {paymentGroups.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-zinc-200 px-4 py-8 text-sm text-zinc-500">
            No payment data yet. Add entries to start settlement tracking.
          </div>
        ) : (
          <div className="space-y-6">
            {paymentGroups.map((group) => (
              <div key={group.id} className="rounded-2xl border border-zinc-200">
                <div className="flex flex-col gap-4 border-b border-zinc-200 px-5 py-4 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-zinc-950">{group.supplierName}</h3>
                    <p className="mt-1 text-sm text-zinc-500">
                      {formatPaymentSchedule(group.paymentSchedule)}
                    </p>
                    <p className="mt-2 text-sm text-zinc-500">
                      {formatDate(group.startDate)}
                      {group.startDate.getTime() !== group.endDate.getTime()
                        ? ` to ${formatDate(group.endDate)}`
                        : null}
                    </p>
                  </div>

                  <div className="flex flex-col gap-3 sm:items-end">
                    <div className="rounded-xl bg-zinc-50 px-4 py-3 text-sm">
                      <p className="text-zinc-500">Total amount</p>
                      <p className="mt-1 font-semibold text-zinc-950">
                        ₹{formatAmount(group.totalAmount)}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
                          group.isPaid
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-amber-100 text-amber-700"
                        }`}
                      >
                        {group.isPaid ? "Paid" : "Unpaid"}
                      </span>
                      <PaymentGroupToggle
                        entryIds={group.entries.map((entry) => entry.id)}
                        isPaid={group.isPaid}
                      />
                    </div>
                    <p className="text-xs text-zinc-500">
                      {group.isPaid && group.paidAt
                        ? `Paid on ${formatDate(group.paidAt)}`
                        : "Waiting for payment"}
                    </p>
                  </div>
                </div>

                <div className="space-y-3 p-4 md:hidden">
                  {group.entries.map((entry) => (
                    <div key={entry.id} className="rounded-2xl border border-zinc-200 p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="font-medium text-zinc-950">{formatDate(entry.date)}</p>
                          <p className="mt-1 text-sm text-zinc-500">{entry.session}</p>
                        </div>
                        <p className="text-sm font-semibold text-zinc-950">
                          ₹{formatAmount(entry.totalAmount)}
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
                            ₹{formatAmount(entry.appliedPrice)}
                          </p>
                        </div>
                        <div className="rounded-xl bg-zinc-50 px-3 py-3">
                          <p className="text-zinc-500">Total</p>
                          <p className="mt-1 font-medium text-zinc-950">
                            ₹{formatAmount(entry.totalAmount)}
                          </p>
                        </div>
                      </div>

                      <div className="mt-4">
                        <DeleteButton
                          endpoint={`/api/entries/${entry.id}`}
                          confirmMessage="Are you sure you want to delete this payment entry?"
                        />
                      </div>
                    </div>
                  ))}
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
                      {group.entries.map((entry) => (
                        <tr key={entry.id} className="text-sm text-zinc-700">
                          <td className="border-b border-zinc-100 px-4 py-4">
                            {formatDate(entry.date)}
                          </td>
                          <td className="border-b border-zinc-100 px-4 py-4">{entry.session}</td>
                          <td className="border-b border-zinc-100 px-4 py-4">
                            {entry.quantity} L
                          </td>
                          <td className="border-b border-zinc-100 px-4 py-4">{entry.fat}%</td>
                          <td className="border-b border-zinc-100 px-4 py-4">
                            ₹{formatAmount(entry.appliedPrice)}
                          </td>
                          <td className="border-b border-zinc-100 px-4 py-4 font-medium text-zinc-950">
                            ₹{formatAmount(entry.totalAmount)}
                          </td>
                          <td className="border-b border-zinc-100 px-4 py-4">
                            <DeleteButton
                              endpoint={`/api/entries/${entry.id}`}
                              confirmMessage="Are you sure you want to delete this payment entry?"
                            />
                          </td>
                        </tr>
                      ))}
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
