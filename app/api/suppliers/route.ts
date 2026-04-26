import { NextResponse } from "next/server"

import { prisma } from "@/lib/prisma"
import {
  isValidPaymentSchedule,
  toSafeNumber,
} from "@/lib/dairy"

export const dynamic = "force-dynamic"

export async function GET() {
  const suppliers = await prisma.supplier.findMany({
    orderBy: [{ createdAt: "desc" }],
    include: {
      _count: {
        select: {
          entries: true,
        },
      },
    },
  })

  return NextResponse.json({
    suppliers,
  })
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as
    | {
        name?: unknown
        defaultPrice?: unknown
        paymentSchedule?: unknown
      }
    | null

  const name = typeof body?.name === "string" ? body.name.trim() : ""
  const defaultPrice = toSafeNumber(body?.defaultPrice)
  const paymentSchedule = body?.paymentSchedule

  if (!name) {
    return NextResponse.json({ error: "Supplier name is required." }, { status: 400 })
  }

  if (defaultPrice === null) {
    return NextResponse.json(
      { error: "Default price must be a valid number." },
      { status: 400 },
    )
  }

  if (!isValidPaymentSchedule(paymentSchedule)) {
    return NextResponse.json(
      { error: "Payment schedule must be DAILY or TEN_DAYS." },
      { status: 400 },
    )
  }

  const supplier = await prisma.supplier.create({
    data: {
      name,
      defaultPrice,
      paymentSchedule,
    },
  })

  return NextResponse.json({ supplier }, { status: 201 })
}
