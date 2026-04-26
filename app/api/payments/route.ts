import { NextResponse } from "next/server"

import { prisma } from "@/lib/prisma"

export const dynamic = "force-dynamic"

export async function PATCH(request: Request) {
  const body = (await request.json().catch(() => null)) as
    | { entryIds?: unknown; paid?: unknown }
    | null

  const entryIds = Array.isArray(body?.entryIds)
    ? body.entryIds.filter((value): value is string => typeof value === "string" && value.trim().length > 0)
    : []

  if (entryIds.length === 0) {
    return NextResponse.json({ error: "At least one entry is required." }, { status: 400 })
  }

  if (typeof body?.paid !== "boolean") {
    return NextResponse.json({ error: "Paid must be true or false." }, { status: 400 })
  }

  await prisma.milkEntry.updateMany({
    where: {
      id: {
        in: entryIds,
      },
    },
    data: {
      paidAt: body.paid ? new Date() : null,
    },
  })

  return NextResponse.json({ success: true })
}
