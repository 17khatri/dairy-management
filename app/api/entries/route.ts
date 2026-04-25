import { Prisma } from "@prisma/client"
import { NextResponse } from "next/server"

import {
  calculateAppliedPrice,
  calculateTotalAmount,
  isValidSession,
  normalizeDateInput,
  toSafeNumber,
} from "@/lib/dairy"
import { prisma } from "@/lib/prisma"

export const dynamic = "force-dynamic"

export async function GET() {
  const entries = await prisma.milkEntry.findMany({
    orderBy: [{ date: "desc" }, { session: "asc" }, { createdAt: "desc" }],
    include: {
      supplier: true,
    },
  })

  return NextResponse.json({
    entries: entries.map((entry) => {
      const appliedPrice = calculateAppliedPrice(entry.price, entry.supplier.defaultPrice)

      return {
        ...entry,
        appliedPrice,
        totalAmount: calculateTotalAmount(entry.quantity, appliedPrice),
      }
    }),
  })
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as
    | {
        supplierId?: unknown
        date?: unknown
        session?: unknown
        quantity?: unknown
        fat?: unknown
        price?: unknown
      }
    | null

  const supplierId = typeof body?.supplierId === "string" ? body.supplierId.trim() : ""
  const dateValue = typeof body?.date === "string" ? body.date.trim() : ""
  const session = body?.session
  const quantity = toSafeNumber(body?.quantity)
  const fat = toSafeNumber(body?.fat)
  const price = toSafeNumber(body?.price)

  if (!supplierId) {
    return NextResponse.json({ error: "Supplier is required." }, { status: 400 })
  }

  if (!dateValue) {
    return NextResponse.json({ error: "Date is required." }, { status: 400 })
  }

  if (!isValidSession(session)) {
    return NextResponse.json({ error: "Session must be MORNING or EVENING." }, { status: 400 })
  }

  if (quantity === null || quantity <= 0) {
    return NextResponse.json({ error: "Quantity must be greater than zero." }, { status: 400 })
  }

  if (fat === null || fat < 0) {
    return NextResponse.json({ error: "Fat must be a valid number." }, { status: 400 })
  }

  const supplier = await prisma.supplier.findUnique({
    where: {
      id: supplierId,
    },
  })

  if (!supplier) {
    return NextResponse.json({ error: "Supplier not found." }, { status: 404 })
  }

  const appliedPrice = calculateAppliedPrice(price, supplier.defaultPrice)
  const date = normalizeDateInput(dateValue)

  try {
    const entry = await prisma.milkEntry.create({
      data: {
        supplierId,
        date,
        session,
        quantity,
        fat,
        price,
      },
      include: {
        supplier: true,
      },
    })

    return NextResponse.json(
      {
        entry: {
          ...entry,
          appliedPrice,
          totalAmount: calculateTotalAmount(entry.quantity, appliedPrice),
        },
      },
      { status: 201 },
    )
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return NextResponse.json(
        { error: "An entry already exists for that supplier, date, and session." },
        { status: 409 },
      )
    }

    throw error
  }
}
