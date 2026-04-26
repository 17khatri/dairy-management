export type SessionValue = "MORNING" | "EVENING"
export type PaymentScheduleValue = "DAILY" | "TEN_DAYS"

export type SupplierOption = {
  id: string
  name: string
  defaultPrice: number
  paymentSchedule: PaymentScheduleValue
}

export type EntryRow = {
  id: string
  date: string
  session: SessionValue
  quantity: number
  fat: number
  price: number | null
  paymentSchedule: PaymentScheduleValue
  appliedPrice: number
  totalAmount: number
  paidAt: string | null
  supplier: {
    id: string
    name: string
    defaultPrice: number
  }
}

export type PaymentGroupSummary = {
  id: string
  supplierId: string
  supplierName: string
  paymentSchedule: PaymentScheduleValue
  startDate: Date
  endDate: Date
  entries: Array<{
    id: string
    date: Date
    session: SessionValue
    quantity: number
    fat: number
    appliedPrice: number
    totalAmount: number
    paidAt: Date | null
  }>
  totalAmount: number
  isPaid: boolean
  paidAt: Date | null
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

export function formatPaymentSchedule(schedule: PaymentScheduleValue) {
  return schedule === "DAILY" ? "Daily" : "Every 10 days"
}

export function roundToTwo(value: number) {
  return Math.round((value + Number.EPSILON) * 100) / 100
}

export function normalizeDateInput(value: string) {
  return new Date(`${value}T00:00:00.000Z`)
}

export function getDateRangeForInput(value: string) {
  const startDate = normalizeDateInput(value)
  const endDate = addDays(startDate, 1)

  return {
    startDate,
    endDate,
  }
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

export function cloneDateAtUtcMidnight(value: string | Date) {
  const date = typeof value === "string" ? new Date(value) : new Date(value.getTime())
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()))
}

export function addDays(value: string | Date, days: number) {
  const nextDate = cloneDateAtUtcMidnight(value)
  nextDate.setUTCDate(nextDate.getUTCDate() + days)
  return nextDate
}

export function getTenDayWindow(start: string | Date) {
  const startDate = cloneDateAtUtcMidnight(start)
  const endDate = addDays(startDate, 9)
  return {
    startDate,
    endDate,
  }
}

export function isDateWithinWindow(
  value: string | Date,
  startDate: Date,
  endDate: Date,
) {
  const currentDate = cloneDateAtUtcMidnight(value).getTime()
  return currentDate >= startDate.getTime() && currentDate <= endDate.getTime()
}

export function groupEntriesForPayments(
  entries: Array<{
    id: string
    date: Date
    session: SessionValue
    quantity: number
    fat: number
    price: number | null
    paymentSchedule: PaymentScheduleValue
    paidAt: Date | null
    supplier: {
      id: string
      name: string
      defaultPrice: number
    }
  }>,
) {
  const supplierBuckets = new Map<string, typeof entries>()

  for (const entry of entries) {
    const existing = supplierBuckets.get(entry.supplier.id)
    if (existing) {
      existing.push(entry)
    } else {
      supplierBuckets.set(entry.supplier.id, [entry])
    }
  }

  const groups: PaymentGroupSummary[] = []

  for (const supplierEntries of supplierBuckets.values()) {
    const sortedEntries = [...supplierEntries].sort(
      (left, right) => left.date.getTime() - right.date.getTime(),
    )

    if (sortedEntries.length === 0) {
      continue
    }

    const supplier = sortedEntries[0].supplier
    let currentSchedule: PaymentScheduleValue | null = null
    let currentWindow = getTenDayWindow(sortedEntries[0].date)
    let currentEntries: PaymentGroupSummary["entries"] = []
    let currentGroupId = ""

    function pushGroup() {
      if (currentEntries.length === 0 || currentSchedule === null) {
        return
      }

      const paidEntries = currentEntries.filter((entry) => entry.paidAt)
      const isPaid = paidEntries.length === currentEntries.length

      groups.push({
        id: currentGroupId,
        supplierId: supplier.id,
        supplierName: supplier.name,
        paymentSchedule: currentSchedule,
        startDate: currentWindow.startDate,
        endDate: currentWindow.endDate,
        entries: currentEntries,
        totalAmount: roundToTwo(
          currentEntries.reduce((sum, entry) => sum + entry.totalAmount, 0),
        ),
        isPaid,
        paidAt: isPaid ? paidEntries[paidEntries.length - 1]?.paidAt ?? null : null,
      })
    }

    for (const entry of sortedEntries) {
      const appliedPrice = calculateAppliedPrice(entry.price, supplier.defaultPrice)
      const normalizedEntry = {
        id: entry.id,
        date: entry.date,
        session: entry.session,
        quantity: entry.quantity,
        fat: entry.fat,
        appliedPrice,
        totalAmount: calculateTotalAmount(entry.quantity, appliedPrice),
        paidAt: entry.paidAt,
      }

      if (entry.paymentSchedule === "DAILY") {
        pushGroup()
        groups.push({
          id: entry.id,
          supplierId: supplier.id,
          supplierName: supplier.name,
          paymentSchedule: entry.paymentSchedule,
          startDate: cloneDateAtUtcMidnight(entry.date),
          endDate: cloneDateAtUtcMidnight(entry.date),
          entries: [normalizedEntry],
          totalAmount: normalizedEntry.totalAmount,
          isPaid: Boolean(entry.paidAt),
          paidAt: entry.paidAt,
        })
        currentSchedule = null
        currentEntries = []
        continue
      }

      if (
        currentSchedule !== "TEN_DAYS" ||
        !isDateWithinWindow(entry.date, currentWindow.startDate, currentWindow.endDate)
      ) {
        pushGroup()
        currentSchedule = "TEN_DAYS"
        currentWindow = getTenDayWindow(entry.date)
        currentEntries = []
        currentGroupId = `${supplier.id}-${currentWindow.startDate.toISOString()}`
      }

      currentEntries.push(normalizedEntry)
    }

    pushGroup()
  }

  return groups.sort((left, right) => {
    if (left.supplierName !== right.supplierName) {
      return left.supplierName.localeCompare(right.supplierName)
    }

    return right.startDate.getTime() - left.startDate.getTime()
  })
}

export function isValidPaymentSchedule(value: unknown): value is PaymentScheduleValue {
  return value === "DAILY" || value === "TEN_DAYS"
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
