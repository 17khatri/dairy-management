export type SessionValue = "MORNING" | "EVENING"

export type SupplierOption = {
  id: string
  name: string
  defaultPrice: number
}

export type EntryRow = {
  id: string
  date: string
  session: SessionValue
  quantity: number
  fat: number
  price: number | null
  appliedPrice: number
  totalAmount: number
  supplier: {
    id: string
    name: string
    defaultPrice: number
  }
}

const indianCurrency = new Intl.NumberFormat("en-IN", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

const dateFormatter = new Intl.DateTimeFormat("en-IN", {
  day: "2-digit",
  month: "short",
  year: "numeric",
  timeZone: "Asia/Kolkata",
})

export function formatAmount(value: number) {
  return indianCurrency.format(roundToTwo(value))
}

export function formatDate(value: string | Date) {
  const date = typeof value === "string" ? new Date(value) : value
  return dateFormatter.format(date)
}

export function roundToTwo(value: number) {
  return Math.round((value + Number.EPSILON) * 100) / 100
}

export function normalizeDateInput(value: string) {
  return new Date(`${value}T00:00:00.000Z`)
}

export function formatDateInputValue(value: Date = new Date()) {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  })

  const parts = formatter.formatToParts(value)
  const year = parts.find((part) => part.type === "year")?.value ?? "1970"
  const month = parts.find((part) => part.type === "month")?.value ?? "01"
  const day = parts.find((part) => part.type === "day")?.value ?? "01"

  return `${year}-${month}-${day}`
}

export function calculateAppliedPrice(
  overridePrice: number | null | undefined,
  defaultPrice: number,
) {
  return overridePrice ?? defaultPrice
}

export function calculateTotalAmount(quantity: number, appliedPrice: number) {
  return roundToTwo(quantity * appliedPrice)
}

export function isValidSession(value: unknown): value is SessionValue {
  return value === "MORNING" || value === "EVENING"
}

export function toSafeNumber(value: unknown) {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : null
  }

  if (typeof value === "string" && value.trim().length > 0) {
    const parsed = Number(value)
    return Number.isFinite(parsed) ? parsed : null
  }

  return null
}
