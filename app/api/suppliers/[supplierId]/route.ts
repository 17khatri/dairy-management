import { Prisma } from "@prisma/client"
import { NextResponse } from "next/server"

import {
  isValidPaymentSchedule,
  toSafeNumber,
} from "@/lib/dairy"
import { prisma } from "@/lib/prisma"

export const dynamic = "force-dynamic"

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ supplierId: string }> },
) {
  const { supplierId } = await params
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

  try {
    const supplier = await prisma.supplier.update({
      where: {
        id: supplierId,
      },
      data: {
        name,
        defaultPrice,
        paymentSchedule,
      },
    })

    return NextResponse.json({ supplier })
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
      return NextResponse.json({ error: "Supplier not found." }, { status: 404 })
    }

    throw error
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ supplierId: string }> },
) {
  const { supplierId } = await params

  try {
    await prisma.supplier.delete({
      where: {
        id: supplierId,
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2025") {
        return NextResponse.json({ error: "Supplier not found." }, { status: 404 })
      }

      if (error.code === "P2003") {
        return NextResponse.json(
          { error: "Delete this supplier's entries first before deleting the supplier." },
          { status: 409 },
        )
      }
    }

    throw error
  }
}
