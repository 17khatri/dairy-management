"use client"

import type { FormEvent } from "react"
import { useMemo, useState } from "react"
import { useRouter } from "next/navigation"

import {
  formatDateInputValue,
  formatPaymentSchedule,
  type SessionValue,
  type SupplierOption,
} from "@/lib/dairy"

type EntryFormProps = {
  suppliers: SupplierOption[]
}

export function EntryForm({ suppliers }: EntryFormProps) {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [supplierId, setSupplierId] = useState(suppliers[0]?.id ?? "")
  const [session, setSession] = useState<SessionValue>("MORNING")
  const [price, setPrice] = useState("")
  const [date, setDate] = useState(formatDateInputValue())

  const selectedSupplier = useMemo(
    () => suppliers.find((supplier) => supplier.id === supplierId) ?? null,
    [supplierId, suppliers],
  )

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    setIsSubmitting(true)

    const formData = new FormData(event.currentTarget)
    const payload = {
      supplierId: String(formData.get("supplierId") ?? ""),
      date: String(formData.get("date") ?? ""),
      session: String(formData.get("session") ?? ""),
      quantity: Number(formData.get("quantity")),
      fat: Number(formData.get("fat")),
      price: String(formData.get("price") ?? "").trim() === "" ? null : Number(formData.get("price")),
    }

    const response = await fetch("/api/entries", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    })

    const data = (await response.json().catch(() => null)) as
      | { error?: string }
      | null

    setIsSubmitting(false)

    if (!response.ok) {
      setError(data?.error ?? "Something went wrong while saving the entry.")
      return
    }

    router.push("/entries")
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
      <div className="space-y-2">
        <label htmlFor="supplierId" className="block text-sm font-medium text-zinc-900">
          Supplier
        </label>
        <select
          id="supplierId"
          name="supplierId"
          value={supplierId}
          onChange={(event) => {
            const nextSupplierId = event.target.value
            setSupplierId(nextSupplierId)

            const nextSupplier = suppliers.find((supplier) => supplier.id === nextSupplierId)
            if (nextSupplier) {
              setPrice(String(nextSupplier.defaultPrice))
            }
          }}
          className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-sm text-zinc-900 outline-none transition focus:border-zinc-900"
          required
        >
          {suppliers.map((supplier) => (
            <option key={supplier.id} value={supplier.id}>
              {supplier.name} - {supplier.defaultPrice.toFixed(2)}
            </option>
          ))}
        </select>
        {selectedSupplier ? (
          <p className="text-xs text-zinc-500">
            Payment cycle: {formatPaymentSchedule(selectedSupplier.paymentSchedule)}
          </p>
        ) : null}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <label htmlFor="date" className="block text-sm font-medium text-zinc-900">
            Date
          </label>
          <input
            id="date"
            name="date"
            type="date"
            value={date}
            onChange={(event) => setDate(event.target.value)}
            className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-sm text-zinc-900 outline-none transition focus:border-zinc-900"
            required
          />
        </div>

        <div className="space-y-2">
          <span className="block text-sm font-medium text-zinc-900">Session</span>
          <div className="flex gap-2">
            {(["MORNING", "EVENING"] as SessionValue[]).map((value) => (
              <label
                key={value}
                className={`flex flex-1 cursor-pointer items-center justify-center rounded-xl border px-4 py-3 text-sm font-medium transition ${
                  session === value
                    ? "border-zinc-900 bg-zinc-900 text-white"
                    : "border-zinc-300 bg-white text-zinc-700 hover:border-zinc-500"
                }`}
              >
                <input
                  type="radio"
                  name="session"
                  value={value}
                  checked={session === value}
                  onChange={() => setSession(value)}
                  className="sr-only"
                />
                {value}
              </label>
            ))}
          </div>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="space-y-2">
          <label htmlFor="quantity" className="block text-sm font-medium text-zinc-900">
            Quantity (liters)
          </label>
          <input
            id="quantity"
            name="quantity"
            type="number"
            min="0"
            step="0.01"
            required
            className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-sm text-zinc-900 outline-none transition focus:border-zinc-900"
            placeholder="10"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="fat" className="block text-sm font-medium text-zinc-900">
            Fat (%)
          </label>
          <input
            id="fat"
            name="fat"
            type="number"
            min="0"
            step="0.01"
            required
            className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-sm text-zinc-900 outline-none transition focus:border-zinc-900"
            placeholder="4.5"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="price" className="block text-sm font-medium text-zinc-900">
            Price per liter
          </label>
          <input
            id="price"
            name="price"
            type="number"
            min="0"
            step="0.01"
            value={price}
            onChange={(event) => setPrice(event.target.value)}
            className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-sm text-zinc-900 outline-none transition focus:border-zinc-900"
            placeholder={selectedSupplier ? String(selectedSupplier.defaultPrice) : "35"}
          />
        </div>
      </div>

      {error ? (
        <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={isSubmitting || suppliers.length === 0}
        className="inline-flex items-center justify-center rounded-xl bg-zinc-900 px-5 py-3 text-sm font-medium text-white transition hover:bg-zinc-700 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isSubmitting ? "Saving..." : "Create entry"}
      </button>
    </form>
  )
}
