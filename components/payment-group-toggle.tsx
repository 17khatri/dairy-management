"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

type PaymentGroupToggleProps = {
  entryIds: string[]
  isPaid: boolean
}

export function PaymentGroupToggle({ entryIds, isPaid }: PaymentGroupToggleProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleToggle(nextPaid: boolean) {
    setIsSubmitting(true)

    const response = await fetch("/api/payments", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        entryIds,
        paid: nextPaid,
      }),
    })

    setIsSubmitting(false)

    if (!response.ok) {
      return
    }

    router.refresh()
  }

  return (
    <button
      type="button"
      disabled={isSubmitting}
      onClick={() => handleToggle(!isPaid)}
      className={`inline-flex items-center justify-center rounded-xl px-3 py-2 text-xs font-medium transition disabled:cursor-not-allowed disabled:opacity-60 ${
        isPaid
          ? "border border-zinc-300 bg-white text-zinc-700 hover:border-zinc-900 hover:text-zinc-900"
          : "bg-zinc-900 text-white hover:bg-zinc-700"
      }`}
    >
      {isSubmitting ? "Saving..." : isPaid ? "Mark unpaid" : "Mark paid"}
    </button>
  )
}
