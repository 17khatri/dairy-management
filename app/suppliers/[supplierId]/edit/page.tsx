import Link from "next/link"
import { notFound } from "next/navigation"

import { SupplierForm } from "@/components/supplier-form"
import { prisma } from "@/lib/prisma"

export const dynamic = "force-dynamic"

export default async function EditSupplierPage({
  params,
}: {
  params: Promise<{ supplierId: string }>
}) {
  const { supplierId } = await params
  const supplier = await prisma.supplier.findUnique({
    where: {
      id: supplierId,
    },
  })

  if (!supplier) {
    notFound()
  }

  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-4 rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium text-zinc-500">Edit supplier</p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight text-zinc-950">
            Update pricing and payment schedule for {supplier.name}.
          </h2>
        </div>
        <Link
          href="/suppliers"
          className="inline-flex items-center justify-center rounded-xl border border-zinc-300 px-4 py-2.5 text-sm font-medium text-zinc-700 transition hover:border-zinc-900 hover:text-zinc-900"
        >
          Back to suppliers
        </Link>
      </section>

      <SupplierForm
        mode="edit"
        initialValues={{
          id: supplier.id,
          name: supplier.name,
          defaultPrice: supplier.defaultPrice,
          paymentSchedule: supplier.paymentSchedule,
        }}
      />
    </div>
  )
}
