"use client"

import type { FormEvent } from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"

import type { PaymentScheduleValue } from "@/lib/dairy"

type SupplierFormProps = {
  mode?: "create" | "edit"
  initialValues?: {
    id?: string
    name: string
    defaultPrice: number
    paymentSchedule: PaymentScheduleValue
  }
}

export function SupplierForm({
  mode = "create",
  initialValues,
}: SupplierFormProps) {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [paymentSchedule, setPaymentSchedule] = useState<PaymentScheduleValue>(
    initialValues?.paymentSchedule ?? "DAILY",
  )

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    setIsSubmitting(true)

    const formData = new FormData(event.currentTarget)
    const name = String(formData.get("name") ?? "").trim()
    const defaultPrice = Number(formData.get("defaultPrice"))

    const response = await fetch(
      mode === "edit" && initialValues?.id
        ? `/api/suppliers/${initialValues.id}`
        : "/api/suppliers",
      {
        method: mode === "edit" ? "PATCH" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          defaultPrice,
          paymentSchedule,
        }),
      },
    )

    const data = (await response.json().catch(() => null)) as
      | { error?: string }
      | null

    setIsSubmitting(false)

    if (!response.ok) {
      setError(data?.error ?? "Something went wrong while saving the supplier.")
      return
    }

    router.push("/suppliers")
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
      <div className="space-y-2">
        <label htmlFor="name" className="block text-sm font-medium text-zinc-900">
          Supplier name
        </label>
        <input
          id="name"
          name="name"
          required
          defaultValue={initialValues?.name ?? ""}
          className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-sm text-zinc-900 outline-none transition focus:border-zinc-900"
          placeholder="Ramesh"
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="defaultPrice" className="block text-sm font-medium text-zinc-900">
          Default price per liter
        </label>
        <input
          id="defaultPrice"
          name="defaultPrice"
          type="number"
          min="0"
          step="0.01"
          required
          defaultValue={initialValues?.defaultPrice ?? ""}
          className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-sm text-zinc-900 outline-none transition focus:border-zinc-900"
          placeholder="35"
        />
      </div>

      <div className="space-y-3 rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
        <div>
          <p className="text-sm font-medium text-zinc-900">Payment schedule</p>
          <p className="mt-1 text-sm text-zinc-500">
            Choose how this supplier is usually settled.
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <label
            className={`cursor-pointer rounded-xl border p-4 text-sm transition ${
              paymentSchedule === "DAILY"
                ? "border-zinc-900 bg-white text-zinc-950"
                : "border-zinc-200 bg-white text-zinc-600"
            }`}
          >
            <input
              type="radio"
              name="paymentSchedule"
              value="DAILY"
              checked={paymentSchedule === "DAILY"}
              onChange={() => setPaymentSchedule("DAILY")}
              className="sr-only"
            />
            <p className="font-medium">Daily payment</p>
            <p className="mt-1 text-xs text-zinc-500">
              Each day&apos;s milk entry will be settled separately.
            </p>
          </label>

          <label
            className={`cursor-pointer rounded-xl border p-4 text-sm transition ${
              paymentSchedule === "TEN_DAYS"
                ? "border-zinc-900 bg-white text-zinc-950"
                : "border-zinc-200 bg-white text-zinc-600"
            }`}
          >
            <input
              type="radio"
              name="paymentSchedule"
              value="TEN_DAYS"
              checked={paymentSchedule === "TEN_DAYS"}
              onChange={() => setPaymentSchedule("TEN_DAYS")}
              className="sr-only"
            />
            <p className="font-medium">10 day payment</p>
            <p className="mt-1 text-xs text-zinc-500">
              Entries are grouped into 10-day settlement batches.
            </p>
          </label>
        </div>
      </div>

      {error ? (
        <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={isSubmitting}
        className="inline-flex items-center justify-center rounded-xl bg-zinc-900 px-5 py-3 text-sm font-medium text-white transition hover:bg-zinc-700 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isSubmitting ? "Saving..." : mode === "edit" ? "Update supplier" : "Create supplier"}
      </button>
    </form>
  )
}
