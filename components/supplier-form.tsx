"use client"

import type { FormEvent } from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"

export function SupplierForm() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    setIsSubmitting(true)

    const formData = new FormData(event.currentTarget)
    const name = String(formData.get("name") ?? "").trim()
    const defaultPrice = Number(formData.get("defaultPrice"))

    const response = await fetch("/api/suppliers", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name,
        defaultPrice,
      }),
    })

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
          className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-sm text-zinc-900 outline-none transition focus:border-zinc-900"
          placeholder="35"
        />
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
        {isSubmitting ? "Saving..." : "Create supplier"}
      </button>
    </form>
  )
}
