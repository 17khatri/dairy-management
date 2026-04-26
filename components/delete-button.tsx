"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

type DeleteButtonProps = {
  endpoint: string
  confirmMessage: string
  label?: string
}

export function DeleteButton({
  endpoint,
  confirmMessage,
  label = "Delete",
}: DeleteButtonProps) {
  const router = useRouter()
  const [isDeleting, setIsDeleting] = useState(false)

  async function handleDelete() {
    if (!window.confirm(confirmMessage)) {
      return
    }

    setIsDeleting(true)

    const response = await fetch(endpoint, {
      method: "DELETE",
    })

    const data = (await response.json().catch(() => null)) as
      | { error?: string }
      | null

    setIsDeleting(false)

    if (!response.ok) {
      window.alert(data?.error ?? "Something went wrong while deleting.")
      return
    }

    router.refresh()
  }

  return (
    <button
      type="button"
      disabled={isDeleting}
      onClick={handleDelete}
      className="text-sm font-medium text-red-600 transition hover:text-red-700 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {isDeleting ? "Deleting..." : label}
    </button>
  )
}
