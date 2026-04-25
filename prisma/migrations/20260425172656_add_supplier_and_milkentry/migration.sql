/*
  Warnings:

  - You are about to drop the `User` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "Session" AS ENUM ('MORNING', 'EVENING');

-- DropTable
DROP TABLE "User";

-- CreateTable
CREATE TABLE "Supplier" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "defaultPrice" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Supplier_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MilkEntry" (
    "id" TEXT NOT NULL,
    "supplierId" TEXT NOT NULL,
    "quantity" DOUBLE PRECISION NOT NULL,
    "fat" DOUBLE PRECISION NOT NULL,
    "price" DOUBLE PRECISION,
    "date" TIMESTAMP(3) NOT NULL,
    "session" "Session" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MilkEntry_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "MilkEntry_date_idx" ON "MilkEntry"("date");

-- CreateIndex
CREATE INDEX "MilkEntry_supplierId_idx" ON "MilkEntry"("supplierId");

-- CreateIndex
CREATE UNIQUE INDEX "MilkEntry_supplierId_date_session_key" ON "MilkEntry"("supplierId", "date", "session");

-- AddForeignKey
ALTER TABLE "MilkEntry" ADD CONSTRAINT "MilkEntry_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "Supplier"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
